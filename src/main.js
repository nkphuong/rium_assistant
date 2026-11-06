import { call } from "./api.js";

const view = document.getElementById("view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const KIND = { fish: "Hồ cá", planted: "Hồ thủy sinh", terrarium: "Terrarium", paludarium: "Paludarium" };
const PURPOSE = { filter: "Lọc", light: "Đèn", heater: "Sưởi", co2: "CO2", plug: "Ổ cắm", sensor: "Cảm biến", other: "Khác" };
const LINK = { tuya: "Tuya/Smart Life", bluetooth: "Bluetooth", wifi: "Wifi", none: "Không thông minh" };
const LAYER = { carpet: "Trải nền", foreground: "Tiền cảnh", midground: "Trung cảnh", background: "Hậu cảnh", unknown: "Không rõ" };

function stamp(count) {
  const t = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("stamp").textContent = `${count} bể · cập nhật lúc ${t}`;
}

/* ---------- Home ---------- */

// A tank-shaped tile: glass with water line, substrate and a few decorative stems, then name and status line.
function tankTile(o) {
  const t = o.tank;
  const stems = Array.from({ length: 3 + (t.id % 3) }, (_, k) =>
    `<i style="left:${18 + k * 44 + ((t.id * 13) % 17)}px;height:${18 + ((k * 7 + t.id * 5) % 22)}px"></i>`).join("");
  const line = [KIND[t.kind], sizeLine(t)].filter(Boolean).join(" · ");
  return `<button class="tank-tile" type="button" data-tank="${t.id}"><span class="glass" aria-hidden="true">${stems}</span>
    <span class="meta"><b>${esc(t.name)}</b><span><i class="dot ${o.missing.length ? "warn" : "ok"}" title="${esc(o.status)}"></i>${esc(line)}</span></span></button>`;
}

async function home() {
  const tanks = await call("list_tanks");
  stamp(tanks.length);
  view.innerHTML = `
    <section class="home2">
      <h1 class="sr-only">Các bể của bạn</h1>
      <button class="core" type="button" aria-label="Nói chuyện với Bọt"><i class="halo" aria-hidden="true"></i>${HUD}</button>
      <p class="hint">Bấm để nghe Bọt</p>
      <div class="tanks">${tanks.map(tankTile).join("")}<button class="tank-tile add" type="button" data-add="tank"><span class="glass">+ Thêm bể</span></button></div>
      <section class="talk-space" aria-live="polite"></section>
      <button class="close-talk" type="button">Về các bể</button>
    </section>`;
  hud(view.querySelector(".core"));
}

// Irregular dash patterns so no layer reads as a perfect ring.
const plane = (cls, body) => `<svg class="${cls}" viewBox="-66 -66 132 132">${body}</svg>`;
// Each ring plane: resting tilt x, y (degrees), spin speed (degrees per second), drawing.
const RINGS = [
  [0, 0, -5, `<circle r="42" stroke-width="4" opacity=".4" stroke-dasharray="0.8 2.4 0.8 2.4 0.8 2.4 0.8 2.4 0.8 2.4 0.8 2.4 0.8 2.4 0.8 2.4 0.8 30"/>`],
  [40, -35, 6, `<circle r="61" stroke-width="1.5" opacity=".7" stroke-dasharray="150 8 200 25"/>`],
  [-65, 15, 11, `<circle r="64" stroke-width="2.5" opacity=".65" stroke-dasharray="3 3 3 3 3 3 60 12 30 18 3 3 3 3 90 40"/>`],
  [60, 0, -9, `<circle r="56" stroke-width="5" opacity=".6" stroke-dasharray="1.2 2.6 1.2 2.6 1.2 2.6 1.2 2.6 1.2 2.6 1.2 2.6 1.2 24 1.2 2.6 1.2 2.6 1.2 2.6 1.2 40 1.2 2.6 1.2 60"/>`],
  [-20, -60, -18, `<circle r="52" stroke-width="5" opacity=".85" stroke-dasharray="10 70 4 40 18 95 6 84"/>`],
  [18, 62, 14, `<circle r="48" stroke-width="3" opacity=".9" stroke-dasharray="34 6 6 6 52 14 3 9 20 40 8 6"/>`],
  [35, -70, -33, `<circle r="44" stroke-width="1.5" opacity=".75" stroke-dasharray="70 8 2 8 2 8 40 138"/>`],
  [75, 40, -26, `<circle r="36" stroke-width="3" stroke-linecap="round" opacity=".8" stroke-dasharray="0 7"/>`],
  [-52, 28, 40, `<circle r="30" stroke-width="2.5" opacity="1" stroke-dasharray="36 10 10 132.5"/>`],
  [10, -45, -60, `<circle r="24" stroke-width="2" opacity=".85" stroke-dasharray="20 8 6 116.8"/>`],
  [60, 60, 55, `<circle cy="-44" r="3" fill="currentColor" stroke="none"/>`], // a satellite
];
const HUD = `<div class="hud">
  ${RINGS.map((r) => plane("ring", r[3])).join("")}
  ${plane("l-face", `<defs><radialGradient id="sphere" cx="0.4" cy="0.36" r="0.7">
      <stop offset="0" stop-color="#e08a3c"/><stop offset="0.5" stop-color="#c85a06"/><stop offset="1" stop-color="#6e2c00"/>
    </radialGradient></defs><path class="l-voice"/><circle class="l-dot" r="11" fill="url(#sphere)"/>`)}
</div>`;

// Spins each ring in its own tilted plane at a drifting speed, lets the tilts sway, and bends the voice ring
// by --amp, until the core leaves the page.
function hud(core) {
  const box = core?.querySelector(".hud");
  if (!box) return;
  const planes = box.querySelectorAll(".ring");
  const layers = RINGS.map(([tx, ty, base], i) => ({ el: planes[i], tx, ty, base, a: i * 70, p: i * 2.1 }));
  const voice = box.querySelector(".l-voice"), dot = box.querySelector(".l-dot");
  let last = performance.now();
  const draw = (t) => {
    const s = t / 1000, dt = Math.min(t - last, 50) / 1000, amp = Number(core.style.getPropertyValue("--amp") || 0);
    last = t;
    for (const l of layers) {
      const surge = 1 + 0.7 * Math.sin(s * 0.37 + l.p) * Math.sin(s * 0.91 + l.p * 1.7); // speeds drift in and out of step
      l.a += l.base * (surge + amp * 2.5) * dt;
      const x = l.tx + 9 * Math.sin(s * 0.23 + l.p), y = l.ty + 11 * Math.sin(s * 0.17 + l.p * 1.3); // the planes sway
      l.el.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg) rotateZ(${l.a.toFixed(2)}deg)`;
    }
    let d = "";
    for (let i = 0; i < 72; i++) {
      const th = (i / 72) * Math.PI * 2;
      const n = 0.5 * Math.sin(3 * th + s * 1.3) + 0.3 * Math.sin(5 * th - s * 2.1 + 1) + 0.2 * Math.sin(9 * th + s * 3.7);
      const r = 38 + n * (0.8 + amp * 6);
      d += `${i ? "L" : "M"}${(r * Math.cos(th)).toFixed(2)} ${(r * Math.sin(th)).toFixed(2)}`;
    }
    voice.setAttribute("d", d + "Z");
    dot.setAttribute("r", (11 * (1 + amp * 0.5)).toFixed(2));
  };
  if (reduced) return draw(0); // still picture, no turning
  const frame = (t) => { if (core.isConnected) { draw(t); requestAnimationFrame(frame); } };
  requestAnimationFrame(frame);
}

// Drives --amp (0..1) with a fake voice: a new syllable level every 70-130ms, sometimes a pause.
function speak(core, ms) {
  if (reduced || !core) return;
  core.classList.add("speaking");
  const end = performance.now() + ms;
  let amp = 0, target = 0, next = 0;
  const tick = (t) => {
    if (t > next) {
      target = t > end || Math.random() < 0.15 ? 0 : 0.25 + Math.random() * 0.75;
      next = t + 70 + Math.random() * 60;
    }
    amp += (target - amp) * 0.25;
    core.style.setProperty("--amp", amp.toFixed(3));
    if (t < end || amp > 0.01) requestAnimationFrame(tick);
    else { core.classList.remove("speaking"); core.style.removeProperty("--amp"); }
  };
  requestAnimationFrame(tick);
}

/* ---------- Forms ---------- */

// Fields per record type: [key, label, input type or select options, extra attributes]
const SIZE = 'min="0.1" step="any"';
const FORMS = {
  tank: { cmd: "save_tank", arg: "tank", title: ["Thêm bể", "Sửa bể"], fields: [
    ["name", "Tên bể", "text", "required"], ["kind", "Loại bể", KIND],
    ["length_cm", "Dài (cm)", "number", SIZE], ["width_cm", "Rộng (cm)", "number", SIZE], ["height_cm", "Cao (cm)", "number", SIZE],
    ["volume_l", "Thể tích (lít)", "number", SIZE], ["setup_date", "Ngày setup", "date"], ["notes", "Ghi chú", "textarea"]],
    groups: [["Bể là gì", ["name", "kind"]], ["Kích thước", ["length_cm", "width_cm", "height_cm", "volume_l"], "cols3"],
      ["Lịch sử", ["setup_date", "notes"]]] },
  device: { cmd: "save_device", arg: "device", title: ["Thêm thiết bị", "Sửa thiết bị"], fields: [
    ["name", "Tên thiết bị", "text", "required"], ["purpose", "Công dụng", PURPOSE], ["connection", "Kết nối", LINK],
    ["brand", "Hãng", "text"], ["model", "Model", "text"], ["purchase_date", "Ngày mua", "date"], ["notes", "Ghi chú", "textarea"]] },
  animal: { cmd: "save_animal", arg: "animal", title: ["Thêm sinh vật", "Sửa sinh vật"], fields: [
    ["species", "Tên loài", "text", "required"], ["count", "Số lượng", "number", 'required min="1" step="1"'], ["notes", "Ghi chú", "textarea"]] },
  plant: { cmd: "save_plant", arg: "plant", title: ["Thêm cây", "Sửa cây"], fields: [
    ["name", "Tên cây", "text", "required"], ["layer", "Lớp cảnh", LAYER], ["notes", "Ghi chú", "textarea"]] },
};

function field([key, label, type, extra = ""], value) {
  const id = `f-${key}`;
  if (typeof type === "object") // few fixed choices: a segmented radio group instead of a dropdown
    return `<fieldset class="f seg"><legend>${label}</legend><div class="opts">${Object.entries(type).map(([v, l]) =>
      `<label><input type="radio" name="${key}" value="${v}"${v === value ? " checked" : ""}><span>${l}</span></label>`).join("")}</div></fieldset>`;
  const input = type === "textarea"
    ? `<textarea id="${id}" name="${key}" rows="3" placeholder="Không bắt buộc">${esc(value)}</textarea>`
    : `<input id="${id}" name="${key}" type="${type}" value="${esc(value)}" ${extra} aria-describedby="form-error">`;
  return `<div class="f"><label for="${id}">${label}</label>${input}</div>`;
}

/** One form value for the core. Throws a Vietnamese message for numbers the core cannot even parse. */
function readField(form, [key, label, type, extra = ""]) {
  const raw = form.elements[key].value.trim();
  const required = extra.includes("required");
  if (type !== "number") return raw === "" && !required ? null : raw; // required text stays "" for the core's message
  if (raw === "") {
    if (required) throw `${label} không được để trống`;
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) throw `${label} phải là một số`;
  if (key === "count" && !Number.isInteger(n)) throw "Số lượng phải là số nguyên";
  return n;
}

/** Opens the add/edit dialog; resolves to the saved record, or null if cancelled. */
function openForm(type, record) {
  const spec = FORMS[type], dlg = document.getElementById("form");
  const byKey = Object.fromEntries(spec.fields.map((f) => [f[0], f]));
  const groups = (spec.groups ?? [[null, Object.keys(byKey)]]).map(([title, keys, cls = ""]) =>
    `<div class="grp ${cls}">${title ? `<h3>${title}</h3>` : ""}${keys.map((k) => field(byKey[k], record[k])).join("")}</div>`);
  dlg.innerHTML = `<form class="drawer" novalidate>
      <h2 id="form-title">${spec.title[record.id == null ? 0 : 1]}</h2>
      <div class="fields">${groups.join("")}</div>
      <p id="form-error" class="error" role="alert"></p>
      <div class="actions"><button type="button" class="pill" data-cancel>Hủy</button><button class="pill primary">Lưu</button></div>
    </form>`;
  const form = dlg.querySelector("form"), save = form.querySelector(".primary");
  const vol = form.elements.volume_l;
  if (vol) { // show the estimate the detail page will use while the volume is left empty
    const hint = () => {
      const dims = ["length_cm", "width_cm", "height_cm"].map((k) => Number(form.elements[k].value));
      vol.placeholder = dims.every((n) => n > 0) ? `≈ ${litres(dims)} lít ước tính — để trống nếu đúng` : "";
    };
    form.addEventListener("input", hint);
    hint();
  }
  return new Promise((resolve) => {
    dlg.onclose = () => resolve(null);
    form.querySelector("[data-cancel]").onclick = () => dlg.close();
    form.onsubmit = async (e) => {
      e.preventDefault();
      save.disabled = true; // a second click must not save twice
      try {
        const values = Object.fromEntries(spec.fields.map((f) => [f[0], readField(form, f)]));
        const saved = await call(spec.cmd, { [spec.arg]: { ...record, ...values } });
        dlg.onclose = null;
        dlg.close();
        resolve(saved);
      } catch (err) {
        form.querySelector("#form-error").textContent = err;
        save.disabled = false;
      }
    };
    dlg.showModal();
  });
}

function confirmDelete(text) {
  const dlg = document.getElementById("confirm");
  dlg.innerHTML = `<form method="dialog" class="sheet"><p id="confirm-text">${esc(text)}</p>
    <div class="actions"><button class="pill" value="no">Hủy</button><button class="pill danger" value="yes">Xóa</button></div></form>`;
  dlg.returnValue = "";
  dlg.showModal();
  return new Promise((resolve) => dlg.addEventListener("close", () => resolve(dlg.returnValue === "yes"), { once: true }));
}

/* ---------- Tank detail ---------- */

const TABS = { overview: "Tổng quan", devices: "Thiết bị", animals: "Sinh vật", plants: "Cây" };
const daysSince = (d) => Math.floor((Date.now() - new Date(d + "T00:00:00")) / 86400000);

const litres = ([l, w, h]) => Math.round((l * w * h) / 1000); // glass volume, no allowance for substrate

function sizeLine(t) {
  const dims = [t.length_cm, t.width_cm, t.height_cm];
  const full = dims.every((v) => v != null);
  const parts = full ? [`${dims.join(" × ")} cm`] : [];
  if (t.volume_l != null) parts.push(`${t.volume_l} L`);
  else if (full) parts.push(`≈ ${litres(dims)} L (ước tính)`);
  return parts.join(" · ");
}

const stat = (label, value, sub) => `<div class="stat"><small>${label}</small><b>${value}</b><em>${sub}</em></div>`;

function overviewTab(d, o) {
  const age = d.tank.setup_date
    ? stat("Ngày setup", `${daysSince(d.tank.setup_date)} ngày`, esc(d.tank.setup_date))
    : stat("Ngày setup", "—", "chưa nhập");
  return `<div class="stats num">
      ${stat("Thiết bị", o.devices, o.devices ? "đang ghi chép" : "chưa có")}
      ${stat("Sinh vật", o.animals, `${o.species} loài`)}
      ${stat("Cây", o.plants, o.plants ? "loại cây" : "chưa có")}
      ${age}
    </div>
    <p class="profile">Hồ sơ: ${esc(o.status)}</p>
    ${d.tank.notes ? `<p class="notes">${esc(d.tank.notes)}</p>` : ""}`;
}

// tab -> [record type, empty text, main line, detail line]
const LISTS = {
  devices: ["device", "Chưa có thiết bị nào.", (r) => r.name,
    (r) => [r.brand, r.model, PURPOSE[r.purpose], LINK[r.connection]].filter(Boolean).join(" · ")],
  animals: ["animal", "Chưa có sinh vật nào.", (r) => r.species, (r) => `${r.count} con`],
  plants: ["plant", "Chưa có cây nào.", (r) => r.name, (r) => LAYER[r.layer]],
};

function listTab(d, tab) {
  const [type, empty, main, sub] = LISTS[tab];
  const rows = d[tab].map((r) => `<li class="row"><div><b>${esc(main(r))}</b><span>${esc(sub(r))}</span></div>
      <div class="row-actions"><button class="link-btn" data-edit="${type}" data-id="${r.id}">Sửa</button>
      <button class="link-btn" data-del="${type}" data-id="${r.id}">Xóa</button></div></li>`).join("");
  return `${rows ? `<ul class="rows">${rows}</ul>` : `<p class="empty">${empty}</p>`}
    <button class="pill add" data-add="${type}">${FORMS[type].title[0]}</button>`;
}

let current = null; // the tank detail on screen, for edit/delete lookups

async function tankPage(id, tab) {
  if (!TABS[tab]) tab = "overview";
  const [d, all] = await Promise.all([call("get_tank", { id }), call("list_tanks")]);
  const o = all.find((x) => x.tank.id === id);
  current = d;
  stamp(all.length);
  const size = sizeLine(d.tank);
  view.innerHTML = `
    <section class="detail">
      <a href="#/" class="link-btn back">← Các bể</a>
      <header class="dhead">
        <div class="mini" aria-hidden="true"><i></i><i></i></div>
        <div class="dtitle"><h1>${esc(d.tank.name)}</h1><p>${KIND[d.tank.kind]}${size ? " · " + size : ""}</p></div>
        <div class="dactions"><button class="pill" data-edit="tank" data-id="${id}">Sửa bể</button><button class="pill" data-del="tank" data-id="${id}">Xóa bể</button></div>
      </header>
      <nav class="tabs" aria-label="Mục của bể">${Object.entries(TABS).map(([k, l]) =>
        `<a href="#/tank/${id}/${k}"${k === tab ? ' class="on" aria-current="page"' : ""}>${l}</a>`).join("")}<span class="soon">Lịch sử · sắp có</span></nav>
      <div class="pane">${tab === "overview" ? overviewTab(d, o) : listTab(d, tab)}</div>
    </section>`;
}

/* ---------- Routing and actions ---------- */

async function route() {
  const [, page, id, tab] = location.hash.split("/");
  try {
    if (page === "tank" && Number.isInteger(Number(id))) await tankPage(Number(id), tab);
    else { current = null; await home(); }
  } catch (e) {
    view.innerHTML = `<section class="detail"><p class="error">${esc(e)}</p><a class="link-btn" href="#/">← Các bể</a></section>`;
  }
}

const LIST_OF = { device: "devices", animal: "animals", plant: "plants" };
const blank = (type) => ({
  tank: { id: null, name: "", kind: "fish" },
  device: { id: null, tank_id: current?.tank.id, name: "", purpose: "filter", connection: "none" },
  animal: { id: null, tank_id: current?.tank.id, species: "", count: 1 },
  plant: { id: null, tank_id: current?.tank.id, name: "", layer: "unknown" },
})[type];
const find = (type, id) => (type === "tank" ? current.tank : current[LIST_OF[type]].find((r) => r.id === Number(id)));

view.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-tank],[data-add],[data-edit],[data-del]");
  if (!el) return;
  const { tank, add, edit, del, id } = el.dataset;
  if (tank) {
    location.hash = `#/tank/${tank}/overview`;
  } else if (add) {
    const saved = await openForm(add, blank(add));
    if (saved && add === "tank") location.hash = `#/tank/${saved.id}/overview`;
    else if (saved) route();
  } else if (edit) {
    if (await openForm(edit, find(edit, id))) route();
  } else if (del) {
    const r = find(del, id);
    const text = del === "tank"
      ? `Xóa ${r.name} cùng toàn bộ thiết bị, sinh vật và cây của bể này?`
      : `Xóa ${r.name ?? r.species}?`;
    if (!(await confirmDelete(text))) return;
    try {
      await call(`delete_${del}`, { id: r.id });
    } catch (err) {
      return notice(err);
    }
    if (del === "tank") location.hash = "#/";
    else route();
  }
});

/** A failure that happened outside a form: show it above the page instead of failing silently. */
function notice(text) {
  view.querySelector(".notice")?.remove();
  view.insertAdjacentHTML("afterbegin", `<p class="notice" role="alert">${esc(text)}</p>`);
}
addEventListener("hashchange", route);
route();
