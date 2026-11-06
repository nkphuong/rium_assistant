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
      <div class="home-actions"><button class="pill" data-add="tank">Thêm bể</button></div>
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

/* ---------- Forms ---------- */

// Fields per record type: [key, label, input type or select options, extra attributes]
const SIZE = 'min="0.1" step="0.1"';
const FORMS = {
  tank: { cmd: "save_tank", arg: "tank", title: ["Thêm bể", "Sửa bể"], fields: [
    ["name", "Tên bể", "text", "required"], ["kind", "Loại bể", KIND],
    ["length_cm", "Dài (cm)", "number", SIZE], ["width_cm", "Rộng (cm)", "number", SIZE], ["height_cm", "Cao (cm)", "number", SIZE],
    ["volume_l", "Thể tích (lít)", "number", SIZE], ["setup_date", "Ngày setup", "date"], ["notes", "Ghi chú", "textarea"]] },
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
  let input;
  if (typeof type === "object")
    input = `<select id="${id}" name="${key}">${Object.entries(type).map(([v, l]) => `<option value="${v}"${v === value ? " selected" : ""}>${l}</option>`).join("")}</select>`;
  else if (type === "textarea") input = `<textarea id="${id}" name="${key}" rows="2">${esc(value)}</textarea>`;
  else input = `<input id="${id}" name="${key}" type="${type}" value="${esc(value)}" ${extra} aria-describedby="form-error">`;
  return `<label for="${id}">${label}</label>${input}`;
}

/** Opens the add/edit dialog; resolves to the saved record, or null if cancelled. */
function openForm(type, record) {
  const spec = FORMS[type], dlg = document.getElementById("form");
  dlg.innerHTML = `<form class="sheet">
      <h2 id="form-title">${spec.title[record.id == null ? 0 : 1]}</h2>
      <div class="fields">${spec.fields.map((f) => field(f, record[f[0]])).join("")}</div>
      <p id="form-error" class="error" role="alert"></p>
      <div class="actions"><button type="button" class="pill" data-cancel>Hủy</button><button class="pill primary">Lưu</button></div>
    </form>`;
  const form = dlg.querySelector("form"), save = form.querySelector(".primary");
  return new Promise((resolve) => {
    dlg.onclose = () => resolve(null);
    form.querySelector("[data-cancel]").onclick = () => dlg.close();
    form.onsubmit = async (e) => {
      e.preventDefault();
      const values = Object.fromEntries(spec.fields.map(([key, , type, extra = ""]) => {
        const raw = form.elements[key].value.trim();
        // Required text stays "" so the core answers with its own Vietnamese message.
        if (raw === "") return [key, extra.includes("required") && type === "text" ? "" : null];
        return [key, type === "number" ? Number(raw) : raw];
      }));
      save.disabled = true; // a second click must not save twice
      try {
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

function sizeLine(t) {
  const dims = [t.length_cm, t.width_cm, t.height_cm];
  const full = dims.every((v) => v != null);
  const parts = full ? [`${dims.join(" × ")} cm`] : [];
  if (t.volume_l != null) parts.push(`${t.volume_l} L`);
  else if (full) parts.push(`≈ ${Math.round((dims[0] * dims[1] * dims[2]) / 1000)} L (ước tính)`);
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
    if (page === "tank") await tankPage(Number(id), tab);
    else { current = null; await home(); }
  } catch (e) {
    view.innerHTML = `<section class="home"><p class="say" style="opacity:1;transform:none">${esc(e)}</p><a class="link-btn" href="#/">← Các bể</a></section>`;
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
    await call(`delete_${del}`, { id: r.id });
    if (del === "tank") location.hash = "#/";
    else route();
  }
});
addEventListener("hashchange", route);
route();
