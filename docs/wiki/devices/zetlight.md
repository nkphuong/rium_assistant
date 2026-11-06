# Zetlight UFO Pro Max (app Horizon)

Người dùng dùng Zetlight UFO Pro Max, chạy cả wifi và Bluetooth. Cập nhật: 2026-11-06.

## Đã xác minh (qua tài liệu)

- App "Horizon Aqua" là của Zetlight; điều khiển qua wifi (bộ A200 hoặc đèn có
  wifi sẵn). Hai chế độ: vào mạng riêng của đèn, hoặc STA qua router nhà.
- Không tìm thấy bài giải mã giao thức hay tích hợp Home Assistant nào.

## Giả định / hướng đi

- Giải mã qua wifi: bắt gói trong LAN (Wireshark) khi dùng app Horizon. Thiết bị
  tương tự (Pesetech skylight) dùng UDP cổng 8899 — chỉ là gợi ý, chưa kiểm.
- Wifi không cần máy tính ở gần bể → có thể làm sớm hơn Chihiros/WeekAqua.

## Nguồn

- https://www.allpondsolutions.co.uk/blogs/fishkeeping-advice/using-the-horizon-app-with-your-zetlights
- https://apps.apple.com/us/app/horizon-aqua/id1165281468
- https://community.home-assistant.io/t/pesetech-artificial-skylight-my-first-attempt-at-creating-an-integration/579060
