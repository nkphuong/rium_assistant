import { call } from "./api.js";

const view = document.getElementById("view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function stamp(count) {
  const t = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("stamp").textContent = `${count} bể · cập nhật lúc ${t}`;
}

const tankCard = (o) =>
  `<button class="tank-card" data-tank="${o.tank.id}"><b>${esc(o.tank.name)}</b><span>${esc(o.status)}</span></button>`;

async function home() {
  const [tanks, bubbles] = await Promise.all([call("list_tanks"), call("get_briefing")]);
  stamp(tanks.length);
  const half = Math.ceil(tanks.length / 2);
  view.innerHTML = `
    <section class="home">
      <h1 class="sr-only">Các bể của bạn</h1>
      <div class="strip">
        ${tanks.slice(0, half).map(tankCard).join("")}
        <div class="core" aria-hidden="true"><i class="halo"></i><i class="ring"></i><i class="ring2"></i><i class="dot"></i></div>
        ${tanks.slice(half).map(tankCard).join("")}
        <div class="pointer" aria-hidden="true"></div>
      </div>
      <div class="talk" aria-live="polite">
        ${bubbles.map((b, i) => `<p class="say" style="--i:${i}"><span class="who">Bọt</span>${esc(b.text)}</p>`).join("")}
      </div>
      <div class="home-actions"><button class="pill" data-action="add-tank">Thêm bể</button></div>
    </section>`;
  point(bubbles);
}

// When a bubble names a tank, draw a line from the core to that tank as the bubble appears.
function point(bubbles) {
  const strip = view.querySelector(".strip");
  const line = strip.querySelector(".pointer");
  const core = strip.querySelector(".core").getBoundingClientRect();
  let first = true;
  bubbles.forEach((b, i) => {
    if (b.tank_id == null) return;
    const show = () => {
      const card = strip.querySelector(`[data-tank="${b.tank_id}"]`);
      if (!card) return;
      const r = card.getBoundingClientRect(), s = strip.getBoundingClientRect();
      const left = r.right < core.left;
      const from = left ? r.right : core.right, to = left ? core.left : r.left;
      line.classList.remove("on");
      Object.assign(line.style, { left: `${from - s.left + strip.scrollLeft}px`, width: `${to - from}px`, transformOrigin: left ? "right" : "left" });
      requestAnimationFrame(() => line.classList.add("on"));
    };
    if (!reduced) setTimeout(show, 300 + i * 700 + 450);
    else if (first) show(); // no travel: just mark the first tank named
    first = false;
  });
  view.querySelector(".talk").addEventListener("click", (e) => e.currentTarget.classList.add("all"), { once: true });
}

async function tankPage(id) {
  // Filled in by the detail-page task.
  const { tank } = await call("get_tank", { id });
  view.innerHTML = `<section class="home"><a href="#/" class="link-btn">← Các bể</a><h1>${esc(tank.name)}</h1></section>`;
}

async function route() {
  const [, page, id] = location.hash.split("/");
  try {
    if (page === "tank") await tankPage(Number(id));
    else await home();
  } catch (e) {
    view.innerHTML = `<section class="home"><p class="say" style="opacity:1;transform:none">${esc(e)}</p></section>`;
  }
}

view.addEventListener("click", (e) => {
  const card = e.target.closest("[data-tank]");
  if (card) location.hash = `#/tank/${card.dataset.tank}/overview`;
});
addEventListener("hashchange", route);
route();
