// Legacy app: Sentry must stay off (2026-11-07). Run with `npm run test:sentry`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/_layout.tsx", import.meta.url), "utf8");
const init = layout.match(/Sentry\.init\(\{([\s\S]*?)\}\);/);

test("Sentry.init is called exactly once, in app/_layout.tsx", () => {
  assert.ok(init, "Sentry.init not found");
  assert.equal(layout.match(/Sentry\.init\(/g).length, 1);
});

test("the SDK is disabled, native included, with no tracing", () => {
  const opts = init[1];
  assert.match(opts, /^\s*enabled:\s*false,/m);
  assert.match(opts, /^\s*enableNative:\s*false,/m);
  assert.match(opts, /^\s*tracesSampleRate:\s*0,/m);
  assert.doesNotMatch(opts, /profilesSampleRate:\s*[^0\s]/);
  assert.doesNotMatch(opts, /replaysSessionSampleRate|replaysOnErrorSampleRate|mobileReplayIntegration|enableLogs/);
});
