const KEY = "bot.greeted";

// Lower bound inclusive; first row whose bound exceeds the hour ends the search.
const BANDS = [
  [5, "Khuya rồi, bạn vẫn còn thức à?"],
  [11, "Chào buổi sáng!"],
  [13, "Chào buổi trưa!"],
  [18, "Chào buổi chiều!"],
  [22, "Chào buổi tối!"],
  [24, "Muộn rồi, mình kể nhanh nhé."],
];

export const greeting = (hour) => BANDS.find(([end]) => hour < end)[1];

export function dayKey(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const shouldAutoOpen = (lastGreeted, today) =>
  lastGreeted !== today && lastGreeted !== "unavailable";

export function readGreeted() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "unavailable";
  }
}

export function markGreeted(today) {
  try {
    localStorage.setItem(KEY, today);
  } catch {}
}
