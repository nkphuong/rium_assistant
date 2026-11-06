# Tuya / Smart Life

Ổ cắm wifi thông minh; điều khiển qua Tuya Cloud API chính thức. Cập nhật: 2026-11-06.

## Đã xác minh (qua tài liệu)

- Cloud REST có nhật ký thiết bị: `/v1.0/devices/{id}/logs`, phân trang bằng
  `start_row_key` (tinytuya bọc thành `getdevicelog`).
- Cloud chỉ trả log cho các DP nằm trong danh sách DP "chính thức" của thiết bị;
  nếu spec thiết bị sai thì thiếu log — giới hạn phía server Tuya.
- Có điều khiển cục bộ (LAN) qua DP, nhưng cần `local_key` và tự ánh xạ DP ID.
- Tuya có tài liệu về thống kê điện năng (Power Management / Electricity
  Consumption Statistics) — chưa xác minh endpoint cụ thể.

## Chưa xác minh

- Cloud giữ log bao lâu (ảnh hưởng việc "đọc bù" khi người dùng lâu không mở máy).
- Ổ cắm cụ thể của người dùng có DP đo công suất hay không.
- Có crate Rust nào dùng được, hay phải tự gọi REST (ký HMAC-SHA256).

## Ý nghĩa cho app

- Ổ cắm đo công suất cho biết lọc/sưởi/CO2 có đang chạy: công suất tụt về 0 bất
  thường = tín hiệu sức khỏe quan trọng. Xem
  [../domain/tank-health-signals.md](../domain/tank-health-signals.md).
- Người dùng phải tạo project trên Tuya IoT Platform một lần (cần hướng dẫn từng bước).

## Nguồn

- https://tinytuya-lw.readthedocs.io/en/latest/generated/tinytuya.Cloud.html
- https://developer.tuya.com/en/docs/cloud/custom-statistics?id=Kaysz56temn1b
