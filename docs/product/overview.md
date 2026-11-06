# Bọt (rium_assistant) — Tổng quan sản phẩm

Tên app tạm: **Bọt** — BỌT = **B**ể **Ổ**n **T**ốt (bọt khí, bong bóng hội thoại,
"bot" trợ lý). Có thể đổi sau; identifier kỹ thuật `com.rium.assistant` giữ nguyên.

Cập nhật: 2026-11-06. Trạng thái: **đã duyệt** (brainstorm 2026-11-06).

## Là gì, vì sao

Desktop app trên Windows làm "người bạn" cho các bể của người dùng: 2 hồ cá,
1 hồ thủy sinh, 1 bể terrarium (chỉ cây; bể có cả cây và con vật gọi là
paludarium). Người dùng dùng thiết bị của nhiều hãng — Chihiros, WeekAqua,
Zetlight UFO Pro Max, ổ cắm và cảm biến báo tràn Tuya/Smart Life — mỗi hãng một
app riêng. Họ muốn một nơi tập trung, và quan trọng nhất: **biết bể có khỏe
không mà không phải tự đo đạc**.

## Mục tiêu (toàn sản phẩm, theo thứ tự ưu tiên của người dùng)

1. Quản lý và điều khiển tập trung thiết bị của mọi hãng.
2. Lịch sử thay nước **tự suy ra**, không nhập tay.
3. Theo dõi sức khỏe bể từ dữ liệu sẵn có.
4. Lên ý tưởng bể mới: AI đề xuất trọn bộ, người dùng chỉnh.

## Không làm (non-goals)

- Nhắc lịch thay nước — người dùng đã đặt trong Apple Calendar.
- Bắt người dùng đo thông số nước rồi nhập tay.
- Cảm biến đo nước tự động đắt tiền.
- Đánh giá chất lượng nước qua ảnh chụp (bể trong vắt, ảnh vô dụng).
- Ảnh thật / render 3D cho ý tưởng bể mới.
- Phần cứng phụ chạy 24/7 (Raspberry Pi…): người dùng không muốn tự lắp.
- Tài khoản online, đồng bộ đa thiết bị.

## Phản mục tiêu (dù chạy được vẫn là thất bại)

- App đòi nhập liệu thường xuyên → người dùng sẽ quên, dữ liệu sai.
- App ồn ào, cứng nhắc. Giọng trợ lý phải dễ thương, nhẹ nhàng (cảm hứng JARVIS),
  khi mọi thứ ổn thì nói ngắn.

## Ràng buộc

- **Nền tảng**: Windows, desktop, một file .exe. Máy **không** chạy 24/7 → app
  đọc bù dữ liệu từ cloud khi mở; không có giám sát liên tục.
- **Công nghệ** (người dùng chọn): Tauri — core service bằng **Rust**, UI/UX bằng
  **HTML/CSS/JS**. Dữ liệu cục bộ trong **SQLite**.
- **Bluetooth**: máy tính hiện không ở gần bể → tính năng BLE làm sau.
- **AI online**: được chấp nhận (vd. Claude API, phí nhỏ mỗi lần) cho đề xuất bể
  mới, lời trợ lý, nhận diện loài từ ảnh. Cần API key của người dùng.
- Người dùng không rành kỹ thuật phần cứng: mọi thiết lập (Tuya developer,
  iCloud app password, API key) cần hướng dẫn từng bước trong app hoặc tài liệu.

## Các đợt phát hành

| Đợt | Nội dung | Spec |
|---|---|---|
| **MVP 1** | Khung app Tauri, màn hình chính "lõi biết nói" (câu theo quy tắc), hồ sơ bể + thiết bị + sinh vật + cây (nhập tay) | [tanks.md](tanks.md), [screens.md](screens.md) |
| 2 | Tuya: điều khiển ổ cắm, đọc log, công suất; cảm biến tràn | — |
| 3 | Apple Calendar (CalDAV) + tự suy ra lịch sử thay nước + câu hỏi xác nhận một chạm | — |
| 4 | Sức khỏe bể từ tín hiệu thiết bị + lịch sử | — |
| 5 | AI: lời trợ lý tự nhiên, đề xuất bể mới, nhận diện loài từ ảnh | — |
| 6 | BLE: Chihiros, WeekAqua; giao thức wifi Zetlight | — |

Thứ tự đợt 2–6 là đề xuất, chốt lại khi lập plan từng đợt.

Kiến thức nền: [../wiki/index.md](../wiki/index.md) (khả thi từng hãng thiết bị,
tín hiệu sức khỏe).
