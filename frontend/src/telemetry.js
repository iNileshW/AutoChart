import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

function post(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });
  const url = "api/telemetry";
  // sendBeacon works during page unload and is the recommended transport
  // for web-vitals reports.
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function reportWebVitals(reporter = post) {
  onCLS(reporter);
  onINP(reporter);
  onLCP(reporter);
  onFCP(reporter);
  onTTFB(reporter);
}
