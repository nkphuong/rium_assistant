# Thiết bị — tổng quan khả thi

Bảng khả thi điều khiển từ desktop app cho các hãng người dùng đang dùng.
Cập nhật: 2026-11-06.

| Hãng | Kết nối | Đã có người giải mã? | Lịch sử dữ liệu | Khả thi | Ghi chú |
|---|---|---|---|---|---|
| Tuya / Smart Life | Wifi, cloud API chính thức | Không cần (có API) | Có (device logs trên cloud) | Cao | Cần tài khoản Tuya IoT developer |
| Chihiros | Bluetooth LE | Có | Không | Cao | Máy tính phải ở gần bể |
| Zetlight UFO Pro Max | Wifi + BLE (app Horizon) | Chưa thấy | Chưa rõ | Trung bình | Wifi dễ bắt gói tin hơn BLE |
| WeekAqua | Bluetooth LE | Chưa thấy | Không | Thấp | Phải tự giải mã BLE |

## Ràng buộc từ người dùng (2026-11-06)

- Máy tính không chạy 24/7 → không giám sát liên tục; đọc bù từ cloud khi mở.
- Máy tính hiện không ở gần bể → BLE (Chihiros, WeekAqua) làm ở phiên sau.

Chi tiết: [tuya](tuya.md), [chihiros](chihiros.md), [zetlight](zetlight.md),
[weekaqua](weekaqua.md).
