---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Validation**: Every meaningful user story MUST include validation for the
primary behavior and at least one failure or edge case. Automated tests are
preferred. Manual validation is allowed only for early MVP work when the plan
documents the rationale and repeatable steps explicitly.

**Organization**: Tasks are grouped by user story so each story can be
implemented, validated, and delivered independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Default React web app**: `src/`, `tests/`, `public/`
- **Add only when explicitly required**: `e2e/`, backend or API directories
- Adjust paths to match `plan.md` and avoid introducing extra runtimes without
  plan approval

## Phase 1: Setup (Shared Foundations)

**Purpose**: Establish the minimum tooling and structure required for delivery

- [ ] T001 Initialize the React + TypeScript project structure defined in plan.md
- [ ] T002 Configure linting, formatting, and the selected validation tooling
- [ ] T003 [P] Create the agreed `src/components`, `src/hooks`, `src/services`,
      and `src/types` structure
- [ ] T004 [P] Establish responsive layout, semantic HTML, and shared feedback
      state patterns if they affect multiple stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core work that MUST be complete before user stories begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Define shared types and data contracts used across stories
- [ ] T006 [P] Create service-layer scaffolding for required API or data access
- [ ] T007 [P] Establish route or page shell only if multiple stories need it
- [ ] T008 Create shared loading, error, empty, and success state handling
- [ ] T009 Justify and add shared state mechanisms only if local/lifted state is
      insufficient

**Checkpoint**: Foundation ready; user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of the MVP user value]

**Independent Test**: [How to validate this story on its own]

### Validation for User Story 1 (REQUIRED)

- [ ] T010 [P] [US1] Add validation for the primary behavior in
      `tests/[type]/[name]`
- [ ] T011 [P] [US1] Add validation for a failure or edge case in
      `tests/[type]/[name]`
- [ ] T012 [US1] Document manual validation steps in
      `specs/[###-feature-name]/quickstart.md` only if automation is explicitly
      deferred

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create or update page/component files in `src/pages/` or
      `src/components/`
- [ ] T014 [P] [US1] Implement interaction logic in `src/hooks/` or local state
      modules
- [ ] T015 [US1] Implement data access in `src/services/`
- [ ] T016 [US1] Add loading, error, empty, and success UI states
- [ ] T017 [US1] Verify responsive and keyboard-accessible behavior

**Checkpoint**: User Story 1 is independently functional and ready for MVP
validation

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of the next user value]

**Independent Test**: [How to validate this story on its own]

### Validation for User Story 2 (REQUIRED)

- [ ] T018 [P] [US2] Add validation for the primary behavior in
      `tests/[type]/[name]`
- [ ] T019 [P] [US2] Add validation for a failure or edge case in
      `tests/[type]/[name]`
- [ ] T020 [US2] Document manual validation steps only if automation is
      explicitly deferred

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create or update page/component files in `src/pages/` or
      `src/components/`
- [ ] T022 [P] [US2] Implement interaction logic in `src/hooks/` or local state
      modules
- [ ] T023 [US2] Implement or extend service logic in `src/services/`
- [ ] T024 [US2] Add loading, error, empty, and success UI states
- [ ] T025 [US2] Verify responsive and keyboard-accessible behavior

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of the additional user value]

**Independent Test**: [How to validate this story on its own]

### Validation for User Story 3 (REQUIRED)

- [ ] T026 [P] [US3] Add validation for the primary behavior in
      `tests/[type]/[name]`
- [ ] T027 [P] [US3] Add validation for a failure or edge case in
      `tests/[type]/[name]`
- [ ] T028 [US3] Document manual validation steps only if automation is
      explicitly deferred

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create or update page/component files in `src/pages/` or
      `src/components/`
- [ ] T030 [P] [US3] Implement interaction logic in `src/hooks/` or local state
      modules
- [ ] T031 [US3] Implement or extend service logic in `src/services/`
- [ ] T032 [US3] Add loading, error, empty, and success UI states
- [ ] T033 [US3] Verify responsive and keyboard-accessible behavior

**Checkpoint**: All planned user stories are independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update docs and review copy realism
- [ ] TXXX Review dependency additions and remove unused packages
- [ ] TXXX [P] Address cross-story performance issues
- [ ] TXXX [P] Add extra automated coverage only where it materially improves
      confidence
- [ ] TXXX Validate `quickstart.md` and release-ready behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user
  stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all selected user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and defines the MVP slice
- **User Story 2 (P2)**: Starts after Foundational and MUST remain independently
  testable
- **User Story 3 (P3)**: Starts after Foundational and MUST remain independently
  testable

### Within Each User Story

- Acceptance criteria and validation tasks MUST exist before implementation is
  considered complete
- Presentation, interaction/state, and service work MUST keep clear boundaries
- Loading, error, empty, and success states MUST be implemented before sign-off
- Responsive and accessibility checks MUST pass before the story is closed

### Parallel Opportunities

- Tasks marked [P] can run in parallel when they touch different files
- Validation tasks for a story can run in parallel
- Different user stories can proceed in parallel only after Foundational work is
  complete and ownership is clear

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently
5. Stop and confirm MVP before expanding scope

### Incremental Delivery

1. Complete Setup and Foundational work
2. Deliver User Story 1 and validate it independently
3. Add User Story 2 and validate it independently
4. Add User Story 3 and validate it independently
5. Keep each release slice shippable

### Parallel Team Strategy

1. Complete Setup and Foundational work together
2. Assign separate ownership for each user story after the foundation is ready
3. Merge only after each story meets its validation and accessibility gates

---

## Notes

- [P] tasks = different files, no dependencies
- Each story must remain independently completable and testable
- Avoid speculative backend, hidden requirements, and unjustified abstractions
- Commit after each logical group of completed work
