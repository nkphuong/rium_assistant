# Nhật ký phiên làm việc

Mới nhất ở trên. Mỗi phiên một mục:

```
## YYYY-MM-DD — <chủ đề>
- Làm được: ...
- Quyết định: ... (link decisions/ nếu là quyết định lâu dài)
- Học được: ... (link trang wiki đã tạo/sửa)
- Trạng thái: ... (link plan active nếu có)
- Vướng mắc: ... (friction lặp lại của agent, nếu có)
- Phiên sau: ...
```

## 2026-11-06 (tối) — Logo Bọt

- Làm được: thay logo mặc định của Tauri. Ba hướng (bong bóng thoại / chữ b nổi
  bọt / Ọ nặng), người dùng chọn **Ọ nặng**. Bộ logo trong `docs/brand/`
  (biểu tượng, bản cỡ nhỏ, chữ "bọt", bản một màu, icon app); sinh lại
  `src-tauri/icons/` bằng `npx tauri icon`.
- Quyết định: màu logo dùng lại `--accent #4cb3f0` / `--ground #0c0d0f`; chữ ọ
  trong wordmark chính là biểu tượng nên không có lockup ghép.
- Học được: [../brand/README.md](../brand/README.md).
- Vướng mắc: `presentation_board.py` tính đường dẫn SVG theo thư mục chứa spec
  JSON, phải đặt spec cạnh file SVG. Shell của agent không có `cargo` trong PATH:
  build bằng PowerShell sau `$env:Path = "$env:USERPROFILE\.cargo\bin;" + $env:Path`.
- Sau đó (nhánh `feat/light-theme-drawer-form`): sửa dialog lệch trái (reset
  `* { margin: 0 }` xóa `margin: auto` của dialog); người dùng chọn bộ màu sáng
  **"Nước ngày"** (`--accent #1d7fc4`) thay nền đen, và form thêm/sửa thành
  **ngăn trượt bên phải**: nhóm có tiêu đề, select → dãy nút radio, D×R×C một
  hàng, ô thể tích gợi ý ước tính (cùng công thức `litres()` của trang chi tiết).
- Lõi trợ lý "nói" (kiểu HUD): `speak()` trong `main.js` đặt `--amp` theo giọng
  giả (âm tiết 70–130ms, 15% ngắt) suốt ~65ms/ký tự của bong bóng. Người dùng
  muốn "sống", không tròn hoàn hảo → lõi là SVG `hud()`: tâm tròn; viền giọng
  méo theo nhiễu (mạnh khi nói); 3 lớp cung/vạch dash không đều, mỗi lớp quay
  tốc độ trôi riêng (tích hai sin lệch pha), tăng tốc khi nói. Reduced motion: ảnh tĩnh.
  Rồi 3D + cam: mỗi vòng là một mặt phẳng SVG riêng, CSS 3D (`perspective` +
  `preserve-3d`, góc nghiêng chao theo sin) — không thêm thư viện; tâm là quả cầu
  `radialGradient`. Màu riêng của trợ lý `--core #f2780c` (lõi, đường chỉ, lõi
  mini); UI còn lại giữ `--accent` xanh. Thêm lớp: 8 mặt phẳng trong mảng `RINGS`
  (nghiêng x, y, tốc độ, hình SVG) + mặt giọng/quả cầu; lề lõi 26px cho vòng ngoài.
  Rồi cam cháy `--core #c85a06`, quả cầu bớt bóng; 11 lớp, nét dày/đậm hơn; đệm dọc dải thẻ 40px.
- Bấm vào lõi → Bọt nói câu kế tiếp (`chat()` trong `main.js`): câu briefing thật,
  số bể, rồi `SMALL_TALK` (không chứa số liệu); bỏ qua khi đang nói; giữ tối đa 3
  bong bóng thêm. Lõi giờ là `<button aria-label="Nói chuyện với Bọt">`.
  Học được: kiểm thử bằng cách đổi hash 2 lần liên tiếp gây 2 lần render chồng → kết quả nhiễu; đo trên trang đã ổn định.
- Phiên sau: tùy chọn đặt wordmark vào header app; tra cứu nhãn hiệu trước khi
  công bố; ô ngày vẫn hiện `mm/dd/yyyy` theo locale WebView2.

## 2026-11-06 (chiều) — Thiết kế, đặt tên, triển khai MVP 1

- Làm được: review thiết kế bằng taste-skill (style true-black flat, bảng màu
  "nước đêm", chỉ lõi phát sáng); tra prompt-motion.com; viết spec
  `docs/product/` + plan `docs/plans/active/mvp-1-tank-profiles.md`; cài Rust +
  MSVC Build Tools; triển khai 9 task trên nhánh `feat/mvp-1` (Tauri + SQLite,
  10 test Rust, màn hình chính + chi tiết + form); build bản cài NSIS.
- Quyết định: tên app tạm **Bọt** (BỌT = Bể Ổn Tốt), identifier giữ
  `com.rium.assistant`; dùng `rg` thay grep; taste-skill là design skill duy nhất.
- Học được: [engineering/tauri-e2e-and-build.md](engineering/tauri-e2e-and-build.md),
  [engineering/motion-references.md](engineering/motion-references.md).
- Trạng thái: review cuối xong (3 lỗi Important đã sửa, 5 minor hoãn — xem plan),
  người dùng **đã nghiệm thu**; `feat/mvp-1` merge vào `main`; plan ở `completed/`.
- Vướng mắc: heredoc/python trong bash làm hỏng `\r`, `\B` trong đường dẫn
  Windows (lặp 3 lần) → khi nội dung có dấu `\`, sửa file bằng công cụ Edit/Write,
  không dùng heredoc + python.
- Phiên sau: brainstorm đợt 2 (Tuya: điều khiển ổ cắm, đọc log, cảm biến tràn).
  Nợ minor của MVP 1 nằm trong mục Result của plan.

## 2026-11-06 — Brainstorm ý tưởng & dựng nền dự án

- Làm được: brainstorm (superpowers) về app desktop Rust làm bạn với các bể
  aquarium/terrarium; tra cứu khả năng điều khiển 4 hãng thiết bị; `git init`;
  cài repository-harness 0.1.10; dựng wiki + nhật ký phiên; thêm `CLAUDE.md`.
- Quyết định (từ người dùng):
  - App là **trung tâm điều khiển** thiết bị thông minh, không chỉ sổ ghi chép.
  - Ưu tiên: (1) quản lý tập trung thiết bị, (2) lịch thay nước, (3) theo dõi
    sức khỏe bể — quan trọng nhất.
  - Sức khỏe bể **không** dựa vào đo tay, cảm biến đắt, hay ảnh chụp (bể trong
    vắt). Dựa vào dữ liệu thiết bị + lịch sử chăm sóc; video có thể làm sau.
  - Máy tính **không** chạy 24/7; người dùng **không** muốn tự lắp Raspberry Pi.
    → Chỉ desktop app, đọc bù dữ liệu từ cloud khi mở máy.
  - Máy tính hiện **không** ở gần bể → các tính năng Bluetooth (Chihiros,
    WeekAqua) để **phiên sau**.
- Học được: [devices/overview.md](devices/overview.md),
  [domain/tank-health-signals.md](domain/tank-health-signals.md).
- Trạng thái: đang brainstorm, chưa có spec. Ponytail 5.3.3 đã cài (người dùng
  tự chạy lệnh). Quy trình dung hòa các công cụ:
  [decision 0001](../decisions/0001-dev-workflow.md).
- Ý tưởng bể mới (người dùng kể): chọn kích thước bể, lọc, phân nền, cốt nền,
  cây theo tiền/trung/hậu cảnh; tìm thiết kế có sẵn để hình dung; mua về rồi làm
  theo cảm tính. Khó nhất: **trung hòa** — cá nào sống chung với cá nào, cây nào
  hợp môi trường nào, số lượng bao nhiêu.
- Quyết định bể mới: app **đề xuất trọn bộ**, người dùng chỉnh sau. Hình dung
  bằng **nguyên lý bố cục** (tam giác, lõm/lồi/đảo, số đá lẻ, đường dẫn mắt,
  chiều sâu), không phải ảnh thật. Người dùng **chấp nhận dùng AI online**
  (vd. Claude API, có phí nhỏ mỗi lần) cho phần đề xuất.
- Review (ponytail-review): gộp quy tắc quy trình về một nơi (`AGENTS.md`),
  viết lại `docs/README.md` thành bản đồ của dự án này.
- Vướng mắc: superpowers mặc định lưu spec/plan ngoài cấu trúc Harness; skill Harness không tự hiện trong Claude Code → giải quyết bằng decision 0001.
- Phiên sau: tiếp tục brainstorm (thiết kế bể mới, lịch thay nước, cách tính
  sức khỏe, UI) → viết spec vào `docs/product/` → plan.
