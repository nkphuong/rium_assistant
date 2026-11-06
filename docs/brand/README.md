# Logo Bọt — hướng dẫn dùng

**Ý tưởng:** chữ **Ọ** của BỌT. Vòng tròn có lòng lệch tâm là một bọt khí bắt sáng;
dấu nặng là hạt bọt nhỏ. Lặp lại vòng + chấm của "lõi phát sáng" trong UI.

## File (trong `logo/`)

| File | Dùng khi |
|---|---|
| `bot-symbol.svg` | Biểu tượng gốc, từ 33 px trở lên |
| `bot-symbol-small.svg` | Bản cỡ nhỏ (vòng dày hơn, khe rộng hơn), ≤ 32 px: favicon, taskbar |
| `bot-wordmark.svg` | Chữ "bọt" — chữ ọ chính là biểu tượng, nên không ghép thêm biểu tượng bên cạnh |
| `*-black.svg`, `*-white.svg`, `*-mono-4cb3f0.svg` | Bản một màu: đen, trắng, xanh thương hiệu |
| `bot-symbol-app-icon.svg` / `-1024.png` | Icon app; nguồn để sinh `src-tauri/icons/` |

Sinh lại icon app: `npx tauri icon docs/brand/logo/bot-symbol-app-icon-1024.png`
(xóa thư mục `android/`, `ios/` và `64x64.png` sinh kèm — app chỉ chạy desktop).

## Màu

| Tên | HEX | Ghi chú |
|---|---|---|
| Xanh lõi | `#4cb3f0` | Logo trên nền tối; màu của icon app |
| Xanh ngày | `#1d7fc4` | `--accent` của UI sáng "Nước ngày" (`src/styles.css`); logo trên nền sáng |
| Nước đêm | `#0c0d0f` | Nền ô icon app |
| Trắng | `#ffffff` | |

- Trên nền tối: logo xanh lõi (tương phản ~8:1) hoặc trắng.
- Trên nền sáng: logo xanh ngày, đen hoặc nước đêm. Không đặt xanh lõi trên nền
  trắng (tương phản ~2,4:1, quá nhạt).

## Khoảng trống và cỡ tối thiểu

- Khoảng trống quanh logo ≥ đường kính dấu nặng.
- Biểu tượng: tối thiểu 16 px (dùng bản small khi ≤ 32 px).
- Chữ "bọt": cao tối thiểu 20 px.

## Không được

- Bỏ dấu nặng, đổi chỗ dấu nặng, hay làm lòng vòng tròn đồng tâm.
- Kéo giãn, xoay, thêm bóng đổ / gradient / viền.
- Gõ chữ "bọt" bằng font khác thay cho file wordmark.
- Thêm màu thứ ba.

## Lưu ý

Chưa tra cứu nhãn hiệu; cần tra trước khi công bố rộng.
