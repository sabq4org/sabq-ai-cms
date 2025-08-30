/**
 * Server Timing measurement utilities for Phase-2 optimization
 * Measures db/cache/render layers with strict logging
 */

export interface TimingMeasurement {
  name: string;
  duration: number;
  description?: string;
}

export class ServerTiming {
  private timings: Map<string, number> = new Map();
  private measurements: TimingMeasurement[] = [];

  start(name: string): void {
    this.timings.set(name, performance.now());
  }

  end(name: string, description?: string): number {
    const startTime = this.timings.get(name);
    if (!startTime) {
      console.warn(`⚠️ No start time found for timing: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.push({ name, duration, description });

    // Log warning for slow operations
    if (name === 'db' && duration > 120) {
      console.warn(`🐌 SLOW DB QUERY: ${duration.toFixed(2)}ms - ${description || 'unknown query'}`);
    }

    return duration;
  }

  getHeaderValue(): string {
    return this.measurements
      .map(m => `${m.name};dur=${m.duration.toFixed(2)}${m.description ? `;desc="${m.description}"` : ''}`)
      .join(', ');
  }

  clear(): void {
    this.timings.clear();
    this.measurements = [];
  }

  getMeasurements(): TimingMeasurement[] {
    return [...this.measurements];
  }
}

// Singleton for request-scoped timing
let currentTiming: ServerTiming | null = null;

export const timing = {
  start: (name: string) => {
    if (!currentTiming) currentTiming = new ServerTiming();
    currentTiming.start(name);
  },

  end: (name: string, description?: string) => {
    if (!currentTiming) return 0;
    return currentTiming.end(name, description);
  },

  getHeader: () => {
    if (!currentTiming) return '';
    return currentTiming.getHeaderValue();
  },

  clear: () => {
    currentTiming = null;
  },

  getMeasurements: () => {
    if (!currentTiming) return [];
    return currentTiming.getMeasurements();
  }
};

// Middleware helper to add Server-Timing header
export const withServerTiming = (handler: any) => {
  return async (req: any, res: any) => {
    timing.clear();
    
    try {
      const result = await handler(req, res);
      
      // Add Server-Timing header
      const timingHeader = timing.getHeader();
      if (timingHeader && res.setHeader) {
        res.setHeader('Server-Timing', timingHeader);
      }
      
      // Log measurements
      const measurements = timing.getMeasurements();
      if (measurements.length > 0) {
        console.log('📊 Request Timings:', measurements.map(m => 
          `${m.name}: ${m.duration.toFixed(2)}ms`
        ).join(', '));
      }
      
      return result;
    } finally {
      timing.clear();
    }
  };
};
