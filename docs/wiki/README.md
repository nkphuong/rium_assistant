# Wiki — bộ não thứ hai của dự án

Wiki này do agent viết và bảo trì (theo ý tưởng "LLM wiki" của Karpathy):
markdown thuần, không RAG. Agent đọc `index.md`, rồi mở đúng trang cần.

## Cấu trúc

- `index.md` — mục lục mọi trang, mỗi trang một dòng tóm tắt. Luôn cập nhật.
- `log.md` — nhật ký phiên làm việc, mới nhất ở trên cùng. Chỉ thêm, không sửa
  lịch sử.
- `raw/` — nguồn thô (ghi chú dán vào, gói tin bắt được, trích tài liệu). Không
  chỉnh sửa; trang wiki trích dẫn từ đây.
- `devices/` — kiến thức về từng hãng thiết bị: cách kết nối, giao thức, giới hạn.
- `domain/` — kiến thức thủy sinh/terrarium mà app dựa vào.
- `engineering/` — bài học kỹ thuật khi xây app (Rust, thư viện, cạm bẫy).

## Ranh giới với Harness

| Câu hỏi | Nơi trả lời |
|---|---|
| App phải làm gì? | `docs/product/` |
| Đã quyết định gì, vì sao, phải tuân theo? | `docs/decisions/` |
| Việc dài hơi đang làm tới đâu? | `docs/plans/active/` |
| Ta đã biết/học được gì? | `docs/wiki/` (đây) |
| Phiên nào làm gì, dừng ở đâu? | `docs/wiki/log.md` |

Không chép trùng: trang wiki liên kết tới product/decision/plan thay vì lặp lại.

## Quy tắc viết trang

- Một chủ đề một trang, tên file kebab-case.
- Đầu trang: một câu tóm tắt + ngày cập nhật cuối.
- Phân biệt rõ **đã xác minh** (có nguồn/bằng chứng) và **giả định/chưa kiểm**.
- Ghi nguồn bằng link hoặc đường dẫn `raw/...`.
- Khi trả lời một câu hỏi tốn công, lưu câu trả lời thành trang mới.
