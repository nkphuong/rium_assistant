# Hồ sơ bể — MVP 1

Cập nhật: 2026-11-06. Trạng thái: **đã duyệt**, chưa triển khai.

## Mục tiêu MVP 1

Khởi tạo codebase và có app chạy được để người dùng nhập thông tin cơ bản của
4 bể hiện có, xem chúng trên màn hình chính và trang chi tiết. Dữ liệu còn
nguyên sau khi tắt mở lại app.

## Dữ liệu

**Bể**
- Tên (bắt buộc).
- Loại: hồ cá · hồ thủy sinh · terrarium · paludarium (bắt buộc).
- Kích thước dài × rộng × cao (cm, tùy chọn).
- Thể tích (lít, tùy chọn). Nếu trống mà có kích thước → hiển thị ước tính
  D×R×C/1000 (ghi rõ "ước tính").
- Ngày setup (tùy chọn), ghi chú (tùy chọn).

**Thiết bị** (thuộc một bể)
- Tên/hiển thị (bắt buộc), hãng, model (tùy chọn).
- Công dụng: lọc · đèn · sưởi · CO2 · ổ cắm · cảm biến · khác.
- Kết nối: Tuya/Smart Life · Bluetooth · wifi · không thông minh.
- Ngày mua, ghi chú (tùy chọn).
- MVP 1 chỉ ghi chép, chưa điều khiển.
- Cảm biến báo tràn được dùng chung giữa các bể (người dùng mang theo khi thay
  nước): MVP 1 cho phép gán nó vào một bể bất kỳ; mô hình "thiết bị dùng chung"
  để builder quyết định khi làm đợt 3.

**Sinh vật** (thuộc một bể): tên loài (gõ tự do), số lượng (số nguyên ≥ 1),
ghi chú.

**Cây** (thuộc một bể): tên (gõ tự do), lớp cảnh: trải nền · tiền cảnh · trung
cảnh · hậu cảnh · không rõ; ghi chú. Bể terra của người dùng có rêu và cây chưa
biết tên → phải nhập được tên kiểu "Cây chưa rõ 1".

Mọi bản ghi đều sửa và xóa được. Xóa bể → hỏi xác nhận, xóa kèm thiết bị/sinh
vật/cây của bể đó.

## Lời trợ lý (MVP 1)

Sinh theo quy tắc, không AI, không mạng.

**Hồ sơ "đầy đủ"** (quyết định của builder, ưu tiên ít nhắc — người dùng ghét app
ồn ào):

| Loại bể | Cần có |
|---|---|
| Hồ cá | ≥1 thiết bị, ≥1 sinh vật (cây không bắt buộc) |
| Hồ thủy sinh | ≥1 thiết bị, ≥1 cây (sinh vật không bắt buộc) |
| Terrarium | ≥1 cây (thiết bị không bắt buộc — bể terra hiện chưa có thiết bị) |
| Paludarium | ≥1 cây, ≥1 sinh vật |

Các trường tùy chọn (kích thước, thể tích, ngày setup, ghi chú) không tính.

Hành vi:
- Chưa có bể nào → lời chào + mời thêm bể đầu tiên.
- Mỗi bể chưa đầy đủ → một bong bóng nhắc nhẹ, nói rõ thiếu gì.
- Mọi bể đầy đủ → một câu ngắn kiểu "Cả 4 bể đều đã có hồ sơ đầy đủ 🌿".

Trạng thái trong MVP 1 chỉ bằng **chữ, không màu** (theo [screens.md](screens.md):
màu nhấn chỉ cho lõi và dữ liệu, bể ổn không tô màu): bể đầy đủ → "Đủ hồ sơ"
màu xám meta; chưa đầy đủ → nói rõ thiếu gì ("Chưa có thiết bị") màu xám phụ.
**Không dùng hổ phách/đỏ** cho tới khi có dữ liệu sức khỏe (đợt 4), để không hiểu
nhầm là "bể bệnh".

## Không có trong MVP 1

Tuya, calendar, cảm biến, lịch sử thay nước, sức khỏe, AI, BLE, ảnh, danh mục
loài/cây chọn sẵn, nhập/xuất dữ liệu, nhiều ngôn ngữ.

## Quyết định của builder (đã nêu với người dùng)

- UI HTML/CSS/JS thuần, không framework (React/Vue/Svelte).
- Tên loài/cây gõ tự do.
- Còn lại để builder: cấu trúc thư mục, crate SQLite, migration, vị trí file DB
  (thư mục dữ liệu app chuẩn của Windows), cách gọi lệnh Tauri.

## Điều kiện tiên quyết

Máy người dùng có Node 22 và WebView2; **chưa có** Rust toolchain và MSVC Build
Tools (C++). Plan phải có bước cài (người dùng có thể cần tự chạy installer) và
kiểm chứng `cargo --version`.

## Chứng minh hoàn thành

- Test Rust cho tầng lưu trữ: tạo/sửa/xóa bể và bản ghi con, xóa bể xóa kèm con,
  dữ liệu còn sau khi mở lại DB.
- Test cho bộ quy tắc sinh lời trợ lý.
- Build bản phát hành (`tauri build`, ra file .exe/trình cài đặt) và chạy bản đó:
  agent nhập dữ liệu mẫu, tắt, mở lại, dữ liệu còn nguyên; DB nằm trong thư mục
  dữ liệu app của Windows (không nằm cạnh source).
- Nghiệm thu: **người dùng** tự cài bản .exe và nhập 4 bể thật của mình (chỉ họ
  có dữ liệu). Plan kết thúc bằng bước bàn giao này.
