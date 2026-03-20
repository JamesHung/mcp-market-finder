<!--
Sync Impact Report
- Version change: unversioned template -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. MVP-First Product Scope
  - Template Principle 2 -> II. React + TypeScript Simplicity
  - Template Principle 3 -> III. Accessible, Responsive, Predictable UX
  - Template Principle 4 -> IV. Clear State and Data Boundaries
  - Template Principle 5 -> V. Testable Delivery
  - Added: VI. Performance and Dependency Discipline
  - Added: VII. Readable, Typed, Maintainable Code
- Added sections:
  - Language and Documentation Standards
  - Delivery Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/constitution-template.md
  - ✅ /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/plan-template.md
  - ✅ /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/spec-template.md
  - ✅ /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/tasks-template.md
  - ✅ /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/checklist-template.md
  - ⚠ pending: /Users/hungming-hung/ai-tools/mcp-market-finder/.specify/templates/commands/*.md
    (directory not present in this repository)
- Follow-up TODOs:
  - None
-->
# MCP Market Finder Constitution

## Core Principles

### I. MVP-First Product Scope
Every feature MUST solve a clear user problem and define a minimal acceptance
path before implementation starts. Plans, tasks, and code MUST avoid
speculative features, hidden requirements, and backend capabilities unless the
specification explicitly requires them. When requirements are ambiguous, the
implementation MUST choose the simplest approach that satisfies the known user
need and MUST record the assumption in the relevant spec or plan. Delivery MUST
prefer incremental slices over large rewrites so the product remains shippable
throughout implementation.

Rationale: focused MVP scope reduces delivery risk and keeps the product easy
to validate and evolve.

### II. React + TypeScript Simplicity
All frontend application code MUST use React and TypeScript. Vite MUST be the
default build tool unless a specification explicitly approves another runtime
or framework. Architecture MUST remain simple and explicit: presentation in UI
components, interaction and local state in hooks or state modules, and API or
data access in a service layer. Components MUST keep a single clear
responsibility and stable prop boundaries. Shared abstractions MUST be
introduced only after meaningful duplication appears and the extracted shape is
simpler than the repeated code it replaces.

Rationale: simple React and TypeScript boundaries improve readability,
onboarding speed, and agent reliability.

### III. Accessible, Responsive, Predictable UX
All user interfaces MUST be responsive by default. Accessibility is mandatory:
use semantic HTML first, preserve keyboard accessibility, provide sufficient
labels for interactive elements, and maintain usable focus behavior. Every
user-facing feature MUST define loading, error, empty, and success states.
Interaction patterns MUST stay clear, consistent, and predictable instead of
optimizing for novelty.

Rationale: a feature is not complete unless it remains usable across devices,
inputs, and real interaction states.

### IV. Clear State and Data Boundaries
State MUST stay as local as possible and MUST use the simplest model that
works: local component state first, lifted state when shared, and dedicated
client-state solutions only when justified. Server data access MUST be
separated from presentation code. API assumptions, data contracts, fallback
handling, and loading or error behavior MUST be explicit in specs, plans, and
implementation. Rendering concerns MUST NOT be mixed with transport,
persistence, or transformation logic when separation improves clarity.

Rationale: clear state and data boundaries reduce bugs, re-render complexity,
and long-term maintenance cost.

### V. Testable Delivery
Every meaningful feature MUST define acceptance criteria before implementation.
Validation MUST cover the primary behavior and at least one failure or edge
path. Tests MUST focus on observable behavior and outcomes instead of fragile
implementation details. Manual validation MAY replace automated coverage only
for early MVP work when automation is not yet proportionate, and the plan MUST
document the rationale and repeatable validation steps explicitly.

Rationale: repeatable validation is required to keep MVP delivery fast without
sacrificing confidence.

### VI. Performance and Dependency Discipline
Performance MUST be considered from the start. Implementations MUST minimize
bundle size, avoid unnecessary dependencies, and prevent avoidable re-renders,
excessive global state, and expensive computation in render paths. Heavy views,
optional modules, or large assets SHOULD be lazy-loaded when appropriate.
Browser-native capabilities MUST be preferred before third-party libraries. Any
new dependency MUST include a clear delivery or maintenance justification in
the implementation plan.

Rationale: frontend performance and dependency hygiene directly affect product
quality, iteration cost, and user trust.

### VII. Readable, Typed, Maintainable Code
Code MUST be readable, explicitly typed, and consistent. Linting and formatting
are mandatory. Public component props, shared types, and data contracts MUST be
typed explicitly. Names MUST reflect intent rather than implementation
accidents. Comments MUST explain why, not restate obvious code behavior. Files,
modules, and folders MUST remain small enough to understand without excessive
scrolling or cross-referencing.

Rationale: maintainable code lowers review friction and keeps the codebase easy
to modify over time.

## Language and Documentation Standards

Discussion, generated documentation, implementation plans, issue logs, and code
comments MUST use Traditional Chinese by default. User-facing UI copy MUST
follow the product specification and MUST NOT assume multilingual support unless
that requirement is explicit. Placeholder text, labels, and messages MUST be
realistic enough to support validation and review.

## Delivery Workflow and Quality Gates

Before implementation approval, every plan MUST confirm the following:

- The scope is MVP-appropriate and includes a minimal acceptance path.
- The architecture remains simple, explicit, and aligned with React and
  TypeScript boundaries.
- The UI is responsive, accessible, and defines loading, error, empty, and
  success states.
- The behavior is testable and the validation strategy covers primary and
  failure or edge scenarios.
- State ownership, service boundaries, and data contracts are explicit.
- Performance trade-offs and new dependencies are justified.
- The resulting code will remain typed, lintable, and maintainable.

Any deviation from this constitution MUST be documented in the implementation
plan with the reason, the simpler alternative that was rejected, and the impact
on accessibility, testability, and maintainability.

## Governance

This constitution overrides conflicting preferences in feature plans, task
breakdowns, and implementation notes. Amendments MUST update
`.specify/memory/constitution.md`, include a Sync Impact Report at the top of
the file, and propagate required changes to affected templates or guidance
documents in the same change set. Versioning MUST follow semantic versioning:
MAJOR for incompatible governance or principle changes, MINOR for new
principles or materially expanded guidance, and PATCH for clarifications that
do not change expected behavior. Compliance review is mandatory for every plan
and implementation review; work that fails the quality gates MUST be revised
before approval.

**Version**: 1.0.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19
