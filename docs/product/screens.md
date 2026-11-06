# Màn hình và giọng trợ lý

Cập nhật: 2026-11-06. Các hướng đã được người dùng chọn qua mockup.

## Phong cách chung (review bằng taste-skill, 2026-11-06)

Style taste-skill: **true-black flat** (app, dark), mặt riêng: **"nước đêm"**.
Sheet: `.taste-skill/direction.json` (seed 595730179). Mockup tham chiếu:
`.superpowers/brainstorm/*/content/design-v4.html`.

**Màu** — một nền, một mực, một màu nhấn; màu chỉ đặt lên dữ liệu (≤3% điểm ảnh):

| Vai | Giá trị |
|---|---|
| Nền (đen lạnh, không navy) | `#0c0d0f` |
| Bề mặt / lồng | `#15171a` / `#23262b` — tách bằng độ sáng, không viền, không bóng |
| Chữ / phụ / meta | `#ffffff` / `#b4b4b4` / `#949494` (đều ≥4.5:1) |
| Nhấn "nước" | `#4cb3f0` — chỉ lõi trợ lý và đường dữ liệu; không trên nút/tab/nav |
| Cần xem | `#e5a93b` (pill nền `#2b2414`) |
| Sự cố | `#e5566f` (pill nền `#2c1a20`) |

- **Bể ổn không tô màu** (chữ trắng/xám). Chỉ bể có chuyện mới có màu.
- **Phát sáng chỉ ở lõi trợ lý** — ngoại lệ có chủ đích, là phần tử đặc trưng
  của sản phẩm. Không glow ở viền thẻ, nút, chữ. Không gradient, glass, emoji.
- Nút chính: pill trắng chữ đen (đảo màu); nút phụ: pill viền `#444`.
- Bo góc mềm: thẻ 20px, nút 999px.

**Chữ**: Inter (có bộ ký tự tiếng Việt), 400/500/600. Cỡ: tiêu đề 20, mục 16,
số KPI 24, thân 14, nhỏ 12. Số dùng `tabular-nums`. Viết hoa kiểu câu.

**Chuyển động kiểu JARVIS** (transform + opacity; tôn trọng
`prefers-reduced-motion` → hiện ngay, không di chuyển):
- *Thở*: quầng lõi phồng/xẹp chu kỳ 4,2s; vòng trong quay chậm (đang nghe).
- *Kể*: bong bóng nổi lần lượt cách 0,7s, nhô 12px trong 450ms ease-out
  `cubic-bezier(.22,1,.36,1)`, không nảy; bấm để hiện hết ngay.
- *Chỉ* (chuyển động đặc trưng): khi trợ lý nhắc một bể, đường sáng 1px chạy từ
  lõi tới bể đó.
- *Biến hình*: vào chi tiết bể → lõi thu nhỏ bay lên đầu trang (450ms ease-in-out).
- *Số lăn*: ô số đếm lên khi mở tab.
- Hover/nhấn nút: đổi nền 200ms, nhấn co 0.97.

## Màn hình chính — "Lõi biết nói" (người dùng chọn phương án 2)

- Thanh trên: tên app + dấu thời gian đọc bù ("Đọc bù dữ liệu lúc 08:12 · 4 ngày
  kể từ lần mở trước") — không để trống.
- Dải ngang gồm các bể, lõi sáng ở giữa. Mỗi bể: tên + một dòng trạng thái bằng
  chữ ("Ổn", "Lọc tắt 6 giờ"); chữ trạng thái đổi màu chỉ khi có chuyện. Không
  emoji, không viền phát sáng.
- Bên dưới: các **bong bóng hội thoại** của trợ lý (bề mặt `#15171a`, bo
  20/20/20/6), mỗi chuyện một bong bóng, câu quan trọng tô màu "cần xem".
  Bong bóng có thể chứa **nút trả lời một chạm** (dùng từ đợt 3).
- Bấm vào một bể → trang chi tiết bể.
- Nút thêm bể mới.

**MVP 1**: lời trợ lý sinh theo quy tắc từ dữ liệu đã nhập (không AI). Xem
[tanks.md](tanks.md#lời-trợ-lý-mvp-1).

## Trang chi tiết bể — Tab và số liệu (người dùng chọn phương án B)

- Đầu trang: lõi nhỏ màu theo trạng thái, tên bể, thể tích, trạng thái.
- Tab: **Tổng quan · Thiết bị · Sinh vật · Cây · Lịch sử**. Tab đang chọn chỉ
  sáng chữ (#bbb → #fff), không gạch màu.
- Tổng quan: **một dải số chia bằng vạch mảnh** (không 4 thẻ rời, không icon,
  không sparkline): nhãn nhỏ, số 24px, dòng mốc so sánh ("lịch 14 ngày").
  Biểu đồ: một đường 2px màu nước, không tô, 3 lưới mờ, **chú thích sự kiện ngay
  trên biểu đồ** ("Tắt 01:00–07:00 thứ Ba").
  MVP 1 chỉ có các ô tính được từ dữ liệu nhập: số thiết bị, số sinh vật / số
  loài, số loại cây, số ngày từ ngày setup. Không có biểu đồ.
- Tab Lịch sử: có từ đợt 3; MVP 1 ẩn tab hoặc hiển thị "sắp có".

## Lên ý tưởng bể mới (đợt 5, người dùng đã duyệt mockup)

Luồng 5 bước theo thói quen người dùng: **loài cá → chỗ đặt (kích thước) → bố
cục → trọn bộ → ước tính chi phí (có thể bỏ qua)**.

- Bước 3: trợ lý giải thích nhu cầu của loài, đưa 2–3 phương án bố cục dạng **sơ
  đồ mặt trước** (tam giác, lõm/chữ U, đảo/lồi…): khối cây theo lớp cảnh, đá số
  lẻ, lũa, đường dẫn mắt, điểm nhấn quy tắc 1/3. Không ảnh thật.
- Bước 4: kích thước bể, lọc, phân nền, cốt nền, cây theo lớp, bạn cùng bể + số
  lượng; mỗi mục ghi vì sao hợp; cảnh báo khi người dùng sửa thành thứ không hợp
  (trung hòa loài, môi trường cây, mật độ).
- Mockup tham khảo: `.superpowers/brainstorm/*/content/new-tank.html` (không
  commit; mô tả ở trên là nguồn sự thật).
