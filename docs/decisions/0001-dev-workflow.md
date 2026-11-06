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

Mỗi công cụ một vai theo pha: brainstorming → spec, writing-plans → plan,
subagent-driven-development → thực thi, ponytail → cách viết code. Đường dẫn
theo Harness. Spec quyết định phạm vi, Ponytail quyết định cách làm; TDD quyết
định thứ tự test, Ponytail quyết định lượng test; mỗi thay đổi chỉ một bộ review.

**Quy tắc hiện hành: xem mục "Quy trình" trong `AGENTS.md`** (nơi duy nhất giữ
quy tắc, để không lệch).

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
