# Execution Plan: MVP 1 — khung app và hồ sơ bể

Date: 2026-11-06

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Viết code theo `ponytail` (mức full); UI theo `design-taste-frontend` (app rules); tìm kiếm bằng `rg`. Xem `AGENTS.md`.

## Status

Active

## Outcome

Một app Tauri chạy trên Windows (bản cài từ `tauri build`) cho phép nhập, sửa,
xóa hồ sơ bể cùng thiết bị, sinh vật, cây; màn hình chính "lõi biết nói" với lời
trợ lý theo quy tắc; trang chi tiết bể dạng tab. Dữ liệu nằm trong SQLite ở thư
mục dữ liệu app của Windows và còn nguyên sau khi tắt/mở lại.

**Goal:** MVP 1 theo spec, dùng được hằng ngày để người dùng nhập 4 bể thật.

**Architecture:** Core Rust (`src-tauri/src/`) giữ toàn bộ dữ liệu và quy tắc:
`db` (mở + migrate SQLite), `tanks` (kiểu + CRUD + validate), `briefing` (độ
đầy đủ + lời trợ lý, hàm thuần), `commands` (lệnh Tauri mỏng). UI là HTML/CSS/JS
thuần (`src/`), gọi core qua `invoke`; khi mở ngoài Tauri (trình duyệt) dùng dữ
liệu mẫu trong bộ nhớ để xem/kiểm tra giao diện.

**Tech Stack:** Tauri 2 (template `vanilla`, không bundler), Rust stable,
`rusqlite` (feature `bundled`), `serde`, HTML/CSS/JS ES modules, font Inter
variable đóng gói cục bộ.

**Spec:** [docs/product/tanks.md](../../product/tanks.md),
[docs/product/screens.md](../../product/screens.md),
[docs/product/overview.md](../../product/overview.md).

## Global Constraints

- Windows, desktop; giao hàng bằng trình cài/`.exe` từ `npm run tauri build`.
- Dữ liệu cục bộ SQLite: file `rium.db` trong `app_data_dir()` (identifier
  `com.rium.assistant` → `%APPDATA%\com.rium.assistant\rium.db`). Không có mạng
  trong MVP 1: không Google Fonts, không CDN.
- Toàn bộ chữ trên UI bằng tiếng Việt có dấu đầy đủ. Không emoji.
- Token màu (screens.md): nền `#0c0d0f`, bề mặt `#15171a`, lồng `#23262b`, chữ
  `#ffffff`/`#b4b4b4`/`#949494`, nhấn `#4cb3f0` chỉ cho lõi + dữ liệu (không nút,
  tab, nav), cần xem `#e5a93b`, sự cố `#e5566f`. Thẻ bo 20px, nút pill 999px; nút
  chính trắng chữ đen.
- MVP 1 **không dùng** màu hổ phách/đỏ cho trạng thái bể; trạng thái chỉ bằng chữ.
- Phát sáng chỉ ở lõi trợ lý. Không gradient (trừ quầng tỏa tròn của lõi), glass,
  bóng đổ trên thứ đứng yên.
- Font Inter 400/500/600; cỡ 20/16/24/14/12; số `tabular-nums`; viết hoa kiểu câu.
- Chuyển động chỉ transform/opacity; `prefers-reduced-motion: reduce` → hiện
  ngay, không di chuyển.
- Loại bể: `fish` (hồ cá) · `planted` (hồ thủy sinh) · `terrarium` · `paludarium`.
- Công dụng thiết bị: `filter` lọc · `light` đèn · `heater` sưởi · `co2` CO2 ·
  `plug` ổ cắm · `sensor` cảm biến · `other` khác.
- Kết nối: `tuya` Tuya/Smart Life · `bluetooth` Bluetooth · `wifi` wifi · `none`
  không thông minh.
- Lớp cảnh: `carpet` trải nền · `foreground` tiền cảnh · `midground` trung cảnh ·
  `background` hậu cảnh · `unknown` không rõ.
- Hồ sơ đầy đủ: fish = ≥1 thiết bị + ≥1 sinh vật; planted = ≥1 thiết bị + ≥1 cây;
  terrarium = ≥1 cây; paludarium = ≥1 cây + ≥1 sinh vật. Trường tùy chọn không tính.

## Review Focus

1. **Xóa bể phải xóa kèm bản ghi con.** SQLite tắt khóa ngoại mặc định → phải bật
   `PRAGMA foreign_keys = ON` mỗi lần mở. Test ở Task 2.
2. **Tiếng Việt có dấu đi trọn vòng** ("Hồ cá 2", "Ráy Nana", "Rêu Java") qua DB
   và về UI không vỡ chữ. Test ở Task 3.
3. **Tên trống/chỉ khoảng trắng, số lượng 0 hoặc âm, kích thước ≤ 0** bị từ chối
   với thông báo tiếng Việt, không ghi vào DB. Test ở Task 2 và 3.
4. **Mở app nhiều lần** (migrate chạy lại trên DB đã có) không lỗi, không mất dữ
   liệu. Test ở Task 1.
5. **Bấm Lưu hai lần liên tiếp** không tạo bản ghi trùng: nút Lưu bị khóa trong lúc
   chờ. Kiểm tra tay ở Task 7.

## Context

- Spec đã duyệt 2026-11-06. Quy trình: `AGENTS.md`, `docs/decisions/0001-dev-workflow.md`.
- Style taste-skill: `.taste-skill/direction.json` (true-black flat, seed 595730179).
- Máy dev: có Node 22, WebView2, ripgrep; **chưa có** Rust và MSVC Build Tools.

## Scope

In scope: mọi mục "MVP 1" trong `tanks.md`; màn hình chính + chi tiết bể theo
`screens.md`; chuyển động thở, kể, chỉ, phản hồi nhấn.

Out of scope: Tuya, calendar, cảm biến, lịch sử, sức khỏe, AI, BLE, ảnh, danh mục
loài; chuyển động "biến hình" và "số lăn" (đợt sau — ghi `shortcut:`), biểu đồ.

## File Structure

| File | Trách nhiệm |
|---|---|
| `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json` | Từ template; sửa tên/identifier/window |
| `src-tauri/src/main.rs` | Từ template, gọi `rium_lib::run()` |
| `src-tauri/src/lib.rs` | Mở DB trong `setup`, đăng ký state + lệnh |
| `src-tauri/src/db.rs` | `open`, `open_in_memory`, migrate |
| `src-tauri/src/tanks.rs` | Kiểu dữ liệu, validate, CRUD, overview/detail |
| `src-tauri/src/briefing.rs` | Độ đầy đủ, chữ trạng thái, lời trợ lý |
| `src-tauri/src/commands.rs` | Lệnh `#[tauri::command]` mỏng |
| `src/index.html` | Khung: thanh trên, `<main id="view">`, các `<dialog>` |
| `src/styles.css` | Token, thành phần, chuyển động, reduced-motion |
| `src/fonts/InterVariable.woff2` | Font cục bộ |
| `src/api.js` | `invoke` khi trong Tauri; dữ liệu mẫu khi ngoài Tauri |
| `src/mock.js` | Dữ liệu mẫu trong bộ nhớ (cùng hình dạng với core) |
| `src/main.js` | Router hash, vẽ màn hình chính, chi tiết, form |

## Approach

Core trước (Task 1–5, có test Rust), UI sau (Task 6–7, kiểm bằng taste-skill +
chạy app), build và bàn giao cuối (Task 8). Mỗi task một commit.

### Task 0: Điều kiện tiên quyết và commit nền

**Files:** không có file mới.

- [ ] **Step 1: Commit nền** những gì đã có (AGENTS.md, CLAUDE.md, docs/, .agents/, .harness-core/, .gitignore, .taste-skill/):
  `git add -A && git commit -m "chore: harness, wiki, spec MVP 1"` (kiểm `git status` không còn file lạ như `scripts/bin/harness.exe`).
- [ ] **Step 2: Cài Rust**: `winget install --id Rustlang.Rustup -e`, rồi `rustup default stable-x86_64-pc-windows-msvc`.
- [ ] **Step 3: Cài MSVC Build Tools** (workload C++):
  `winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`.
  Lệnh cần quyền admin (UAC) và tải ~2–3 GB: nếu agent không chạy được, **dừng và nhờ người dùng chạy** (`! <lệnh>`), hướng dẫn từng bước.
- [ ] **Step 4: Kiểm chứng** (shell mới): `cargo --version` và `rustc --version` in ra phiên bản; `rustup show` có `x86_64-pc-windows-msvc`.

### Task 1: Dựng app Tauri + DB có migrate

**Files:** tạo bằng template; Create `src-tauri/src/db.rs`; Modify `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.

**Interfaces:**
- Produces: `db::open(path: &std::path::Path) -> rusqlite::Result<rusqlite::Connection>`, `db::open_in_memory() -> rusqlite::Result<Connection>`. Cả hai bật `foreign_keys` và migrate tới `user_version = 1`.

- [ ] **Step 1: Tạo app** tại gốc repo: `npm create tauri-app@latest . -- --template vanilla --manager npm --identifier com.rium.assistant` (nếu CLI không nhận thư mục khác rỗng, tạo ở thư mục tạm rồi chép `src/`, `src-tauri/`, `package.json` vào gốc). `npm install`. Trong `tauri.conf.json`: `productName` "Bọt", window title "Bọt", `width` 1280, `height` 820, `minWidth` 960, `minHeight` 640, `app.withGlobalTauri: true`. Thêm `rusqlite = { version = "0.32", features = ["bundled"] }` (hoặc bản mới nhất cùng major hiện hành) vào `[dependencies]`.
- [ ] **Step 2: Viết test thất bại** trong `db.rs`:

```rust
#[test]
fn migrate_is_idempotent_and_keeps_data() {
    let p = std::env::temp_dir().join(format!("rium-test-{}.db", std::process::id()));
    let _ = std::fs::remove_file(&p);
    { let c = open(&p).unwrap(); c.execute("INSERT INTO tanks(name, kind) VALUES ('Hồ cá 1','fish')", []).unwrap(); }
    let c = open(&p).unwrap(); // chạy migrate lần 2
    let n: i64 = c.query_row("SELECT count(*) FROM tanks", [], |r| r.get(0)).unwrap();
    assert_eq!(n, 1);
    let v: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap();
    assert_eq!(v, 1);
    let fk: i64 = c.query_row("PRAGMA foreign_keys", [], |r| r.get(0)).unwrap();
    assert_eq!(fk, 1);
    drop(c); std::fs::remove_file(&p).unwrap();
}
```

- [ ] **Step 3: Chạy** `cargo test --manifest-path src-tauri/Cargo.toml db::` → FAIL (chưa có `open`).
- [ ] **Step 4: Viết `db.rs`.** Migrate: nếu `user_version < 1` chạy schema sau trong một transaction rồi đặt `user_version = 1`:

```sql
CREATE TABLE tanks (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (trim(name) <> ''),
  kind TEXT NOT NULL CHECK (kind IN ('fish','planted','terrarium','paludarium')),
  length_cm REAL CHECK (length_cm > 0), width_cm REAL CHECK (width_cm > 0),
  height_cm REAL CHECK (height_cm > 0), volume_l REAL CHECK (volume_l > 0),
  setup_date TEXT, notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE devices (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''), brand TEXT, model TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('filter','light','heater','co2','plug','sensor','other')),
  connection TEXT NOT NULL CHECK (connection IN ('tuya','bluetooth','wifi','none')),
  purchase_date TEXT, notes TEXT);
CREATE TABLE animals (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  species TEXT NOT NULL CHECK (trim(species) <> ''), count INTEGER NOT NULL CHECK (count >= 1), notes TEXT);
CREATE TABLE plants (
  id INTEGER PRIMARY KEY, tank_id INTEGER NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  layer TEXT NOT NULL CHECK (layer IN ('carpet','foreground','midground','background','unknown')), notes TEXT);
```

- [ ] **Step 5: Chạy lại test** → PASS. Chạy `npm run tauri dev` → cửa sổ "Bọt" mở (trang template), không lỗi console Rust.
- [ ] **Step 6: Commit** `feat: scaffold Tauri app with SQLite migrations`.

### Task 2: Bể — kiểu, validate, CRUD

**Files:** Create `src-tauri/src/tanks.rs` (test trong cùng file).

**Interfaces:**
- Consumes: `db::open_in_memory`.
- Produces (tất cả `#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]`, enum `#[serde(rename_all = "lowercase")]`):
  - `enum TankKind { Fish, Planted, Terrarium, Paludarium }` (`as_str`/parse khớp giá trị SQL).
  - `struct Tank { id: Option<i64>, name: String, kind: TankKind, length_cm: Option<f64>, width_cm: Option<f64>, height_cm: Option<f64>, volume_l: Option<f64>, setup_date: Option<String>, notes: Option<String> }`
  - `type AppResult<T> = Result<T, String>` — lỗi là câu tiếng Việt hiển thị thẳng cho người dùng; lỗi rusqlite → `e.to_string()`.
  - `fn save_tank(c: &Connection, t: Tank) -> AppResult<Tank>` — `id: None` thì INSERT, có thì UPDATE; trả bản đã lưu (có id). Trim tên; chuỗi tùy chọn rỗng → `None`.
  - `fn delete_tank(c: &Connection, id: i64) -> AppResult<()>`
  - `fn get_tank_row(c: &Connection, id: i64) -> AppResult<Tank>` (không thấy → `"Không tìm thấy bể"`).

- [ ] **Step 1: Viết test thất bại:**

```rust
#[test] fn save_then_update_tank() {
    let c = db::open_in_memory().unwrap();
    let t = save_tank(&c, tank("  Hồ cá 2 ", TankKind::Fish)).unwrap();
    assert_eq!(t.name, "Hồ cá 2"); assert!(t.id.is_some());
    let t2 = save_tank(&c, Tank { volume_l: Some(73.0), ..t.clone() }).unwrap();
    assert_eq!(get_tank_row(&c, t.id.unwrap()).unwrap().volume_l, Some(73.0));
    assert_eq!(t2.id, t.id);
}
#[test] fn rejects_blank_name_and_non_positive_size() {
    let c = db::open_in_memory().unwrap();
    assert_eq!(save_tank(&c, tank("   ", TankKind::Fish)).unwrap_err(), "Tên bể không được để trống");
    let bad = Tank { length_cm: Some(0.0), ..tank("Hồ", TankKind::Fish) };
    assert_eq!(save_tank(&c, bad).unwrap_err(), "Kích thước và thể tích phải lớn hơn 0");
}
#[test] fn delete_tank_cascades() {
    let c = db::open_in_memory().unwrap();
    let id = save_tank(&c, tank("Terra", TankKind::Terrarium)).unwrap().id.unwrap();
    c.execute("INSERT INTO plants(tank_id,name,layer) VALUES (?1,'Rêu','carpet')", [id]).unwrap();
    delete_tank(&c, id).unwrap();
    let n: i64 = c.query_row("SELECT count(*) FROM plants", [], |r| r.get(0)).unwrap();
    assert_eq!(n, 0);
}
```
(`tank(name, kind)` là helper test trả `Tank` với mọi trường tùy chọn `None`.)

- [ ] **Step 2:** `cargo test --manifest-path src-tauri/Cargo.toml tanks::` → FAIL.
- [ ] **Step 3: Viết kiểu + hàm** theo Interfaces. Validate trong Rust trước khi ghi (CHECK của SQL là lưới an toàn thứ hai).
- [ ] **Step 4:** chạy lại → PASS.
- [ ] **Step 5: Commit** `feat: tank model with validation and cascade delete`.

### Task 3: Thiết bị, sinh vật, cây

**Files:** Modify `src-tauri/src/tanks.rs`.

**Interfaces:**
- Produces:
  - `enum Purpose { Filter, Light, Heater, Co2, Plug, Sensor, Other }`, `enum Link { Tuya, Bluetooth, Wifi, None }` (serde/SQL dùng chuỗi ở Global Constraints), `enum Layer { Carpet, Foreground, Midground, Background, Unknown }`.
  - `struct Device { id: Option<i64>, tank_id: i64, name: String, brand: Option<String>, model: Option<String>, purpose: Purpose, connection: Link, purchase_date: Option<String>, notes: Option<String> }`
  - `struct Animal { id: Option<i64>, tank_id: i64, species: String, count: i64, notes: Option<String> }`
  - `struct Plant { id: Option<i64>, tank_id: i64, name: String, layer: Layer, notes: Option<String> }`
  - `save_device / save_animal / save_plant(c, x) -> AppResult<Self>`; `delete_device / delete_animal / delete_plant(c, id: i64) -> AppResult<()>`.
  - `struct TankDetail { tank: Tank, devices: Vec<Device>, animals: Vec<Animal>, plants: Vec<Plant> }`; `fn get_tank(c, id) -> AppResult<TankDetail>` (con sắp theo id tăng).
  - Thông báo lỗi: `"Tên thiết bị không được để trống"`, `"Tên loài không được để trống"`, `"Số lượng phải từ 1 trở lên"`, `"Tên cây không được để trống"`.

- [ ] **Step 1: Viết test thất bại:**

```rust
#[test] fn children_round_trip_vietnamese() {
    let c = db::open_in_memory().unwrap();
    let id = save_tank(&c, tank("Hồ cá 2", TankKind::Fish)).unwrap().id.unwrap();
    save_animal(&c, Animal { id: None, tank_id: id, species: "Cá chuột".into(), count: 6, notes: None }).unwrap();
    save_plant(&c, Plant { id: None, tank_id: id, name: "Ráy Nana".into(), layer: Layer::Midground, notes: None }).unwrap();
    save_device(&c, Device { id: None, tank_id: id, name: "Lọc thùng".into(), brand: Some("Chihiros".into()), model: None,
        purpose: Purpose::Filter, connection: Link::Tuya, purchase_date: None, notes: None }).unwrap();
    let d = get_tank(&c, id).unwrap();
    assert_eq!(d.animals[0].species, "Cá chuột");
    assert_eq!(d.plants[0].name, "Ráy Nana");
    assert_eq!(d.devices[0].connection, Link::Tuya);
}
#[test] fn rejects_zero_count() {
    let c = db::open_in_memory().unwrap();
    let id = save_tank(&c, tank("Hồ", TankKind::Fish)).unwrap().id.unwrap();
    let e = save_animal(&c, Animal { id: None, tank_id: id, species: "Neon".into(), count: 0, notes: None }).unwrap_err();
    assert_eq!(e, "Số lượng phải từ 1 trở lên");
    assert!(get_tank(&c, id).unwrap().animals.is_empty());
}
```

- [ ] **Step 2:** chạy → FAIL. **Step 3:** viết. **Step 4:** chạy → PASS.
- [ ] **Step 5: Commit** `feat: devices, animals and plants per tank`.

### Task 4: Độ đầy đủ và lời trợ lý

**Files:** Create `src-tauri/src/briefing.rs`; Modify `src-tauri/src/tanks.rs` (thêm overview).

**Interfaces:**
- Consumes: `TankKind`, `Tank`.
- Produces:
  - `enum Missing { Device, Animal, Plant }` → nhãn `"thiết bị"`, `"sinh vật"`, `"cây"`.
  - `fn missing(kind: TankKind, devices: i64, animals: i64, plants: i64) -> Vec<Missing>` (thứ tự Device, Animal, Plant; quy tắc ở Global Constraints).
  - `fn status_text(m: &[Missing]) -> String` → rỗng: `"Đủ hồ sơ"`; ngược lại `"Chưa có " + nhãn nối bằng ", "`.
  - `struct TankOverview { tank: Tank, devices: i64, animals: i64 /* tổng count */, species: i64, plants: i64, missing: Vec<Missing>, status: String }` và `fn list_tanks(c) -> AppResult<Vec<TankOverview>>` trong `tanks.rs` (sắp theo id).
  - `struct Bubble { text: String, tank_id: Option<i64> }`; `fn briefing(tanks: &[TankOverview]) -> Vec<Bubble>`.
- Lời trợ lý (copy cố định):
  - 0 bể → một bóng: `"Chào bạn, mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé."`
  - Có bể thiếu → bóng đầu `"Chào bạn. Mình xem qua hồ sơ các bể rồi."`, rồi mỗi bể thiếu một bóng (có `tank_id`): `"{tên} chưa có {nhãn nối bằng ' và '}. Bạn thêm giúp mình nhé."`
  - Tất cả đủ → một bóng: n = 1: `"Bể {tên} đã có hồ sơ đầy đủ."`; n ≥ 2: `"Cả {n} bể đều đã có hồ sơ đầy đủ."`

- [ ] **Step 1: Viết test thất bại:**

```rust
#[test] fn completeness_rules() {
    assert_eq!(missing(TankKind::Fish, 0, 0, 5), vec![Missing::Device, Missing::Animal]);
    assert!(missing(TankKind::Fish, 1, 3, 0).is_empty());          // hồ cá không cần cây
    assert!(missing(TankKind::Terrarium, 0, 0, 1).is_empty());     // terra không cần thiết bị
    assert_eq!(missing(TankKind::Planted, 1, 0, 0), vec![Missing::Plant]);
    assert_eq!(missing(TankKind::Paludarium, 0, 0, 0), vec![Missing::Animal, Missing::Plant]);
    assert_eq!(status_text(&[Missing::Device, Missing::Plant]), "Chưa có thiết bị, cây");
    assert_eq!(status_text(&[]), "Đủ hồ sơ");
}
#[test] fn briefing_copy() {
    assert_eq!(briefing(&[])[0].text, "Chào bạn, mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé.");
    let a = ov(1, "Hồ cá 1", vec![]); let b = ov(2, "Terra", vec![Missing::Plant]);
    let out = briefing(&[a.clone(), b]);
    assert_eq!(out.len(), 2);
    assert_eq!(out[1].text, "Terra chưa có cây. Bạn thêm giúp mình nhé.");
    assert_eq!(out[1].tank_id, Some(2));
    assert_eq!(briefing(&[a.clone(), ov(3, "Hồ cá 2", vec![])])[0].text, "Cả 2 bể đều đã có hồ sơ đầy đủ.");
    assert_eq!(briefing(&[a])[0].text, "Bể Hồ cá 1 đã có hồ sơ đầy đủ.");
}
```
(`ov(id, name, missing)` là helper test dựng `TankOverview`.) Thêm một test trong `tanks.rs`: `list_tanks` trả `animals` = tổng `count`, `species` = số dòng.

- [ ] **Step 2:** chạy → FAIL. **Step 3:** viết. **Step 4:** `cargo test --manifest-path src-tauri/Cargo.toml` → toàn bộ PASS.
- [ ] **Step 5: Commit** `feat: profile completeness and rule-based assistant briefing`.

### Task 5: Lệnh Tauri và vị trí DB

**Files:** Create `src-tauri/src/commands.rs`; Modify `src-tauri/src/lib.rs`.

**Interfaces:**
- Produces lệnh (tên JS = tên Rust, tham số camelCase phía JS): `list_tanks() -> Vec<TankOverview>`, `get_tank(id) -> TankDetail`, `get_briefing() -> Vec<Bubble>`, `save_tank(tank) -> Tank`, `delete_tank(id)`, `save_device(device) -> Device`, `delete_device(id)`, `save_animal(animal) -> Animal`, `delete_animal(id)`, `save_plant(plant) -> Plant`, `delete_plant(id)`. Tất cả trả `Result<_, String>`; state `std::sync::Mutex<rusqlite::Connection>`.

- [ ] **Step 1:** Trong `lib.rs` `setup`: `app.path().app_data_dir()?`, `create_dir_all`, `db::open(dir.join("rium.db"))`, `app.manage(Mutex::new(conn))`; đăng ký lệnh bằng `generate_handler!`.
- [ ] **Step 2: Kiểm chứng:** `npm run tauri dev`; trong devtools của cửa sổ: `await __TAURI__.core.invoke('save_tank', { tank: { id: null, name: 'Thử', kind: 'fish', length_cm: null, width_cm: null, height_cm: null, volume_l: null, setup_date: null, notes: null } })` trả object có `id`; `await __TAURI__.core.invoke('list_tanks')` có bể đó với `status: "Chưa có thiết bị, sinh vật"`; file `%APPDATA%\com.rium.assistant\rium.db` tồn tại. Xóa bể thử.
- [ ] **Step 3: Commit** `feat: Tauri commands over the tank store`.

### Task 6: Khung UI, token và màn hình chính

**Files:** Replace `src/index.html`, `src/styles.css`, `src/main.js`; Create `src/api.js`, `src/mock.js`, `src/fonts/InterVariable.woff2`.

**Interfaces:**
- Consumes: lệnh Task 5.
- Produces: `api.js` export các hàm async cùng tên lệnh (camelCase: `listTanks`, `getTank`, `getBriefing`, `saveTank`, `deleteTank`, `saveDevice`, …). `window.__TAURI__` có → `invoke`; không có → gọi `mock.js` (dữ liệu mẫu 4 bể: "Hồ cá 1" fish đủ hồ sơ, "Hồ cá 2" fish thiếu thiết bị, "Hồ thủy sinh" planted đủ, "Bể terra" terrarium có rêu; mock tự tính `status`/briefing đơn giản — `shortcut: mock lặp lại quy tắc của briefing.rs, chỉ để xem UI ngoài Tauri`).
- Router hash: `#/` màn hình chính; `#/tank/{id}/{tab}` với tab ∈ `overview|devices|animals|plants`.

- [ ] **Step 1: Font:** tải `InterVariable.woff2` từ repo `rsms/inter` (`docs/font-files/InterVariable.woff2`) vào `src/fonts/`; `@font-face` weight 100–900. Kiểm chữ "Hồ cá, Ráy, Rêu, Ốc" hiển thị đúng dấu.
- [ ] **Step 2: `styles.css`:** token đúng Global Constraints; thành phần: thanh trên 52px (tên app "Bọt" bên trái, dòng trạng thái phải: `"{n} bể · cập nhật lúc HH:MM"`), dải bể, lõi, bong bóng (bo `20px 20px 20px 6px`), pill, nút chính. Chuyển động theo `screens.md`: *thở* (4,2s), *kể* (bóng cách 0,7s, 450ms `cubic-bezier(.22,1,.36,1)`, nhô 12px; click bất kỳ → hiện hết), *chỉ* (bóng có `tank_id` → đường 1px `#4cb3f0` từ lõi tới thẻ bể đó, 600ms, sau khi bóng hiện), nhấn nút co 0.97. Khối `@media (prefers-reduced-motion: reduce)` tắt hết animation và hiện nội dung.
- [ ] **Step 3: Màn hình chính** trong `main.js`: dải bể (tên + `status` bằng chữ xám, lõi ở giữa dải), bong bóng từ `getBriefing()`, nút "Thêm bể" (pill phụ). Bấm thẻ bể → `#/tank/{id}/overview`. Dải >4 bể cuộn ngang, lõi giữ ở giữa khung nhìn.
- [ ] **Step 4: Kiểm bằng taste-skill** (ngoài Tauri, dùng mock): `node ~/.claude/skills/design-taste-frontend/scripts/lint.mjs src` và `node ~/.claude/skills/design-taste-frontend/scripts/inspect.mjs src/index.html --app`. Sửa mọi FAIL; WARN phải giải thích được (ngoại lệ đã duyệt: quầng sáng của lõi — chạy với `--allow` cho đúng luật glow/gradient, ghi lý do). Mở các ảnh chụp ở `.taste-skill/inspect/` và xem cả 3 bề rộng.
- [ ] **Step 5:** `npm run tauri dev` → màn hình chính hiện dữ liệu thật (DB rỗng → bóng chào "Chào bạn, mình là Bọt…").
- [ ] **Step 6: Commit** `feat: home screen with assistant core and briefing`.

### Task 7: Trang chi tiết bể và form nhập liệu

**Files:** Modify `src/main.js`, `src/index.html`, `src/styles.css`.

**Interfaces:**
- Consumes: `api.getTank`, `api.save*`, `api.delete*`.

- [ ] **Step 1: Trang chi tiết:** đầu trang (lõi nhỏ, tên, loại bằng chữ, kích thước, thể tích — nếu `volume_l` trống mà đủ 3 kích thước thì hiện `"≈ {D×R×C/1000 làm tròn} L (ước tính)"`), nút "Sửa bể", "Xóa bể". Tab: Tổng quan · Thiết bị · Sinh vật · Cây · Lịch sử (Lịch sử hiện chữ "Sắp có", không bấm được). Tab đang chọn chỉ đổi chữ `#bbb → #fff`. Nút "← Các bể" về `#/`.
- [ ] **Step 2: Tổng quan:** một dải số chia vạch mảnh: Thiết bị `{devices}`, Sinh vật `{animals}` + dòng `"{species} loài"`, Cây `{plants}`, Ngày setup → `"{n} ngày"` + dòng ngày (trống → `"—"` + `"chưa nhập"`). Dưới: dòng trạng thái hồ sơ (`status`).
- [ ] **Step 3: Danh sách con** mỗi tab: dòng 48px gồm tên chính, chi tiết phụ xám (thiết bị: hãng · model · công dụng · kết nối; sinh vật: số lượng; cây: lớp cảnh), nút Sửa/Xóa. Rỗng → một câu xám kèm nút thêm (vd. "Chưa có thiết bị nào.").
- [ ] **Step 4: Form bằng `<dialog>` gốc** cho bể/thiết bị/sinh vật/cây; nhãn tiếng Việt; select cho enum với nhãn ở Global Constraints; trường bắt buộc có `required`; số dùng `type=number min` phù hợp. Khi Lưu: khóa nút đến khi có kết quả; lỗi từ core hiện ngay dưới form (`aria-describedby`). Xóa: dialog xác nhận nêu rõ, với bể: `"Xóa {tên} cùng toàn bộ thiết bị, sinh vật và cây của bể này?"`.
- [ ] **Step 5: Kiểm:** taste-skill `lint` + `inspect --app` như Task 6 (thêm hash `#/tank/2/overview` của mock). Chạy `npm run tauri dev`: thêm bể, thêm mỗi loại bản ghi, sửa, xóa; bấm Lưu nhanh 2 lần không tạo trùng; tên toàn khoảng trắng hiện lỗi "…không được để trống".
- [ ] **Step 6: Commit** `feat: tank detail tabs and data entry dialogs`.

### Task 8: Bản phát hành, kiểm chứng cuối, bàn giao

**Files:** Modify `docs/plans/active/mvp-1-tank-profiles.md` (Progress/Validation/Result), `docs/wiki/log.md`, wiki khi có kiến thức mới.

- [ ] **Step 1:** `cargo test --manifest-path src-tauri/Cargo.toml` → PASS toàn bộ.
- [ ] **Step 2:** `npm run tauri build` → có trình cài trong `src-tauri/target/release/bundle/nsis/`.
- [ ] **Step 3:** Cài và mở bản build; nhập 2 bể mẫu có đủ loại bản ghi; tắt hẳn app, mở lại → dữ liệu còn; `%APPDATA%\com.rium.assistant\rium.db` tồn tại và không có `rium.db` nào trong thư mục repo. Xóa dữ liệu mẫu.
- [ ] **Step 4:** Ghi Validation + Result vào plan; mục log phiên; chuyển sang người dùng nghiệm thu: cài bản .exe, nhập 4 bể thật. **Chỉ chuyển plan sang `completed/` sau khi người dùng xác nhận.**
- [ ] **Step 5: Commit** `docs: MVP 1 validation and handoff`.

## Risks And Recovery

- Cài MSVC Build Tools cần admin và tải lớn → dừng ở Task 0, nhờ người dùng chạy.
- `npm create tauri-app` thay đổi cờ CLI → đọc `--help`, giữ cấu trúc file như bảng trên.
- Lỗi build Rust do phiên bản crate → ghim phiên bản đang dùng được trong `Cargo.lock` (commit lock file).
- Rollback: mỗi task một commit; DB của người dùng nằm ngoài repo, xóa file `rium.db` để làm lại từ đầu.

## Progress

- [x] Task 0 — Điều kiện tiên quyết và commit nền
- [x] Task 1 — Dựng app Tauri + DB có migrate
- [x] Task 2 — Bể: kiểu, validate, CRUD
- [x] Task 3 — Thiết bị, sinh vật, cây
- [x] Task 4 — Độ đầy đủ và lời trợ lý
- [x] Task 5 — Lệnh Tauri và vị trí DB
- [x] Task 6 — Khung UI, token, màn hình chính
- [x] Task 7 — Trang chi tiết bể và form
- [x] Task 8 — Bản phát hành và bàn giao

## Decisions

- 2026-11-06: Tên app tạm **"Bọt"** (BỌT = Bể Ổn Tốt; người dùng có thể đổi sau). Identifier giữ `com.rium.assistant`, **không gắn với tên app**: đổi identifier sẽ đổi thư mục dữ liệu và làm "mất" DB của người dùng. Tên chỉ nằm ở `productName`, tiêu đề cửa sổ, chữ trên UI và lời trợ lý.
- 2026-11-06: Một hàm `save_*` cho cả thêm và sửa (`id: None` = thêm) để giảm số lệnh.
- 2026-11-06: Font Inter đóng gói cục bộ vì app không cần mạng ở MVP 1.
- 2026-11-06: Có `mock.js` để chạy UI ngoài Tauri cho taste-skill inspect và xem nhanh.
- 2026-11-06: "Biến hình" và "số lăn" để đợt sau.
- 2026-11-06: Chỉ build NSIS — WiX/MSI không nhận tên "Bọt" (code page 1252).
- 2026-11-06: Kiểm chứng E2E bằng WebView2 remote debugging + playwright-cli (xem wiki engineering).

## Validation

- Focused proof: `cargo test` (db, tanks, briefing).
- Integration or end-to-end proof: Task 5 Step 2 (invoke từ devtools), Task 8 Step 3 (bản build thật, mở lại còn dữ liệu).
- Repository-required checks: taste-skill `lint.mjs` + `inspect.mjs --app` không còn FAIL.

## Result

2026-11-06 — triển khai xong trên nhánh `feat/mvp-1`, **chờ người dùng nghiệm thu**.

- `cargo test`: 10/10 pass (db, tanks, briefing).
- E2E trên app thật (playwright-cli gắn qua cổng debug WebView2): thêm bể bằng
  form (bấm đúp Lưu → 1 bản ghi), tên loài toàn khoảng trắng → "Tên loài không
  được để trống", thêm sinh vật/thiết bị, sửa số lượng, xóa bể kèm xác nhận.
- Bản phát hành: `Bọt_0.1.0_x64-setup.exe` (NSIS, 2,35 MB) cài vào
  `%LOCALAPPDATA%\Bọt\rium.exe`; nhập 2 bể mẫu, tắt, mở lại → còn nguyên;
  DB ở `%APPDATA%\com.rium.assistant\rium.db`, không có `rium.db` trong repo.
- taste-skill: lint 0 FAIL; inspect --app 0 FAIL (ngoại lệ: quầng lõi, bóng của dialog).

Giới hạn: chưa có "biến hình", "số lăn"; bản cài chưa ký số (Windows SmartScreen
có thể cảnh báo). Plan chuyển sang `completed/` sau khi người dùng nhập 4 bể thật.
