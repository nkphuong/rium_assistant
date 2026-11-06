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
- Vướng mắc: superpowers mặc định lưu spec/plan ngoài cấu trúc Harness; skill Harness không tự hiện trong Claude Code → giải quyết bằng decision 0001.
- Phiên sau: tiếp tục brainstorm (thiết kế bể mới, lịch thay nước, cách tính
  sức khỏe, UI) → viết spec vào `docs/product/` → plan.
