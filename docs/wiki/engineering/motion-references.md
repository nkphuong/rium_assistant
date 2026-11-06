# Tham khảo motion cho UI (prompt-motion.com)

Rà soát ~180 mục trên https://prompt-motion.com/ bằng playwright-cli. Cập nhật: 2026-11-06.

## Kết luận

Site này chủ yếu là prompt **làm video motion** (showreel, video ra mắt sản phẩm),
render bằng HTML + Playwright hoặc Remotion. Không phải thư viện hiệu ứng UI tương
tác. Dùng được theo hai cách:

1. **Mượn nguyên lý motion** cho UI app (lõi trợ lý, bong bóng, chuyển tab).
2. **Làm video giới thiệu app** sau này (không thuộc MVP).

## Mục đáng dùng

| Mục | Dùng cho | Ghi chú |
|---|---|---|
| [White ball UI motion loop](https://prompt-motion.com/rossaxbt-94583b) (@rossaxbt) | Nguyên lý: nền gần đen + lưới chấm mờ, 1 màu nhấn, một vật thể dẫn mọi chuyển cảnh, spring overshoot nhỏ | Rất gần phong cách HUD của app; **cấm glow** — mâu thuẫn với lõi phát sáng, chỉ mượn phần chuyển động |
| [Shape morphing through UI states](https://prompt-motion.com/twoclipping-5cba86) (@twoclipping) | Ý tưởng: lõi trợ lý **biến hình** thành bong bóng / thẻ bể thay vì cắt cảnh | Bản sao: [demonugc-4c5753](https://prompt-motion.com/demonugc-4c5753) |
| [HTML app demo skill](https://prompt-motion.com/mengto-a7f4679) (@MengTo) | Làm demo/video giới thiệu app sau này | `npx skills add MengTo/Skills --skill html-demo`; stack React |
| [TasteSkill dashboard showcase](https://prompt-motion.com/lexnlin-f9b3bd8) | Xác nhận taste-skill (`design-taste-frontend`) có chế độ cho dashboard/app screen | **Đã cài** trên máy |

## Nguyên lý rút ra cho UI app

- Spring đóng (closed-form), overshoot rất nhỏ; **không** easing nảy (bouncy).
- Một phần tử xuyên suốt, biến đổi kích thước/bo góc/màu thay vì cắt cảnh; nội
  dung chữ đổi với một nhịp blur ngắn, có thời điểm vào/ra riêng để không chồng chữ.
- Không đặt `will-change` lên phần tử bị scale có chữ → chữ mờ.
- Tôn trọng `prefers-reduced-motion` (taste-skill và accessibility).

## Không dùng

Các mục showreel "go all out", video thương hiệu, nhân vật, nhạc: không liên quan UI app.
Bản quyền: "Videos and prompts belong to their creators" — chỉ mượn nguyên lý,
không chép nguyên văn prompt vào sản phẩm.
