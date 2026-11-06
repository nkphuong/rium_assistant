import { test } from "node:test";
import assert from "node:assert/strict";
import { greeting, dayKey, shouldAutoOpen } from "./talk.js";

test("greeting by hour", () => {
  const night = "Khuya rồi, bạn vẫn còn thức à?";
  const late = "Muộn rồi, mình kể nhanh nhé.";
  const cases = [
    [0, night], [4, night],
    [5, "Chào buổi sáng!"], [10, "Chào buổi sáng!"],
    [11, "Chào buổi trưa!"], [12, "Chào buổi trưa!"],
    [13, "Chào buổi chiều!"], [17, "Chào buổi chiều!"],
    [18, "Chào buổi tối!"], [21, "Chào buổi tối!"],
    [22, late], [23, late],
  ];
  for (const [h, s] of cases) assert.equal(greeting(h), s, `hour ${h}`);
});

test("dayKey is local YYYY-MM-DD", () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("shouldAutoOpen once per day, never when storage unavailable", () => {
  assert.equal(shouldAutoOpen(null, "2026-11-06"), true);
  assert.equal(shouldAutoOpen("2026-11-05", "2026-11-06"), true);
  assert.equal(shouldAutoOpen("2026-11-06", "2026-11-06"), false);
  assert.equal(shouldAutoOpen("unavailable", "2026-11-06"), false);
});
