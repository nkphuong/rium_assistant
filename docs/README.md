# Documentation Map

Bản đồ tài liệu của rium_assistant. Bắt đầu từ bề mặt nhỏ nhất có thẩm quyền.

- `WORKFLOW.md`: quy trình chung của Harness (yêu cầu, plan, phán đoán, kiểm chứng).
- `../AGENTS.md`: quy trình riêng của dự án và bộ nhớ giữa các phiên.
- `product/`: hành vi sản phẩm hiện hành, chia theo domain (spec đã duyệt).
- `decisions/`: quyết định lâu dài mà việc sau phải kế thừa.
- `plans/`: `active/` việc đang dở nhiều phiên, `completed/` đã xong.
- `wiki/`: kiến thức đã học + nhật ký phiên (`wiki/log.md`). Bắt đầu ở `wiki/index.md`.
- `patterns/encoding-invariants.md`: biến quy tắc kiến trúc/chất lượng đã chấp
  nhận thành kiểm tra tự động.
- `templates/`: khung cho decision, plan, runbook, harness-improvement.

Code, test và hành vi chạy thật của app là sự thật cuối cùng; tài liệu phải
theo kịp chúng.
