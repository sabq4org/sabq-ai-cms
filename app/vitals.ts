export function reportWebVitals(metric: any) {
  try {
    navigator.sendBeacon && navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
  } catch {
    fetch('/api/vitals', { method: 'POST', body: JSON.stringify(metric), keepalive: true });
  }
}


