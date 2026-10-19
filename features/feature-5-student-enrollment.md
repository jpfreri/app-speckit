# Feature: Student Enrollment

**Feature ID:** 5
**Branch pattern:** `feature/5-student-enrollment`
**Status:** Ready
**Created:** 2026-09-23
**Input:** A signed-in student enrolls in an existing section, sees only their own enrollments on one screen, and can change or drop those enrollments. Course, semester, and dates come from the section. Students do not manage the catalogs.
**Depends on:** [Feature 1 — User Authentication](feature-1-user-auth-session-management.md); [Feature 2 — Semester Management](feature-2-semester-management.md); [Feature 3 — Course Management](feature-3-course-management.md); [Feature 4 — Section Management](feature-4-section-management.md)

---

## User Stories

### US-5.1: Open enrollment from the menu

**As a** signed-in student
**I want to** open enrollment from the menu
**So that** I can see and change the sections I am taking

**Priority:** P1
**Independent test:** Sign in as a student, choose **Enrollment** in the menu, and the enrollment view appears
**Acceptance scenarios:** see ### US-5.1 under Acceptance Criteria

### US-5.2: Add an enrollment

**As a** signed-in student
**I want to** enroll in a section
**So that** that section is on my enrollment list

**Priority:** P1
**Independent test:** Open the add-enrollment dialog, choose a section, and see it on the enrollment view
**Acceptance scenarios:** see ### US-5.2 under Acceptance Criteria

### US-5.3: View enrollments

**As a** signed-in student
**I want to** see my enrollments on one screen
**So that** I can see the sections I am taking

**Priority:** P1
**Independent test:** Opening **Enrollment** lists the signed-in student's enrollments, ordered by section start date
**Acceptance scenarios:** see ### US-5.3 under Acceptance Criteria

### US-5.4: Manage enrollment rows

**As a** signed-in student
**I want** each enrollment row to show **edit** and **delete** actions
**So that** I can change or drop an enrollment without leaving the view

**Priority:** P1
**Independent test:** Each enrollment row exposes edit and delete icon actions
**Acceptance scenarios:** see ### US-5.4 under Acceptance Criteria

### US-5.5: Edit an enrollment

**As a** signed-in student
**I want to** change which section an enrollment uses
**So that** I can move into a different section

**Priority:** P2
**Independent test:** Edit an enrollment from its row action and see the enrollment view update
**Acceptance scenarios:** see ### US-5.5 under Acceptance Criteria

### US-5.6: Delete an enrollment

**As a** signed-in student
**I want to** delete an enrollment
**So that** I can drop a section

**Priority:** P2
**Independent test:** Delete an enrollment from its row action and see it leave the enrollment view
**Acceptance scenarios:** see ### US-5.6 under Acceptance Criteria

### US-5.7: Restrict enrollment to the signed-in student

**As the** application
**I want to** let only the signed-in student read and change their own enrollments
**So that** other roles and other students cannot see or change those rows

**Priority:** P1
**Independent test:** Sign in as a student and see only that student's rows; sign in as an admin and **Enrollment** is hidden
**Acceptance scenarios:** see ### US-5.7 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: Every enrollment endpoint MUST require a valid session (`authenticate`) and `req.user.role` equal to `student`. Any other authenticated role MUST receive `403` with `{ "message": "Student role required." }` on `GET`, `POST`, `PUT`, and `DELETE`, and MUST NOT persist a row.
- **FR-002**: An enrollment MUST belong to the authenticated student. The API MUST set `userId` from `req.user.id` and MUST ignore a client-supplied `userId`. The API MUST also ignore client-supplied `courseId`, `semesterId`, `startDate`, `endDate`, and `sectionName`. Those values come from the referenced section.
- **FR-003**: `sectionId` MUST be required on create and update. It MUST reference an existing row in the Feature 4 `sections` table. On the enrollment UI, a missing section MUST be blocked with **"Required"** and MUST NOT send an API request. If `sectionId` is missing, the API MUST return `400`. If the section does not exist, the API MUST return `400` with `{ "message": "Section with id=<id> not found." }`.
- **FR-004**: A student MUST NOT enroll in the same section more than once. The duplicate message is **"You are already enrolled in this course section."** On the UI, choosing a section already on that student's list MUST be blocked and MUST NOT send an API request. If the API receives a duplicate `(userId, sectionId)`, it MUST return `400` with that message. Saving an enrollment with its current `sectionId` is not a duplicate.
- **FR-005**: Unauthenticated enrollment API requests MUST return `401`. Unauthenticated navigation to `/enrollments` MUST redirect to `login`. An authenticated user whose role is not `student` MUST NOT see **Enrollment** in `MenuBar`, and direct navigation to `/enrollments` MUST redirect to `home`.
- **FR-006**: `GET /api/enrollments` MUST return only enrollments whose `userId` is `req.user.id`. Rows MUST be ordered by the related section's `startDate` ascending, in the API and in the enrollment view. Each enrollment object MUST include joined display fields from that section: `sectionName`, `courseName`, `semesterName`, `startDate`, and `endDate`.
- **FR-007**: This feature MUST deliver student enrollment on one screen in `Enrollments.vue` (dialog-based add, edit, and delete). No sidebar/main split. The student client MUST NOT call `GET /api/semesters` (Feature 2 exposes that route to `admin` only). Section choices come from `GET /api/sections`.
- **FR-008**: Unknown `enrollmentId`, or an `enrollmentId` owned by a different user, on `PUT` or `DELETE` MUST return `404` with `{ "message": "Enrollment with id=<id> not found." }`. Do not use `403` for a missing or unowned enrollment.

---

## Assumptions

- Feature 1 auth (roles `admin` and `student`, `authenticate`, `MenuBar`) MUST be merged to `dev` before this feature. Tests may seed a student and an admin.
- Feature 2 semester catalog MUST be merged to `dev`. Tests may seed at least one semester as an admin. This feature MUST NOT call `GET /api/semesters` as a student.
- Feature 3 course catalog (`courses` table, `GET /api/courses` for any authenticated user) MUST be merged to `dev`. Tests may seed at least one course.
- Feature 4 section catalog (`sections` table, `GET /api/sections` for any authenticated user) MUST be merged to `dev`. Tests may seed at least one section. `sectionName` is unique in that catalog.
- Enrollment uses dialog-based workflows (no split sidebar / main panel).
- API mount for this resource is `/api/enrollments`.
- The server MAY join `sections`, `courses`, and `semesters` when building an enrollment response. That join is not the student calling `GET /api/semesters`.

## Edge Cases

- Missing section on add or edit → client block; **"Required"**; no API call.
- Duplicate `(userId, sectionId)` on create, or on update to a section the student already has on a different enrollment → **"You are already enrolled in this course section."**
- Unknown `sectionId` on create or update → `400` with `{ "message": "Section with id=<id> not found." }`.
- Unknown `enrollmentId`, or another student's `enrollmentId`, on update or delete → `404` with `{ "message": "Enrollment with id=<id> not found." }`.
- Client sends `userId` or catalog fields (`courseId`, `semesterId`, dates, `sectionName`) → ignored; stored owner is `req.user.id`; stored link is `sectionId` only.
- Authenticated non-student on `GET` / `POST` / `PUT` / `DELETE` → `403` with `{ "message": "Student role required." }`.
- Unauthenticated user on `/enrollments` or any enrollment route → redirect to `login`, or `401` for the API.
- Authenticated non-student opens `/enrollments` → redirect to `home`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in student can add, view, edit, and delete their own enrollments on one screen.
- **SC-003**: A signed-in student receives only their enrollments. An admin does not see **Enrollment** and receives `403` on enrollment endpoints.
- **SC-004**: `npm test` passes for the enrollments API and the enrollment view, menu, and router behavior.

---

## Data Ownership & Isolation

Enrollments are **owned by the signed-in student**. Only role `student` may read or change them. A student sees and changes only rows with their `userId`.

| Rule | Requirement |
| ---- | ----------- |
| **Read scope** | `GET /api/enrollments` returns only enrollments where `userId` is `req.user.id`, and only when `req.user.role` is `student`. |
| **Write scope** | `POST`, `PUT`, and `DELETE` are allowed only when `req.user.role` is `student`, and only for that student's rows. |
| **Create scope** | New enrollments are bound to `req.user.id`. Ignore a client-supplied `userId`. Persist `sectionId` only; do not copy course, semester, or dates onto the row. |
| **Cross-user access** | Another student's enrollment, or a missing id, on `PUT` / `DELETE` → `404` with `{ "message": "Enrollment with id=<id> not found." }`. |
| **Non-student** | Authenticated non-student `GET` / `POST` / `PUT` / `DELETE` → `403` with `{ "message": "Student role required." }`. |
| **UI scope** | **Enrollment** and `/enrollments` are for role `student`. Other roles do not see the menu item. Direct navigation redirects to `home`. |
| **Implementation** | Use `authenticate` on every endpoint, then require role `student`. Scope every query and write by `req.user.id`. |

---

## API Requirements

| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `GET` | `/api/enrollments` | Yes, student | List the signed-in student's enrollments |
| `POST` | `/api/enrollments` | Yes, student | Enroll the signed-in student in a section |
| `PUT` | `/api/enrollments/:enrollmentId` | Yes, student | Point one of that student's enrollments at a different section |
| `DELETE` | `/api/enrollments/:enrollmentId` | Yes, student | Drop one of that student's enrollments |

**Create enrollment request body:**

```json
{
  "sectionId": 1
}
```

Do not send `id` or `userId`. If `userId`, `courseId`, `semesterId`, `startDate`, `endDate`, or `sectionName` is present, ignore it. `sectionId` MUST reference an existing section (FR-003).

**Update enrollment request body:** same field as create (`sectionId` only).

**Enrollment success response** (`200` / `201`):

```json
{
  "id": 1,
  "userId": 5,
  "sectionId": 1,
  "sectionName": "01",
  "courseName": "CMSC-1234",
  "semesterName": "2026 Fall",
  "startDate": "2026-08-15",
  "endDate": "2026-12-15",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

`sectionName`, `courseName`, `semesterName`, `startDate`, and `endDate` are read from the related section (and its course and semester). They are not columns on `enrollments`.

`GET /api/enrollments` returns an array of those objects, ordered by section `startDate` ascending (FR-006). `DELETE` of an owned enrollment returns `200`.

**Error response:** `{ "message": "Human-readable explanation." }` with the HTTP status from the FRs.
**Not found:** unknown or unowned `enrollmentId` → `404` with `{ "message": "Enrollment with id=<id> not found." }`. Unknown `sectionId` on create or update → `400` with `{ "message": "Section with id=<id> not found." }`. Duplicate section → `400` with `{ "message": "You are already enrolled in this course section." }`. Non-student → `403` with `{ "message": "Student role required." }`.

---

## Screen Requirements

### [View: Enrollment] — route name `enrollments` — path `/enrollments` — `Enrollments.vue`

- Heading: **Enrollment**
- Primary action: **+ New enrollment** (`oc-cta`) opens the **Add Enrollment** `<v-dialog>`.
- **Add Enrollment** field (same field on **Edit Enrollment**; edit pre-selects the current section):
  - **Section** (`v-select`) — required; options loaded from `GET /api/sections`. The student chooses a section. Course, semester, start date, and end date are not inputs; the list shows them from the enrollment response.
- **Add Enrollment** actions: **Create** (`oc-cta`) / **Cancel** (secondary `variant="text"` or `outlined`).
- List: `v-table` (or `v-list`); columns **section name**, **course**, **semester**, **start date**, and **end date**; rows ordered by section start date (FR-006).
- Icon-only row actions use `size="small"` and accessible `aria-label`s:
  - **Edit enrollment** — opens **Edit Enrollment** `<v-dialog>` pre-filled with the current section; **Save Enrollment** (`oc-cta`) / **Cancel** (secondary)
  - **Delete enrollment** — opens **Delete Enrollment** confirmation `<v-dialog>` with copy **"Delete this enrollment?"**; **Delete Enrollment** (`oc-cta`) / **Cancel** (secondary)
- Client-side validation: a missing section uses the inline rule **"Required"**; a section already on this student's list shows **"You are already enrolled in this course section."** Invalid submit does not send an API request.
- **Empty state:** **"No enrollments yet. Create your first enrollment."** when the student has no enrollments.
- **Loading state:** skeleton or progress indicator while enrollments are fetching.
- **Error state:** `<v-alert type="error">` for API failures.
- Student-only: **Enrollment** and `/enrollments` are for signed-in students. Other roles do not see **Enrollment**. Unauthenticated navigation redirects to `login`. Another signed-in role redirects to `home`.
- Enrollment dialogs live in `Enrollments.vue` (or child presentational dialogs). No sidebar/main split.

**App chrome**

- Use the `MenuBar` introduced in [Feature 1](feature-1-user-auth-session-management.md). Do **not** create a second `MenuBar`. Do **not** hide it on `login` / `register`.
- Add **Enrollment** (allowed role `student`; navigates to `/enrollments`) to `MenuBar`. Keep the signed-in user's name and **Sign out** from Feature 1.
- Users whose role is not `student` MUST NOT see **Enrollment**.
- After login, the user remains on Feature 1 `home`. US-5.1 is selecting **Enrollment** in the menu.

---

## Key Entities

- **Enrollment**: a student's link to one section. Owned by that student (`userId`). Stores `sectionId` only. Section name, course name, semester name, start date, and end date are read from the section when the API responds. Students manage their own rows in this feature. Admins manage sections in Feature 4 and do not manage enrollments here.

---

## Data Model Requirements

### `enrollments` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `userId` | INTEGER FK | Required; references `users.id` (Feature 1); set from the session, not the body |
| `sectionId` | INTEGER FK | Required; references `sections.id` (Feature 4) |
| `createdAt` | DATETIME | Sequelize timestamps |
| `updatedAt` | DATETIME | Sequelize timestamps |

Unique index on (`userId`, `sectionId`).

Course, semester, and dates stay on `courses`, `semesters`, and `sections`. Do not add those columns to `enrollments`.

### Associations (in `models/index.js`)

- Enrollment belongsTo User (`userId`). User hasMany Enrollment.
- Enrollment belongsTo Section (`sectionId`). Section hasMany Enrollment.

---

## Acceptance Criteria (Gherkin)

### US-5.1 — Open enrollment from the menu

#### Scenario: Menu Selection

- **Given** I am signed in as a user with role `student`
- **When** I click **Enrollment** in the menu bar
- **Then** the enrollment view is displayed

### US-5.2 — Add an enrollment

#### Scenario: Student creates a new enrollment

- **Given** I am signed in as a user with role `student`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists for that semester
- **And** a section named `01` already exists for that course and semester, with start date `2026-08-15` and end date `2026-12-15`
- **And** I am viewing the enrollment view
- **When** I click **+ New enrollment**
- **And** I select section `01`
- **And** I click **Create**
- **Then** the API returns `201` with an enrollment containing `id`, `userId` of the signed-in student, `sectionId`, `sectionName` `01`, `courseName` `CMSC-1234`, `semesterName` `2026 Fall`, `startDate` `2026-08-15`, and `endDate` `2026-12-15`
- **And** the enrollment list shows section `01`, course `CMSC-1234`, and semester `2026 Fall`
- **And** the add-enrollment dialog closes

#### Scenario: Student creates an enrollment with a missing section

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **When** I click **+ New enrollment**
- **And** I leave **Section** empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: Student enrolls in a section they already have

- **Given** I am signed in as a user with role `student`
- **And** I am already enrolled in section `01`
- **And** I am viewing the enrollment view
- **When** I click **+ New enrollment**
- **And** I select section `01`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see **"You are already enrolled in this course section."**

#### Scenario: Student enrolls in a section they already have via the API

- **Given** I am signed in as a user with role `student`
- **And** I am already enrolled in a section
- **When** I send `POST /api/enrollments` with that same `sectionId`
- **Then** the API returns `400` with `{ "message": "You are already enrolled in this course section." }`
- **And** no second enrollment is stored

#### Scenario: Student enrolls with an unknown section

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/enrollments` with a `sectionId` that does not exist
- **Then** the API returns `400` with `{ "message": "Section with id=<id> not found." }`
- **And** no enrollment is stored

---

### US-5.3 — View enrollments

#### Scenario: Enrollment view loads with existing enrollments

- **Given** I am signed in as a user with role `student`
- **And** I have enrollments whose sections start on different dates
- **When** I view the enrollment list
- **Then** the API returns `200` with only my enrollments
- **And** the rows are ordered by section start date
- **And** each row shows section name, course, semester, start date, and end date

#### Scenario: There are no enrollments

- **Given** I am signed in as a user with role `student`
- **And** I have no enrollments
- **When** I view the enrollment list
- **Then** I see **"No enrollments yet. Create your first enrollment."**

---

### US-5.4 — Manage enrollment rows

#### Scenario: Enrollment rows show edit and delete actions

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **And** I have at least one enrollment
- **When** I view an enrollment row
- **Then** the row shows an **Edit enrollment** icon action
- **And** the row shows a **Delete enrollment** icon action

---

### US-5.5 — Edit an enrollment

#### Scenario: Student selects to edit an enrollment

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **When** I click the edit icon on an enrollment row
- **Then** the enrollment edit dialog is displayed with that enrollment's section selected

#### Scenario: Student edits an enrollment with a valid section and saves

- **Given** I am signed in as a user with role `student`
- **And** I am enrolled in section `01`
- **And** another section named `02` exists and I am not enrolled in it
- **And** the enrollment edit dialog is displayed for section `01`
- **When** I select section `02`
- **And** I click **Save Enrollment**
- **Then** the API returns `200` with `sectionName` `02`
- **And** the dialog is closed
- **And** the enrollment list shows section `02`

#### Scenario: Student edits an enrollment with a missing section and saves

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **And** the enrollment edit dialog is displayed
- **When** I clear the section
- **And** I click **Save Enrollment**
- **Then** no API call is made
- **And** I see the message **"Required"**
- **And** the dialog is not closed

#### Scenario: Student edits an enrollment and cancels

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **And** the enrollment edit dialog is displayed
- **When** I select a different section
- **And** I click **Cancel**
- **Then** the enrollment is not updated
- **And** the dialog is closed

#### Scenario: Student updates an enrollment that is missing or not theirs

- **Given** I am signed in as a user with role `student`
- **When** I send `PUT /api/enrollments/:enrollmentId` for an id that does not exist or belongs to another student
- **Then** the API returns `404` with `{ "message": "Enrollment with id=<id> not found." }`

---

### US-5.6 — Delete an enrollment

#### Scenario: Student selects to delete an enrollment

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **When** I click the delete icon on an enrollment row
- **Then** the enrollment delete dialog is displayed
- **And** I see **"Delete this enrollment?"**

#### Scenario: Student deletes an enrollment

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **And** the enrollment delete dialog is displayed
- **When** I click **Delete Enrollment**
- **Then** the API returns `200`
- **And** the dialog is closed
- **And** that enrollment is not in the list

#### Scenario: Student cancels deleting an enrollment

- **Given** I am signed in as a user with role `student`
- **And** I am viewing the enrollment view
- **And** the enrollment delete dialog is displayed
- **When** I click **Cancel**
- **Then** the enrollment is not deleted
- **And** the dialog is closed
- **And** the enrollment remains in the list

#### Scenario: Student deletes an enrollment that is missing or not theirs

- **Given** I am signed in as a user with role `student`
- **When** I send `DELETE /api/enrollments/:enrollmentId` for an id that does not exist or belongs to another student
- **Then** the API returns `404` with `{ "message": "Enrollment with id=<id> not found." }`

---

### US-5.7 — Restrict enrollment to the signed-in student

#### Scenario: Student sees only their own enrollments

- **Given** I am signed in as a student who has one enrollment
- **And** another student has a different enrollment
- **When** I request `GET /api/enrollments`
- **Then** the API returns `200` with only my enrollment

#### Scenario: Admin does not see Enrollment in the menu

- **Given** I am signed in as a user with role `admin`
- **When** I view the menu bar
- **Then** I do not see **Enrollment**

#### Scenario: Non-student enrollment request is rejected

- **Given** I am signed in as a user with role `admin`
- **When** I request `GET /api/enrollments`
- **Then** the API returns `403` with `{ "message": "Student role required." }`

#### Scenario: Unauthenticated API request to enrollments

- **Given** I have no valid session token
- **When** I request `GET /api/enrollments`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to enrollments

- **Given** I have no session in `localStorage`
- **When** I navigate to `/enrollments`
- **Then** I am redirected to the login page

#### Scenario: Non-student navigates to enrollments

- **Given** I am signed in as a user with role `admin`
- **When** I navigate to `/enrollments`
- **Then** I am redirected to home

---

## Test Coverage Map

Each scenario above maps to at least one automated test. Scenario titles match the `it` name.

| Story | Scenario | Test file | Test name |
| ----- | -------- | --------- | --------- |
| US-5.1 | Menu Selection | `frontend/tests/MenuBar.test.js`, `frontend/tests/Enrollments.test.js` | `Menu Selection` |
| US-5.2 | Student creates a new enrollment | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student creates a new enrollment` |
| US-5.2 | Student creates an enrollment with a missing section | `frontend/tests/Enrollments.test.js` | `Student creates an enrollment with a missing section` |
| US-5.2 | Student enrolls in a section they already have | `frontend/tests/Enrollments.test.js` | `Student enrolls in a section they already have` |
| US-5.2 | Student enrolls in a section they already have via the API | `backend/tests/enrollments.test.js` | `Student enrolls in a section they already have via the API` |
| US-5.2 | Student enrolls with an unknown section | `backend/tests/enrollments.test.js` | `Student enrolls with an unknown section` |
| US-5.3 | Enrollment view loads with existing enrollments | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Enrollment view loads with existing enrollments` |
| US-5.3 | There are no enrollments | `frontend/tests/Enrollments.test.js` | `There are no enrollments` |
| US-5.4 | Enrollment rows show edit and delete actions | `frontend/tests/Enrollments.test.js` | `Enrollment rows show edit and delete actions` |
| US-5.5 | Student selects to edit an enrollment | `frontend/tests/Enrollments.test.js` | `Student selects to edit an enrollment` |
| US-5.5 | Student edits an enrollment with a valid section and saves | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student edits an enrollment with a valid section and saves` |
| US-5.5 | Student edits an enrollment with a missing section and saves | `frontend/tests/Enrollments.test.js` | `Student edits an enrollment with a missing section and saves` |
| US-5.5 | Student edits an enrollment and cancels | `frontend/tests/Enrollments.test.js` | `Student edits an enrollment and cancels` |
| US-5.5 | Student updates an enrollment that is missing or not theirs | `backend/tests/enrollments.test.js` | `Student updates an enrollment that is missing or not theirs` |
| US-5.6 | Student selects to delete an enrollment | `frontend/tests/Enrollments.test.js` | `Student selects to delete an enrollment` |
| US-5.6 | Student deletes an enrollment | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student deletes an enrollment` |
| US-5.6 | Student cancels deleting an enrollment | `frontend/tests/Enrollments.test.js` | `Student cancels deleting an enrollment` |
| US-5.6 | Student deletes an enrollment that is missing or not theirs | `backend/tests/enrollments.test.js` | `Student deletes an enrollment that is missing or not theirs` |
| US-5.7 | Student sees only their own enrollments | `backend/tests/enrollments.test.js` | `Student sees only their own enrollments` |
| US-5.7 | Admin does not see Enrollment in the menu | `frontend/tests/MenuBar.test.js` | `Admin does not see Enrollment in the menu` |
| US-5.7 | Non-student enrollment request is rejected | `backend/tests/enrollments.test.js` | `Non-student enrollment request is rejected` |
| US-5.7 | Unauthenticated API request to enrollments | `backend/tests/enrollments.test.js` | `Unauthenticated API request to enrollments` |
| US-5.7 | Unauthenticated user navigates to enrollments | `frontend/tests/router.test.js` | `Unauthenticated user navigates to enrollments` |
| US-5.7 | Non-student navigates to enrollments | `frontend/tests/router.test.js` | `Non-student navigates to enrollments` |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 5 from @features/feature-5-student-enrollment.md on branch `feature/5-student-enrollment`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
Do not call GET /api/semesters from the student client.
```

**Reference updates for this feature:** `features/reference/data-model.md`, `features/reference/api.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Creating or editing semesters (Feature 2), courses (Feature 3), or sections (Feature 4)
- Student `GET /api/semesters` (Feature 2 keeps that route admin-only)
- Section capacity, waitlists, and schedule time conflicts
- Admin tools to enroll or drop a student
- Creating `MenuBar` (introduced in [Feature 1](feature-1-user-auth-session-management.md); this feature only adds **Enrollment** for role `student`)
