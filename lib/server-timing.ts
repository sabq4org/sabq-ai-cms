// Lightweight server-timing helper for Next.js (API routes / route handlers)
type TimerName = 'db' | 'cache' | 'render' | 'external';

export class ServerTimer {
  private marks = new Map<TimerName, number>();
  private durs: Record<string, number> = {};

  start(name: TimerName) {
    this.marks.set(name, performance.now());
  }
  end(name: TimerName) {
    const t0 = this.marks.get(name);
    if (t0 !== undefined) this.durs[name] = Math.max(0, performance.now() - t0);
  }
  header() {
    const parts = Object.entries(this.durs).map(([k, v]) => `${k};dur=${v.toFixed(1)}`);
    return parts.join(', ');
  }
}

export function withServerTiming<T = any>(
  fn: (timer: ServerTimer) => Promise<T> | T,
  setHeader?: (key: string, val: string) => void
) {
  return async () => {
    const timer = new ServerTimer();
    const result = await fn(timer);
    if (setHeader) setHeader('Server-Timing', timer.header());
    return result;
  };
}
