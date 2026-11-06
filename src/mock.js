// shortcut: repeats the rules of src-tauri/src/briefing.rs so the UI can be viewed in a plain
// browser (taste-skill inspect); keep in step with briefing.rs, or drop once inspect runs inside Tauri.
let nextId = 100;
const db = {
  tanks: [
    { id: 1, name: "Hồ cá 1", kind: "fish", length_cm: 60, width_cm: 35, height_cm: 35, volume_l: null, setup_date: "2026-03-14", notes: null },
    { id: 2, name: "Hồ cá 2", kind: "fish", length_cm: 45, width_cm: 30, height_cm: 30, volume_l: 38, setup_date: null, notes: null },
    { id: 3, name: "Hồ thủy sinh", kind: "planted", length_cm: 90, width_cm: 45, height_cm: 45, volume_l: 160, setup_date: "2025-11-02", notes: null },
    { id: 4, name: "Bể terra", kind: "terrarium", length_cm: 30, width_cm: 30, height_cm: 45, volume_l: null, setup_date: "2026-08-20", notes: "Combo người bán chọn sẵn" },
  ],
  devices: [
    { id: 11, tank_id: 1, name: "Lọc thùng", brand: "Chihiros", model: null, purpose: "filter", connection: "tuya", purchase_date: null, notes: null },
    { id: 12, tank_id: 3, name: "Đèn UFO", brand: "Zetlight", model: "UFO Pro Max", purpose: "light", connection: "wifi", purchase_date: null, notes: null },
    { id: 13, tank_id: 3, name: "Sưởi", brand: null, model: null, purpose: "heater", connection: "tuya", purchase_date: null, notes: null },
  ],
  animals: [
    { id: 21, tank_id: 1, species: "Neon", count: 12, notes: null },
    { id: 22, tank_id: 1, species: "Cá chuột", count: 6, notes: null },
    { id: 23, tank_id: 2, species: "Betta", count: 1, notes: null },
    { id: 24, tank_id: 3, species: "Tép đỏ", count: 30, notes: null },
  ],
  plants: [
    { id: 31, tank_id: 3, name: "Ráy Nana", layer: "midground", notes: null },
    { id: 32, tank_id: 3, name: "Trân châu Nhật", layer: "carpet", notes: null },
    { id: 33, tank_id: 4, name: "Rêu", layer: "carpet", notes: null },
    { id: 34, tank_id: 4, name: "Cây chưa rõ 1", layer: "unknown", notes: null },
  ],
};

const NEEDS = { fish: [1, 1, 0], planted: [1, 0, 1], terrarium: [0, 0, 1], paludarium: [0, 1, 1] };
const LABEL = { device: "thiết bị", animal: "sinh vật", plant: "cây" };
const of = (table, id) => db[table].filter((r) => r.tank_id === id);

function overview(t) {
  const animals = of("animals", t.id);
  const o = { tank: t, devices: of("devices", t.id).length, animals: animals.reduce((s, a) => s + a.count, 0), species: animals.length, plants: of("plants", t.id).length };
  const [d, a, p] = NEEDS[t.kind];
  o.missing = [d && !o.devices && "device", a && !o.animals && "animal", p && !o.plants && "plant"].filter(Boolean);
  o.status = o.missing.length ? "Chưa có " + o.missing.map((m) => LABEL[m]).join(", ") : "Đủ hồ sơ";
  return o;
}

function briefing() {
  const all = db.tanks.map(overview);
  const lacking = all.filter((o) => o.missing.length);
  if (!all.length) return [{ text: "Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé.", tank_id: null }];
  if (!lacking.length) return [{ text: all.length === 1 ? `Bể ${all[0].tank.name} đã có hồ sơ đầy đủ.` : `Cả ${all.length} bể đều đã có hồ sơ đầy đủ.`, tank_id: null }];
  return lacking.map((o) => ({ text: `${o.tank.name} chưa có ${o.missing.map((m) => LABEL[m]).join(" và ")}. Bạn thêm giúp mình nhé.`, tank_id: o.tank.id }));
}

function save(table, row) {
  const name = row.name ?? row.species;
  if (!String(name).trim()) throw "Tên không được để trống";
  if (table === "animals" && row.count < 1) throw "Số lượng phải từ 1 trở lên";
  if (row.id == null) db[table].push({ ...row, id: nextId++ });
  else db[table] = db[table].map((r) => (r.id === row.id ? row : r));
  return row.id == null ? db[table].at(-1) : row;
}

function remove(table, id) {
  db[table] = db[table].filter((r) => r.id !== id);
  if (table === "tanks") for (const t of ["devices", "animals", "plants"]) db[t] = db[t].filter((r) => r.tank_id !== id);
}

const handlers = {
  list_tanks: () => db.tanks.map(overview),
  get_tank: ({ id }) => ({ tank: db.tanks.find((t) => t.id === id), devices: of("devices", id), animals: of("animals", id), plants: of("plants", id) }),
  get_briefing: briefing,
  save_tank: ({ tank }) => save("tanks", tank),
  delete_tank: ({ id }) => remove("tanks", id),
  save_device: ({ device }) => save("devices", device),
  delete_device: ({ id }) => remove("devices", id),
  save_animal: ({ animal }) => save("animals", animal),
  delete_animal: ({ id }) => remove("animals", id),
  save_plant: ({ plant }) => save("plants", plant),
  delete_plant: ({ id }) => remove("plants", id),
};

export async function invoke(cmd, args = {}) {
  return structuredClone(handlers[cmd](args));
}
