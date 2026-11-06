# Execution Plan: Màn hình chính v2 — Bọt lên tiếng

Date: 2026-11-06

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development
> (quy trình dự án, `AGENTS.md` §3). Code theo `ponytail` mức `full`. Steps dùng `- [ ]`.

**Goal:** Màn hình chính có lõi Bọt cố định; bấm lõi → bể trượt sang cột trái,
vùng nói mở ra từ lõi, Bọt chào theo giờ và đọc tình hình bể trong khung HUD.

**Architecture:** Logic thuần (lời chào theo giờ, quyết định tự mở) tách vào
`src/talk.js`, test bằng `node --test` (không thêm dependency). `main.js` dựng
màn hình, chuyển chế độ bằng một class trên `.home` + kỹ thuật FLIP cho thẻ bể.
Lời trợ lý vẫn sinh ở core Rust (`briefing.rs`), chỉ đổi câu chữ.

**Tech Stack:** Tauri 2, Rust (test `cargo test`), JS module thuần + CSS, Node 22 `node:test`.

**Spec:** [docs/product/screens.md](../../product/screens.md) mục "Màn hình chính v2 — Bọt lên tiếng"
(prototype tham khảo: [docs/product/prototypes/home-v2.html](../../product/prototypes/home-v2.html), kiểu B).

## Status

Active

## Outcome

Mở app: lõi ở giữa, hàng thẻ hình bể bên dưới; lần đầu trong ngày Bọt tự mở chế
độ nói và chào; bấm lõi/Esc/"Về các bể" chuyển qua lại; lõi không bao giờ xê dịch.

## Context

- Code hiện tại: `src/main.js` (`home`, `point`, `speak`, `hud`, `chat`, `SMALL_TALK`),
  `src/styles.css`, `src/mock.js` (bản sao quy tắc briefing cho xem trên trình duyệt),
  `src-tauri/src/briefing.rs` (+ test `briefing_copy`).
- E2E: phục vụ `src/` bằng `python -m http.server` → `api.js` tự dùng `mock.js`
  (không đụng DB thật); hoặc app thật qua CDP — xem `docs/wiki/engineering/tauri-e2e-and-build.md`.
- Build: PowerShell, `$env:Path = "$env:USERPROFILE\.cargo\bin;" + $env:Path` trước `npm run tauri build`.

## Global Constraints

- Lõi: tâm ở giữa chiều ngang vùng nội dung, ~42% chiều cao, **giống hệt ở cả hai chế độ**.
- Xanh dương = bể/nước (`--accent`), cam = Bọt (`--core #c85a06`).
- Lời chào theo giờ máy, đúng nguyên văn: 0–5h "Khuya rồi, bạn vẫn còn thức à?" ·
  5–11h "Chào buổi sáng!" · 11–13h "Chào buổi trưa!" · 13–18h "Chào buổi chiều!" ·
  18–22h "Chào buổi tối!" · 22–24h "Muộn rồi, mình kể nhanh nhé." (cận dưới tính, cận trên không).
- Câu 0 bể: "Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé." Không còn câu
  "Chào bạn. Mình xem qua hồ sơ các bể rồi."
- Timing: bể → cột 800ms ease-in-out; vùng nói lộ ra 900ms; đường chỉ trễ ~500ms;
  chữ bắt đầu sau ~700ms; nhịp chữ ~60ms/ký tự.
- Khung HUD: bốn góc cam dày 3px cạnh 22px, không nền, không viền đầy.
- `prefers-reduced-motion`: không trượt/lan/hiện từng từ; đổi bố cục + hiện hết chữ ngay.
- Chỉ transform/opacity/clip-path cho chuyển động. Không thêm dependency.

## Review Focus

1. Đóng giữa lúc đang nói rồi mở lại ngay → chỉ một lượt nói chạy, không có chữ của lượt cũ chen vào (Task 4 Step 6).
2. `localStorage` không dùng được (ném lỗi) → app vẫn hiện, không tự mở (Task 2 test + Task 4 code).
3. Bấm một thẻ bể khi Bọt đang nói → sang trang chi tiết, không lỗi console, vòng lặp nói dừng (Task 4 Step 6).
4. Giờ biên 0/5/11/13/18/22 và 4:59/10:59 chọn đúng câu (Task 2 test).
5. 0 bể → chỉ có thẻ "+ Thêm bể", chế độ nói đọc câu 0 bể (Task 4 Step 6, qua mock xóa hết bể).

---

### Task 0: Chốt phần việc trước đó

Nhánh `feat/light-theme-drawer-form` đang có thay đổi chưa commit (logo, bộ màu
sáng, form ngăn trượt, lõi HUD 3D, tài liệu). Người dùng duyệt plan này = đồng ý commit.

- [ ] **Step 1:** Thêm `.playwright-cli/` vào `.gitignore`; xóa thư mục đó khỏi cây làm việc.
- [ ] **Step 2:** `cd src-tauri; cargo test` → PASS (10 test hiện có).
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: Bọt logo, light palette, drawer forms, 3D talking core"
```

### Task 1: Đổi câu chữ briefing (Rust + mock)

**Files:** Modify `src-tauri/src/briefing.rs` (`briefing`, test `briefing_copy`), `src/mock.js` (`briefing`).

**Interfaces:** Produces: `get_briefing` không còn câu chào chung; dòng có `tank_id` giữ nguyên.

- [ ] **Step 1: Sửa test trước** trong `briefing_copy`:

```rust
assert_eq!(briefing(&[])[0].text, "Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé.");
let out = briefing(&[a.clone(), b]);
assert_eq!(out.len(), 1);
assert_eq!(out[0].text, "Terra chưa có cây. Bạn thêm giúp mình nhé.");
assert_eq!(out[0].tank_id, Some(2));
assert_eq!(two[0].text, "X chưa có thiết bị và sinh vật. Bạn thêm giúp mình nhé.");
```
(giữ nguyên hai assert "Cả 2 bể…" và "Bể Hồ cá 1…").

- [ ] **Step 2:** `cd src-tauri; cargo test briefing_copy` → FAIL.
- [ ] **Step 3:** Sửa `briefing()`: nhánh `[]` dùng câu mới; nhánh `(_, false)` bỏ `std::iter::once(...)`, chỉ map các bể thiếu.
- [ ] **Step 4:** `cargo test` → toàn bộ PASS.
- [ ] **Step 5:** `src/mock.js` `briefing()`: cùng hai thay đổi (giữ comment `shortcut:` sẵn có).
- [ ] **Step 6: Commit** `fix: one greeting only — drop generic hello from briefing`.

### Task 2: Logic thuần `src/talk.js` (TDD)

**Files:** Create `src/talk.js`, `src/talk.test.js`; Modify `package.json` (script `"test:ui": "node --test src/"`).

**Interfaces — Produces:**
- `greeting(hour: number): string` — câu theo Global Constraints.
- `dayKey(date: Date): string` — `"YYYY-MM-DD"` theo giờ địa phương.
- `shouldAutoOpen(lastGreeted: string | null, today: string): boolean` — true khi `lastGreeted` khác `today` và khác `"unavailable"`.
- `readGreeted(): string | null` / `markGreeted(today: string): void` — key `localStorage` `"bot.greeted"`,
  bọc try/catch: `readGreeted()` ném lỗi → trả `"unavailable"` (và `shouldAutoOpen` coi đó là đã chào → không tự mở);
  `markGreeted` ném lỗi → bỏ qua.

- [ ] **Step 1: Viết test** `src/talk.test.js` (`import { test } from "node:test"; import assert from "node:assert/strict";`):
  - `greeting`: 0→"Khuya rồi, bạn vẫn còn thức à?", 4→cùng, 5→"Chào buổi sáng!", 10→cùng, 11→"Chào buổi trưa!",
    12→cùng, 13→"Chào buổi chiều!", 17→cùng, 18→"Chào buổi tối!", 21→cùng, 22→"Muộn rồi, mình kể nhanh nhé.", 23→cùng.
  - `dayKey(new Date(2026, 0, 5, 23, 59))` → `"2026-01-05"`.
  - `shouldAutoOpen(null, "2026-11-06")` → true; `("2026-11-05", "2026-11-06")` → true;
    `("2026-11-06", "2026-11-06")` → false; `("unavailable", "2026-11-06")` → false.
- [ ] **Step 2:** `npm run test:ui` → FAIL (module chưa có).
- [ ] **Step 3:** Viết `src/talk.js` (ES module, export đủ 5 hàm trên).
- [ ] **Step 4:** `npm run test:ui` → PASS.
- [ ] **Step 5: Commit** `feat: greeting-by-hour and once-a-day auto-open rules`.

### Task 3: Màn hình chính — trạng thái nghỉ

**Files:** Modify `src/main.js` (`home`, thay `tankCard`; xóa `point`, `chat`, `SMALL_TALK`, `MAX_EXTRA`), `src/styles.css`.

**Interfaces:**
- Produces markup (Task 4 dựa vào):
  `<section class="home2">` chứa `<button class="core" aria-label="Nói chuyện với Bọt">` (giữ `HUD`, `hud()`),
  `<p class="hint">Bấm để nghe Bọt</p>`, `<div class="tanks">` gồm các `.tank-tile[data-tank=id]` và
  một `.tank-tile.add[data-add=tank]` cuối cùng, `<section class="talk-space" aria-live="polite">` rỗng,
  `<button class="close-talk" type="button">Về các bể</button>`.
- `tankTile(o: TankOverview): string` — khối `.glass` (vạch nước, nền cát, 3–5 thân cây trang trí) +
  `.meta` gồm `<b>` tên, dòng `chấm · loại · kích thước` (chấm `.ok` xanh lá khi `o.missing.length === 0`, `.warn` `--warning` khi thiếu). Kích thước dùng `sizeLine(o.tank)` sẵn có.
- `.core`: `position:absolute; left:50%; top:42%`, lệch `-42px` hai chiều, không bao giờ đổi vị trí theo chế độ.
- `.tanks` lúc nghỉ: một hàng flex căn giữa dưới lõi (đỉnh ở `42% + 120px`), thẻ rộng 220px, khoảng cách 28px; tràn ngang thì cuộn ngang.
- `.tank-tile.add .glass`: viền nét đứt `--control`, chữ "+ Thêm bể" giữa khối kính.

- [ ] **Step 1:** Viết markup + CSS theo Interfaces; bỏ hoàn toàn `.talk/.say/.pointer` cũ khỏi trang chủ và CSS.
- [ ] **Step 2:** Kiểm tra trên trình duyệt (mock): `python -m http.server 8766 --directory src`, playwright-cli mở
  `http://127.0.0.1:8766/index.html` cỡ 1280×800 → chụp ảnh: lõi ở giữa, 4 thẻ hình bể + thẻ "+ Thêm bể",
  không bong bóng. Đo `document.querySelector('.core').getBoundingClientRect()` → tâm x = 640 ± 1.
- [ ] **Step 3:** Bấm một thẻ bể → hash `#/tank/<id>/overview`; bấm "+ Thêm bể" → form ngăn trượt mở.
- [ ] **Step 4: Commit** `feat: home v2 rest state — fixed core, tank-shaped tiles`.

### Task 4: Chế độ nói (HUD)

**Files:** Modify `src/main.js`, `src/styles.css`.

**Interfaces — Consumes:** Task 2 (`greeting`, `dayKey`, `shouldAutoOpen`, `readGreeted`, `markGreeted`),
Task 3 markup, `speak(core, ms)` và `hud(core)` sẵn có, `call("get_briefing")` → `[{text, tank_id}]`.
**Produces:**
- `openTalk(home: HTMLElement, bubbles: Bubble[]): void`, `closeTalk(home: HTMLElement): void` — bật/tắt class
  `.talking` trên `.home2`; mỗi lần mở tăng biến đếm lượt `talkRun`, mọi bước chờ kiểm tra lượt còn hiệu lực
  và `home.isConnected`, sai thì dừng.
- `flip(els: Element[], change: () => void): void` — ghi vị trí, gọi `change`, đặt transform ngược rồi chuyển về 0 trong 800ms ease-in-out (bỏ qua khi reduced motion).
- Lúc nói, `.tanks` thành cột `position:absolute; left:48px`, căn giữa dọc, `overflow-y:auto` khi dài.
- `.talk-space`: từ `left: calc(50% + 96px)` tới `right: 48px`; `clip-path: circle(0 at -96px 42%)` → `circle(160% at -96px 42%)` trong 900ms.
- Đường chỉ `.tether` 2px cam từ mép lõi tới khung, `scaleX` 0→1 trễ 500ms. Khung `.hud-frame` bốn góc theo Global Constraints.
- Nội dung (sau 700ms): `<p class="greet">` = `greeting(new Date().getHours())` hiện từng từ (~60ms/ký tự,
  gọi `speak(core, text.length * 60)`), rồi mỗi bubble một `<p class="line">` trượt vào lần lượt, lõi nói theo độ dài.
  Khi dòng có `tank_id`, thêm `.lit` (viền cam 2px quanh `.glass`) cho `.tank-tile[data-tank=…]` trong lúc nói dòng đó.
- Mở: click lõi / Enter / Space (nút gốc). Đóng: click lõi khi đang mở, `.close-talk`, phím Esc (listener gỡ khi rời trang chủ); khi đóng trả focus về lõi.
- Tự mở: trong `home()`, nếu `shouldAutoOpen(readGreeted(), dayKey(new Date()))` thì `markGreeted(...)` rồi `openTalk`.

- [ ] **Step 1:** CSS cho `.talking`, `.talk-space`, `.tether`, `.hud-frame`, `.greet`, `.line`, `.lit`, `.close-talk`, `.hint` (ẩn khi nói) + nhánh `prefers-reduced-motion`.
- [ ] **Step 2:** `flip`, `openTalk`, `closeTalk`, lượt nói có hủy, tự mở.
- [ ] **Step 3:** E2E mock (như Task 3): xóa `localStorage` → tải lại → chế độ nói tự mở, `.greet` đúng câu của giờ máy;
  tải lại lần nữa → không tự mở.
- [ ] **Step 4:** Đo tâm lõi trước khi mở, giữa chuyển cảnh (400ms) và sau khi mở → cả ba bằng nhau (±1px).
- [ ] **Step 5:** Esc đóng, `document.activeElement` là `.core`; Enter trên lõi mở lại.
- [ ] **Step 6 (Review Focus 1, 3, 5):** (a) mở → đóng sau 300ms → mở ngay: sau 6s chỉ có 1 `.greet`, số `.line` = số bubble;
  (b) khi đang nói bấm một thẻ bể → hash đổi sang trang bể, console không lỗi; (c) trong mock xóa hết bể qua UI →
  trang chủ chỉ còn thẻ "+ Thêm bể", mở chế độ nói đọc "Mình là Bọt. Thêm bể đầu tiên để mình làm quen nhé."
- [ ] **Step 7:** Bật `prefers-reduced-motion` (playwright `--emulate`/`page.emulateMedia`) → mở: chữ hiện đủ ngay, không lỗi.
- [ ] **Step 8:** Build app (PowerShell, xem Context) và chạy thử trên app thật; chụp ảnh nghỉ + đang nói.
- [ ] **Step 9: Commit** `feat: home v2 talk mode — Bọt speaks from the core`.

### Task 5: Tài liệu và kết thúc

- [ ] Cập nhật `docs/wiki/log.md` (mục phiên), `docs/wiki/engineering/tauri-e2e-and-build.md` (E2E qua mock + `npm run test:ui`).
- [ ] Ghi mục Result của plan; sau khi người dùng nghiệm thu → `superpowers:finishing-a-development-branch`, chuyển plan sang `completed/`.

## Scope

In scope: mọi thứ trong spec v2. Out of scope: ô gõ câu hỏi / LLM, giọng đọc âm thanh, motion cho lõi mini.

## Risks And Recovery

- FLIP + transform trên thẻ có chữ có thể làm chữ mờ trong lúc trượt → không đặt `will-change` cố định (wiki motion).
- Rollback: mỗi task một commit; `git revert` task gây lỗi.

## Progress

- [x] Task 0 · [x] Task 1 · [x] Task 2 · [x] Task 3 · [x] Task 4 · [ ] Task 5

## Decisions

- 2026-11-06: Test JS bằng `node --test` tích hợp sẵn (Node 22), không thêm framework.
- 2026-11-06: localStorage hỏng → coi như đã chào (không tự mở) để không làm phiền mỗi lần.

## Validation

- Focused proof: `cargo test` (src-tauri), `npm run test:ui`.
- Integration/E2E: playwright-cli trên mock (Task 3–4) + app thật (Task 4 Step 8).
- Repository-required checks: `cargo test`.

## Result

Commit: `3ccdee4` (Task 0), `7bae43a` (Task 1), `005bb0d` (Task 2),
`06f49f8` (Task 3), `8b6053b` (Task 4).

Đã kiểm chứng: `cargo test` 12 passed; `npm run test:ui` 3 pass. E2E trên mock:
tâm lõi giống hệt trước/trong/sau khi mở; Esc và Enter; đóng-mở lại nhanh chỉ
một lượt nói; chuyển trang giữa lúc đang nói; 0 bể; reduced motion. Build app
thật và tự mở lần đầu trong ngày (chỉ đọc, không ghi DB).

Hạn chế (hoãn, nhỏ): lỗi `get_briefing` làm hỏng cả trang chủ; thẻ được nhắc
không tự cuộn vào tầm nhìn; briefing dài không cuộn trong khung; Esc chưa được
người dùng thử tay trên app thật.

Việc tiếp: người dùng nghiệm thu → `superpowers:finishing-a-development-branch`,
chuyển plan sang `completed/`.
