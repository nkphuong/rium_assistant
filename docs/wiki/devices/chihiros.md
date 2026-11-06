# Chihiros

Đèn (và bơm châm phân) Chihiros, điều khiển qua Bluetooth LE. Cập nhật: 2026-11-06.

## Đã xác minh (qua tài liệu)

- Dự án `TheMicDiet/chihiros-led-control` (Python CLI + tích hợp Home Assistant)
  giải mã giao thức: decompile app Magic cũ + bắt gói BLE từ app My Chihiros mới.
  Lệnh ghi vào characteristic RX của BLE UART service. Chi tiết byte ở
  `docs/protocol.md` của repo (chưa đọc).
- Hỗ trợ: A2, WRGB II, WRGB VIVID III, C II, Universal WRGB, Tiny Terrarium Egg,
  Z Light TINY, Commander 1 và 4.
- Dự án AquaBle (`caleb-venner/AquaBle`) hỗ trợ cả đèn và bơm châm phân Chihiros.
- Đèn chạy theo lịch nạp sẵn, không lưu lịch sử.

## Ràng buộc

- Tầm BLE vài mét; máy tính người dùng hiện không ở gần bể → để phiên sau.
- Người dùng chưa cho biết model Chihiros cụ thể.

## Nguồn

- https://github.com/TheMicDiet/chihiros-led-control
- https://github.com/caleb-venner/AquaBle
