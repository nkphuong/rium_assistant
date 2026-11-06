# Agent Instructions

<!-- HARNESS:BEGIN -->
## Harness

Start with the requested outcome and use the repository as the system of record.
Read `docs/WORKFLOW.md` and only relevant product, design, plan, code, and
validation material.

- Answers, explanations, reviews, diagnoses, plans, and status reports are
  read-only. Inspect only what is needed; change nothing.
- For a bounded change, inspect affected behavior and proof, implement, and
  validate. No control-plane operation is required.
- Use one `docs/plans/active/` file when work spans sessions, coordinates
  contributors, has dependencies, or needs recovery. Move it to
  `docs/plans/completed/` only after validation.
- Before editing, identify repository authority for each new externally
  observable policy. If materially different choices remain open, stop before
  edits; configurable defaults are not authority.
- For architecture, reliability, security, or quality invariant work, read
  `docs/patterns/encoding-invariants.md` and enforce only accepted rules.
- Report reusable agent friction. Change guidance, tools, runbooks, or validation
  for that purpose only when explicitly asked to use `$improve-harness`.
- Also pause when product intent remains ambiguous, recovery is difficult,
  validation is weakened, or authority is insufficient.
- Claim completion only with executable or observable evidence. Report outcome,
  changes, validation, and unresolved risks.

Harness has no task database or orchestration lifecycle. Use repository plans
and behavior-level proof; do not create parallel control-plane state.
<!-- HARNESS:END -->

## Dự án: rium_assistant

Desktop app (Rust) làm bạn với các bể aquarium/terrarium của người dùng: quản lý
và điều khiển thiết bị thông minh, lịch thay nước, sức khỏe bể, ý tưởng bể mới.
Giao tiếp với người dùng bằng tiếng Việt có dấu đầy đủ.

## Bộ nhớ giữa các phiên

Mỗi phiên làm việc phải tiếp nối được từ repo, không dựa vào lịch sử chat.

**Đầu phiên** — đọc theo thứ tự, chỉ phần liên quan:
1. `docs/wiki/log.md` — 1–2 mục mới nhất (phiên trước dừng ở đâu).
2. `docs/plans/active/` — việc dài hơi đang dở.
3. `docs/wiki/index.md` — rồi mở đúng trang wiki cần.

**Cuối phiên** (hoặc khi người dùng nói dừng):
1. Thêm một mục lên đầu `docs/wiki/log.md` theo mẫu trong file.
2. Cập nhật/ tạo trang wiki cho kiến thức mới; cập nhật `docs/wiki/index.md`.
3. Cập nhật tiến độ trong plan active (nếu có).
4. Quyết định lâu dài → `docs/decisions/` (template `docs/templates/decision.md`).

Ranh giới product / decisions / plans / wiki: xem `docs/wiki/README.md`.

## Quy trình (chi tiết: `docs/decisions/0001-dev-workflow.md`)

1. Ý tưởng mới → `superpowers:brainstorming`; spec lưu `docs/product/<domain>.md`
   (KHÔNG dùng `docs/superpowers/specs/`).
2. Spec duyệt → `superpowers:writing-plans`; plan lưu `docs/plans/active/<slug>.md`
   theo khung `docs/templates/exec-plan.md` (KHÔNG dùng `docs/superpowers/plans/`).
3. Thực thi → `superpowers:subagent-driven-development`; viết code theo
   `ponytail` mức `full`. Phạm vi spec đã duyệt không bị Ponytail cắt.
4. Test: logic không tầm thường viết test trước (TDD), ít mà trúng hành vi;
   glue/UI tầm thường không cần test.
5. Review: trong SDD dùng reviewer của SDD; thay đổi nhỏ ngoài plan dùng
   `ponytail-review`.
6. Kết thúc: `superpowers:finishing-a-development-branch`, plan → `completed/`,
   cập nhật wiki + log.
7. Skill Harness (`$improve-harness`, `$encode-invariant`, `$onboard-repository`):
   đọc `.agents/skills/<tên>/SKILL.md`.
8. Vướng mắc của agent ghi vào mục "Vướng mắc" trong log; lặp ≥2 lần → đề xuất
   `$improve-harness`. `shortcut:` trong code → `ponytail-debt` khi lập plan mới.
