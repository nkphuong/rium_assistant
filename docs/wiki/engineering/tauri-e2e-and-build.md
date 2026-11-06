# Tauri: E2E bằng playwright-cli và build trên Windows

Bài học từ MVP 1 (2026-11-06).

## E2E trên app thật

WebView2 nhận tham số Chromium qua biến môi trường, nên có thể mở cổng debug và
gắn playwright-cli vào cửa sổ app (cả bản dev lẫn bản release):

```bash
export WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9333
npm run tauri dev            # hoặc chạy "%LOCALAPPDATA%\Bọt\rium.exe"
playwright-cli -s=app attach --cdp=http://localhost:9333
playwright-cli -s=app click "getByRole('button', { name: 'Thêm bể' })"
playwright-cli -s=app --raw eval "window.__TAURI__.core.invoke('list_tanks')"
```

- Dùng `exact: true` khi tên nút là tiền tố của nút khác ("Sửa" vs "Sửa bể").
- E2E chạy trên **DB thật** của người dùng (`%APPDATA%\com.rium.assistant\rium.db`):
  xóa dữ liệu mẫu sau khi test. Muốn test lặp lại an toàn cần một đường dẫn DB
  riêng cho test (chưa làm).
- Đã bắt được lỗi thật: trường bắt buộc gửi `null` → serde báo lỗi tiếng Anh.

## E2E không đụng DB thật (mock)

- `python -m http.server 8766 --directory src`, rồi playwright-cli mở
  `http://127.0.0.1:8766/index.html`. `api.js` tự dùng `mock.js` (dữ liệu trong
  bộ nhớ, xóa được qua UI). playwright-cli chặn `file:` nên phải qua HTTP.
- Test logic giao diện thuần: `npm run test:ui`.
- Shell Bash của agent không có `cargo` trong PATH → dùng PowerShell với
  `$env:Path = "$env:USERPROFILE\.cargo\bin;" + $env:Path`.

## Build

- Cần Rust (msvc) + Visual Studio Build Tools workload VCTools (cài bằng winget).
- WiX/MSI hỏng với tên có dấu ("Bọt") do code page 1252 → `bundle.targets = ["nsis"]`.
- Bản cài NSIS cài theo user vào `%LOCALAPPDATA%\<productName>`; cài im lặng: `setup.exe /S`.
- Identifier quyết định thư mục dữ liệu; **không đổi** identifier khi đổi tên app.

## UI

- Quầng sáng scale 1.7 trong vùng `overflow-x: auto` sinh thanh cuộn dọc trắng →
  `overflow-y: hidden`, đủ padding, và `color-scheme: dark` ở `:root`.
- taste-skill `inspect.mjs` không nhận URL có hash: tạo file preview tạm đặt
  `location.hash` trước khi nạp `main.js`.
