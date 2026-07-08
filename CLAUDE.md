@TERAX.md


## 0. TDD by Judgment（按需 TDD）

**不是每次改动都要走 TDD，先按下面的规则判断：**

- **跳过 TDD**（直接改 → 跑全量快速测试防回归 → commit）：
  - 一目了然的 UI 几何/样式/文案调整（按钮宽度、间距、颜色、提示语）；
  - 单行修正、改常量、调参数；
  - 纯粹的删除/重命名等无行为变化的整理。
- **必须 TDD**（红 → 绿 → 重构）：
  - 修有逻辑分支的 bug（先写复现测试）；
  - 新增行为/功能（有输入→输出可断言的）；
  - 数据结构、持久化、解析逻辑的变更。
- **拿不准时**：问一句"这次改动坏了会不会悄悄坏"——会，就写测试；不会（坏了一眼可见），就跳过。

无论走不走 TDD，改完都必须跑项目的快速测试套件确认无回归，并 git commit。

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
