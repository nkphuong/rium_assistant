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

> **Đã thay đổi trong phiên 2026-11-06 (tối)** — bảng màu tối ở trên đã được thay
> bằng bộ sáng **"Nước ngày"** (`src/styles.css`: nền `#f3f5f6`, bề mặt `#fff`,
> chữ `#12171c`, nhấn xanh `#1d7fc4`), và trợ lý có **màu riêng cam cháy
> `--core #c85a06`**. Lõi là HUD 3D nhiều lớp (xem `docs/wiki/log.md`). Màn hình
> chính được thiết kế lại ở mục "Màn hình chính v2" dưới đây; mục "Lõi biết nói"
> bên dưới chỉ còn giá trị lịch sử.

## Màn hình chính v2 — "Bọt lên tiếng" (người dùng duyệt prototype, 2026-11-06)

**Vì sao:** lời của Bọt hiện thành bong bóng trắng không cho cảm giác Bọt đang
nói, dễ lẫn với thẻ bể; mỗi lần thêm bong bóng lõi bị đẩy đi. Người dùng muốn
bấm vào Bọt thì "mở ra" không gian Bọt nói, giống trợ lý HUD trong phim.

**Mục tiêu**
- Lõi đứng **cố định** giữa vùng nội dung, không bao giờ bị đẩy (kể cả khi đổi chế độ).
- Phân biệt tức thì: **xanh dương = bể/nước**, **cam = Bọt**.
- Bọt "nói": chữ xuất hiện theo nhịp giọng của lõi.

**Không làm lần này**: gõ câu hỏi / chat với mô hình AI (tích hợp LLM sau — để
chỗ cho ô nhập sau này nhưng chưa vẽ); giọng đọc âm thanh; motion cho lõi mini.

**Thất bại dù chạy được nếu**: lõi xê dịch khi Bọt nói; lời Bọt trông như một
thẻ dữ liệu; chuyển cảnh giật hoặc chữ hiện trước khi không gian mở xong.

### Trạng thái nghỉ
- Lõi ở giữa; dưới lõi một dòng nhỏ "Bấm để nghe Bọt" (ẩn khi đang nói).
- Các bể xếp một hàng dưới lõi, căn giữa. **Thẻ bể mới = hình chiếc bể**: khối
  kính xanh nhạt (viền trong xanh), vạch mực nước gần mép trên, dải nền cát ở
  đáy, vài thân cây; dưới khối kính: tên bể (15/600) và một dòng "chấm trạng
  thái · loại · kích thước". Chấm xanh lá = đủ hồ sơ, chấm vàng nâu
  (`--warning`) = còn thiếu. Bấm thẻ → trang chi tiết bể (như cũ).
- Không còn bong bóng lời nhắn trên màn hình chính.

### Trạng thái đang nói (kiểu B · "Bảng HUD")
- Mở bằng: bấm lõi (chuột hoặc Enter/Space), hoặc **tự mở lần đầu mở app trong
  ngày** (ngày theo giờ máy; các lần quay lại trang chủ trong cùng ngày chờ bấm).
- Đóng bằng: bấm lại lõi, nút "Về các bể" (góc trên phải), hoặc Esc.
- Chuyển cảnh (lõi đứng yên):
  1. Các bể trượt thành **một cột bên trái** (800ms ease-in-out).
  2. Vùng nói bên phải lõi **lộ ra theo vòng tròn lan từ tâm lõi** (900ms).
  3. Một đường chỉ cam 2px vươn từ mép lõi tới khung (trễ ~500ms).
  4. Khung HUD: bốn góc cam (dày 3px, cạnh 22px), không nền, không viền đầy.
- Nội dung, theo thứ tự, chỉ bắt đầu sau khi vùng nói mở (~700ms):
  1. **Lời chào theo giờ máy** (cỡ 24/600), hiện từng từ theo nhịp nói (~60ms/ký tự):
     0–5h "Khuya rồi, bạn vẫn còn thức à?" · 5–11h "Chào buổi sáng!" ·
     11–13h "Chào buổi trưa!" · 13–18h "Chào buổi chiều!" · 18–22h "Chào buổi tối!" ·
     22–24h "Muộn rồi, mình kể nhanh nhé."
  2. **Các dòng tình hình** (16px), mỗi dòng trượt vào lần lượt, lõi "nói" trong
     thời gian tương ứng độ dài dòng. Nội dung lấy từ lời trợ lý theo quy tắc
     hiện có (`get_briefing`, xem [tanks.md](tanks.md#lời-trợ-lý-mvp-1)); chỉ
     **một** lời chào — lời chào theo giờ thay cho câu chào chung trong briefing.
  3. Khi một dòng nhắc tới một bể (có `tank_id`), thẻ bể đó ở cột trái **sáng
     viền cam** trong lúc dòng được nói (thay cho đường chỉ lõi→bể cũ).
- Đóng giữa chừng: dừng nói ngay, nội dung biến mất cùng vùng nói thu lại.
- Mở lại: nói lại từ đầu.

### Chung
- `prefers-reduced-motion`: không trượt/lan/hiện từng từ — đổi bố cục và hiện
  toàn bộ chữ ngay; lõi đứng yên (như hiện tại).
- Vùng nói là `aria-live="polite"`; lõi là nút có nhãn "Nói chuyện với Bọt".
- Cửa sổ tối thiểu 960px: cột bể ~220px bên trái, lõi giữa, vùng nói phần còn lại.
- Prototype đã duyệt (tham khảo, không phải code sản phẩm):
  [prototypes/home-v2.html](prototypes/home-v2.html) (mở bằng trình duyệt; chọn kiểu B).

### Quyết định của agent (người dùng soát khi duyệt)
- **Vị trí lõi**: tâm lõi ở giữa chiều ngang vùng nội dung, ở ~42% chiều cao,
  **giống hệt ở cả hai chế độ**. Lúc nghỉ hàng bể nằm dưới lõi; lúc nói cột bể
  ở mép trái (cách 48px), vùng nói bắt đầu ~96px bên phải tâm lõi tới cách mép
  phải 48px. Vòng lộ ra lấy tâm tại tâm lõi.
- **Thêm bể**: thành một **thẻ chỗ trống hình bể** (khung kính nét đứt, chữ
  "+ Thêm bể") ở cuối hàng/cột bể, có mặt ở cả hai chế độ. Khi chưa có bể nào,
  hàng chỉ có thẻ này.
- **Lời chào trùng**: sửa ở core (`briefing.rs`) cho rõ một nguồn: bỏ câu chào
  chung "Chào bạn. Mình xem qua hồ sơ các bể rồi." và đổi câu 0 bể thành "Mình
  là Bọt. Thêm bể đầu tiên để mình làm quen nhé."; cập nhật test Rust tương ứng.
  Lời chào theo giờ do giao diện thêm vào đầu.
- **Câu nói vặt khi bấm (`chat()`/`SMALL_TALK`)**: bỏ — bấm lõi giờ là mở/đóng.
- **Tự mở**: lần render trang chủ đầu tiên trong ngày (theo giờ máy) tự mở chế
  độ nói và đánh dấu "đã chào hôm nay" ngay lúc đó; các lần sau trong ngày không tự mở.

**Để lại cho người làm**: con số timing chi tiết ngoài các mốc trên; cách lưu
"đã chào hôm nay" (localStorage là đủ); số bể nhiều hơn chiều cao cột (cuộn
trong cột); hình cây trong thẻ bể (trang trí, có thể khác theo loại bể).

## Màn hình chính — "Lõi biết nói" (lịch sử, thay bởi v2)

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
