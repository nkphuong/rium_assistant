# 0001 Quy trình phát triển: Harness + Superpowers + Ponytail + Wiki

Date: 2026-11-06

## Status

Accepted

## Context

Dự án dùng bốn lớp công cụ có chồng lấn:

- **repository-harness** (`AGENTS.md`, `docs/`): repo là nguồn sự thật; plan ở
  `docs/plans/active/`; quyết định ở `docs/decisions/`; đặc tả ở `docs/product/`.
- **superpowers**: brainstorming → writing-plans → subagent-driven-development /
  executing-plans, TDD, review, finishing-a-development-branch.
- **ponytail**: luôn bật qua hook SessionStart/SubagentStart; giải pháp nhỏ nhất,
  ít test.
- **wiki** (`docs/wiki/`): kiến thức + nhật ký phiên.

Xung đột phát hiện được:

1. Superpowers lưu spec/plan vào `docs/superpowers/...`; Harness muốn
   `docs/product/` và `docs/plans/active/`.
2. Ponytail luôn bật, kể cả lúc brainstorm; mức `ultra` / "yêu cầu mơ hồ → bản
   nhỏ nhất" có thể cắt phạm vi người dùng đã duyệt.
3. TDD đòi test trước cho mọi hành vi; Ponytail chỉ đòi một test nhỏ cho logic
   không tầm thường.
4. Hai bộ review: superpowers (code-reviewer trong SDD, requesting-code-review)
   và `ponytail-review`.
5. Skill của Harness nằm ở `.agents/skills/` — Claude Code không tự phát hiện.

## Decision

**Mỗi công cụ một vai, theo pha:**

| Pha | Công cụ chủ trì | Đầu ra |
|---|---|---|
| Ý tưởng / phạm vi | `superpowers:brainstorming` | `docs/product/<domain>.md` |
| Kế hoạch | `superpowers:writing-plans` | `docs/plans/active/<slug>.md` (khung exec-plan của Harness + các task của superpowers) |
| Thực thi | `superpowers:subagent-driven-development` (hoặc `executing-plans`) | code + test |
| Cách viết code | `ponytail` (mức `full`) | diff nhỏ nhất |
| Review | xem quy tắc 4 | |
| Kết thúc | `superpowers:finishing-a-development-branch` + cập nhật wiki/log | plan → `completed/` |

Quy tắc dung hòa:

1. **Đường dẫn**: spec → `docs/product/`, plan → `docs/plans/active/`, ghi đè
   mặc định `docs/superpowers/...` của superpowers.
2. **Phạm vi do spec quyết định, Ponytail quyết định cách làm.** Phạm vi trong
   spec đã duyệt là "điều người dùng yêu cầu" — Ponytail không được cắt. Ponytail
   áp dụng cho code, không áp dụng cho brainstorm. Không dùng mức `ultra` khi
   đang thực thi plan đã duyệt.
3. **Test**: TDD quyết định *thứ tự* (test trước) cho logic không tầm thường —
   tính điểm sức khỏe, lịch thay nước, parser giao thức thiết bị, lưu trữ dữ
   liệu. Ponytail quyết định *lượng*: ít test, kiểm hành vi, không test cho code
   dán UI/glue tầm thường. Harness: chỉ tuyên bố xong khi có bằng chứng chạy được.
4. **Review**: khi chạy SDD, dùng reviewer có sẵn của SDD (từng task + review
   cuối), không chạy thêm review khác. Thay đổi nhỏ ngoài plan: `ponytail-review`.
   Nhận phản hồi review: `superpowers:receiving-code-review`.
5. **Skill Harness**: khi cần `$improve-harness`, `$encode-invariant`,
   `$onboard-repository`, đọc trực tiếp `.agents/skills/<tên>/SKILL.md`.

**Vòng cải tiến lẫn nhau** (các skill bồi đắp cho nhau qua repo):

- Brainstorm/thực thi sinh kiến thức → wiki (`docs/wiki/`), lần sau brainstorm
  đọc lại.
- Ponytail để lại `shortcut:` trong code → `ponytail-debt` liệt kê → mục nợ đưa
  vào plan tiếp theo khi cần nâng cấp.
- Vướng mắc lặp lại của agent → ghi "Vướng mắc" trong `log.md` → khi lặp ≥2 lần
  và người dùng đồng ý, chạy `$improve-harness` để sửa hướng dẫn tận gốc.
- Định kỳ (sau mỗi mốc lớn) `ponytail-audit` → phát hiện thành task trong plan.

## Alternatives Considered

1. Giữ đường dẫn mặc định của superpowers — bị loại: hai nơi chứa sự thật.
2. Tắt Ponytail khi thực thi plan — bị loại: mất lợi ích code gọn.
3. Copy skill Harness vào `.claude/skills/` — bị loại: lệch khi harness cập nhật.

## Consequences

Positive:

- Mỗi câu hỏi "ở đâu / ai quyết" có đúng một câu trả lời.
- Phiên mới tiếp nối được từ repo.

Tradeoffs:

- Phải nhắc superpowers đổi đường dẫn mỗi lần (đã ghi trong `AGENTS.md`).
- Sửa `docs/WORKFLOW.md` của Harness có thể xung đột khi cập nhật → không sửa,
  quy tắc dự án nằm ở `AGENTS.md` (ngoài khối HARNESS) và file này.

## Follow-Up

- Xem lại quyết định này sau plan đầu tiên hoàn thành.
