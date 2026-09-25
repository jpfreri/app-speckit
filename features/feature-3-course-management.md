# Feature: Course Management

**Feature ID:** 3
**Branch pattern:** `feature/3-course-management`
**Status:** Draft
**Created:** 2026-09-23
**Input:** Signed-in admin users manage a shared course catalog on one screen; new courses are added via a dialog. Courses have a name (30 characters), a required semester (Feature 2), start date, and end date. Sections (Feature 4) belong to a course, and students (Feature 5) choose a course when enrolling. Courses are not assigned to a user.
**Depends on:** [Feature 1 — User Authentication](feature-1-user-auth.md); [Feature 2 — Semester Management](feature-2-semester-management.md)

---

## User Stories

### US-2.1: Select to work with Courses

**As a** signed-in admin user  
**I want to** open the course view from the menu  
**So that** I can manage the academic calendar

**Priority:** P1  
**Independent test:** login as admin, view Courses on menubar; course view appears
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: Create course

**As a** signed-in admin user  
**I want to** create courses (e.g. "2026 Fall", "2026 Spring")  
**So that** sections can be scheduled in them and students can enroll

**Priority:** P1  
**Independent test:** Open add-course dialog, create a course; it appears in the courses view  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: View courses

**As a** signed-in admin user  
**I want to** see all courses on one screen  
**So that** I can see the course catalog

**Priority:** P1  
**Independent test:** Selecting Courses loads a screen that displays all courses  
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Manage course rows

**As a** signed-in admin user  
**I want** each course row to show **edit** and **delete** actions  
**So that** I can manage courses without leaving the courses view

**Priority:** P1  
**Independent test:** Each course row exposes edit and delete icon actions  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Edit a course

**As a** signed-in admin user  
**I want to** edit course data  
**So that** I can keep the course data accurate

**Priority:** P2  
**Independent test:** Edit a course from row actions; course view updates  
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

### US-2.6: Delete a course

**As a** signed-in admin user  
**I want to** delete a course  
**So that** I can keep the course data accurate

**Priority:** P2  
**Independent test:** Delete a course from row actions; course view updates  
**Acceptance scenarios:** see ### US-2.6 under Acceptance Criteria

### US-2.7: Restrict course management to admins

**As the** application  
**I want to** allow only users with role `admin` to manage the course catalog  
**So that** students cannot create, edit, or delete courses

**Priority:** P1  
**Independent test:** Sign in as a student — **Courses** is hidden; `POST /api/courses` returns `403`  
**Acceptance scenarios:** see ### US-2.7 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: All course endpoints MUST require a valid session (`authenticate`). `GET` MUST be allowed for any authenticated role. `POST`, `PUT`, and `DELETE` MUST require `req.user.role` equal to `admin`.
- **FR-002**: Courses MUST be a **shared catalog**. The `courses` table MUST NOT include `userId`. The API MUST ignore any client-supplied `userId`.
- **FR-003**: Authenticated non-admin users (including `student`) MUST receive `403` with `{ "message": "Admin role required." }` on `POST`, `PUT`, and `DELETE`. `GET` MUST return `200` for any authenticated user. They MUST NOT see **Courses** in `MenuBar`.
- **FR-004**: Required course fields MUST be present and trimmed. On the Courses UI, empty or whitespace-only values MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives empty or whitespace-only required fields, it MUST return `400`.
- **FR-005**: Unauthenticated course API requests MUST return `401`. Unauthenticated navigation to `/courses` MUST redirect to `login`.
- **FR-006**: Courses MUST be ordered by start date in API responses and in the courses view.
- **FR-007**: This feature MUST deliver admin course CRUD and a **single-view** course UI in `Courses.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-008**: `courseName` MUST be required, trimmed, and at most 30 characters. Too-long message: **"Course name must be 30 characters or fewer."** On the Courses UI, a too-long name MUST be blocked and MUST NOT send an API request. If the API receives a too-long `courseName`, it MUST return `400` with that message. `courseName` MUST be unique. Duplicate message: **"Course name is already taken."**
- **FR-009**: `startDate` and `endDate` MUST be required. `endDate` MUST be after `startDate` (equal dates are invalid). Date-order message: **"End date must be after start date."** On the Courses UI, an invalid date order MUST be blocked and MUST NOT send an API request. If the API receives `endDate` before or equal to `startDate`, it MUST return `400` with that message.
- **FR-010**: Unknown courseId on PUT / DELETE MUST return 404 with message: **"Course with id=<id> not found."**
- **FR-011**: `semesterId` MUST be required on create and update. It MUST reference an existing row in the Feature 2 `semesters` table. On the Courses UI, a missing semester MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives a missing `semesterId`, it MUST return `400`. If the API receives a `semesterId` that does not exist, it MUST return `400` with `{ "message": "Semester with id=<id> not found." }`.

---

## Assumptions

- Feature 1 auth (users with role of admin or student, authenticate, MenuBar) MUST be merged to dev before implementing this feature.
- Feature 2 semester catalog (`semesters` table, `GET /api/semesters`) MUST be merged to dev before implementing this feature. Tests may seed at least one semester.
- A user with role `admin` exists for this feature (Feature 1 `role`; tests may seed an admin).
- Courses are not owned by a signed-in user. Any authenticated user MAY `GET` the course catalog. The **Courses** manager UI is admin-only. Student enrollment UI is Feature 5.
- Courses use **dialog-based** workflows (no split sidebar / main panel).
- API mount for this resource is `/api/…`. Use `/api/courses`.

## Edge Cases

- Empty or whitespace-only required field (including missing semester) → client block; **"Required"**; no API call.
- `courseName` longer than 30 characters → **"Course name must be 30 characters or fewer."**
- `endDate` before or equal to `startDate` → **"End date must be after start date."**
- Duplicate courseName → `400` with `{ "message": "Course name is already taken." }`
- Unknown `semesterId` on POST/PUT → `400` with `{ "message": "Semester with id=<id> not found." }`
- Unknown `courseId` on PUT/DELETE → `404` (course does not exist — not a per-user hide).
- Authenticated `student` (or any non-admin) on `POST` / `PUT` / `DELETE` → `403`.
- Authenticated `student` on `GET` → `200` with the shared catalog.
- Unauthenticated user on `/courses` or `GET /api/courses` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in admin can create, view, edit, and delete the shared course catalog on one screen.
- **SC-003**: A signed-in student MAY `GET` the courses catalog; they cannot open the courses manager and cannot mutate courses via the API.
- **SC-004**: `npm test` passes for courses API and courses view behavior.

---

## Data Ownership & Isolation

Courses are a **shared catalog**. They are not owned by or assigned to a user. Only role `admin` may manage them. Any authenticated user MAY `GET` the catalog. Role `student` does not see the manager UI (enrollment is feature 5).

| Rule               | Requirement                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**     | `GET /api/courses` returns **all** courses to any authenticated user.                                                |
| **Write scope**    | `POST`, `PUT`, and `DELETE` are allowed only when `req.user.role` is `admin`.                                            |
| **Create scope**   | New courses have no owner. Do not persist `userId`. Ignore `userId` if sent in the body.                                 |
| **Missing course** | Unknown `courseId` → `404` with `{ "message": "Course with id=<id> not found." }`. Never use ownership `404` to hide rows. |
| **Non-admin**      | Authenticated non-admin `GET` → `200`. `POST` / `PUT` / `DELETE` → `403` with `{ "message": "Admin role required." }`.   |
| **UI scope**       | **Courses** menu and `/courses` are admin-only. Students do not see this manager.                                        |
| **Implementation** | Use `authenticate` on all endpoints. Use `requireAdmin` after `authenticate` on `POST`, `PUT`, and `DELETE` only.        |

---

## API Requirements

| Method   | Endpoint                     | Auth       | Purpose                                 |
| -------- | ---------------------------- | ---------- | --------------------------------------- |
| `GET`    | `/api/courses`           | Yes        | Fetch all courses in the shared catalog |
| `POST`   | `/api/courses`           | Yes, admin | Create a course in the shared catalog   |
| `PUT`    | `/api/courses/:courseId` | Yes, admin | Update a course                         |
| `DELETE` | `/api/courses/:courseId` | Yes, admin | Delete a course                         |

**Create course request body:**

```json
{
  "courseName": "CMSC-1234",
  "semesterId": 1,
  "startDate": "2026-08-15",
  "endDate": "2026-12-15"
}
```

Do not send `id` or `userId` on create. If `userId` is present, ignore it. `semesterId` is required and MUST reference an existing semester (FR-011).

**Update course request body:** same fields as create (no `id` / `userId`).

**Course success response** (`200` / `201`):

```json
{
  "id": 1,
  "courseName": "CMSC-1234",
  "semesterId": 1,
  "startDate": "2026-08-15",
  "endDate": "2026-12-15",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** unknown `courseId` → `404` with `{ "message": "Course with id=<id> not found." }`. Unknown `semesterId` on create/update → `400` (FR-011). Non-admin writes still use `403` (FR-003).

---

## Screen Requirements

### [View: Courses] — route name `courses` — path `/courses` — `Courses.vue`

- Heading: **Courses**
- Primary action: **+ New course** (`oc-cta`) opens the **Add Course** `<v-dialog>`.
- **Add Course** fields (same set on **Edit Course**, edit pre-filled):
  - **Course Name** (`v-text-field`)
  - **Semester** (`v-select`) — required; options loaded from the Feature 2 semester catalog (`GET /api/semesters`); on edit, pre-selected with the course's current semester. Admin MUST be able to assign a semester when adding or editing a course.
  - **Start Date** (`v-date-picker`)
  - **End Date** (`v-date-picker`)
- **Add Course** actions: **Create** (`oc-cta`) / **Cancel** (secondary `variant="text"` or `outlined`).
- List: `v-table` (or `v-list`); columns **course name**, **semester**, **start date**, and **end date**; rows ordered by start date (FR-006). No Items/sections icon in this feature.
- Icon-only row actions use `size="small"` and accessible `aria-label`s:
  - **Edit course** — opens **Edit Course** `<v-dialog>` pre-filled with current data; **Save Course** (`oc-cta`) / **Cancel** (secondary)
  - **Delete course** — opens **Delete Course** confirmation `<v-dialog>` with copy **"Delete this course?"**; **Delete Course** (`oc-cta`) / **Cancel** (secondary)
- Client-side validation: required fields use inline rules (`"Required"`); invalid submit does not send an API request.
- **Empty state:** **"No courses yet. Create your first course."** when the shared catalog has no courses.
- **Loading state:** skeleton or progress indicator while courses are fetching.
- **Error state:** `<v-alert type="error">` for API failures.
- Admin-only: **Courses** menu item and `/courses` are for signed-in admin users. Other roles do not see the **Courses** item. Unauthenticated navigation to `/courses` redirects to `login`.
- Course CRUD dialogs live in `Courses.vue` (or child presentational dialogs). No sidebar/main split.

**App chrome**

- Use the `MenuBar` introduced in [Feature 1](feature-1-user-auth.md). Do **not** create a second `MenuBar`. Do **not** hide it on `login` / `register`.
- Add **Courses** (allowed role `admin`; navigates to `/courses`) to `MenuBar`. Keep name and **Sign out** from Feature 1.
- Students MUST NOT see **Courses** (`user.role` is not `admin`).
- After login, the user remains on Feature 1 `home`. US-2.1 is selecting **Courses** in the menu.

---

## Key Entities

- **Course**: shared catalog row (course name, semester, start date, end date). Belongs to a Semester (Feature 2). Not owned by a user. Admins manage it in this feature. Sections are scheduled in a course (Feature 4), and students select a course when enrolling (Feature 5).

---

## Data Model Requirements

### `courses` table

| Field       | Type       | Rules                                              |
| ----------- | ---------- | -------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                     |
| `courseName`      | STRING(30) | Required; trimmed; at most 30 characters           |
| `semesterId` | INTEGER FK | Required; references `semesters.id` (Feature 2)   |
| `startDate` | DATE       | Required                                           |
| `endDate`   | DATE       | Required; must be after `startDate`                |               |
| `createdAt` | DATETIME       | Sequelize timestamps                               
| `updatedAt` | DATETIME       | Sequelize timestamps                               |

Unique index on (`courseName`).  

### Associations (in `models/index.js`)

- Course belongsTo Semester (`semesterId`). Semester hasMany Course.
- Feature 4 adds Section belongsTo Course / Course hasMany Section.

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Select to work with Courses

#### Scenario: Menu Selection

- **Given** I am signed in as a user with role `admin`
- **When** I click **Courses** in Menu Bar
- **Then** the courses view is displayed

### US-2.2 — Create course

#### Scenario: User creates a new course

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course name `CMSC-1234`, select semester `2026 Fall`, start date `2026-08-15`, and end date `2026-12-15`
- **And** I click **Create**
- **Then** the API returns `201` with a course object containing `id`, `courseName` `CMSC-1234`, `semesterId`, `startDate`, and `endDate`
- **And** `CMSC-1234` appears in the courses view list with semester `2026 Fall`
- **And** the add-course dialog closes

#### Scenario: User creates a course with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I leave a required field empty (including semester)
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: User creates a course with a name that is too long

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course name `2026 Fall Extended Summer Session`, select semester `2026 Fall`, with valid start and end dates
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Course name must be 30 characters or fewer."**

#### Scenario: User creates a course with end date before start date

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course name `CMSC-1234`, select semester `2026 Fall`, start date `2026-12-15`, and end date `2026-08-15`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"End date must be after start date."**

#### Scenario: User creates a course with a duplicate name

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course name `CMSC-1234`, select semester `2026 Fall`, with valid start and end dates
- **And** I click **Create**
- **Then** the API returns `400` with `{ "message": "Course name is already taken." }`
- **And** no second course named `CMSC-1234` is stored

#### Scenario: User creates a course with an unknown semester

- **Given** I am signed in as a user with role `admin`
- **When** I send `POST /api/courses` with a valid course body except `semesterId` that does not exist
- **Then** the API returns `400` with `{ "message": "Semester with id=<id> not found." }`
- **And** no new course is stored

---

### US-2.3 — View courses

#### Scenario: Courses view loads with existing courses

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** courses exist
- **When** I view the courses list
- **Then** all the courses are displayed in the list ordered by start date

#### Scenario: There are no courses

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** there are no courses
- **When** I view the courses list
- **Then** I see **"No courses yet. Create your first course."**

---

### US-2.4 — Manage course rows

#### Scenario: course rows show edit and delete actions

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I view a course row
- **Then** the course row shows an **Edit course** icon action
- **And** the course row shows a **Delete course** icon action

---

### US-2.5 — Edit a course

#### Scenario: User selects to edit a course

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click the edit icon on a course row
- **Then** the course edit dialog is displayed pre-filled with that course's data

#### Scenario: User edits a course with valid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** the course edit dialog is displayed
- **When** I update values in the fields with valid values
- **And** I click **Save Course**
- **Then** the course data is updated
- **And** the dialog is closed

#### Scenario: User edits a course with invalid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** the course edit dialog is displayed
- **When** I update values in the fields with invalid values
- **And** I click **Save Course**
- **Then** the appropriate error messages are shown
- **And** the dialog is not closed

#### Scenario: User edits a course and cancels

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** the course edit dialog is displayed
- **When** I update values in the fields
- **And** I click **Cancel**
- **Then** the course data is not updated
- **And** the dialog is closed

---

### US-2.6 — Delete a course

#### Scenario: User selects to delete a course

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click the delete icon on a course row
- **Then** the course delete dialog is displayed

#### Scenario: User deletes a course

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** the course delete dialog is displayed
- **When** I click **Delete Course**
- **Then** the course is deleted
- **And** the dialog is closed
- **And** the course list is displayed and the course is not in the list

#### Scenario: User cancels deleting a course

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** the course delete dialog is displayed
- **When** I click **Cancel**
- **Then** the course is not deleted
- **And** the dialog is closed
- **And** the course list is displayed and the course is in the list

---

### US-2.7 — Restrict course management to admins

#### Scenario: Student does not see Courses in the menu

- **Given** I am signed in as a user with role `student`
- **When** I view the `MenuBar`
- **Then** **Courses** is not shown

#### Scenario: Student can list courses via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/courses`
- **Then** the API returns `200` with an array of course objects

#### Scenario: Student cannot create a course via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/courses` with a valid course body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new course is stored

#### Scenario: Unauthenticated API request to courses

- **Given** I have no valid session token
- **When** I request `GET /api/courses`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to courses

- **Given** I have no session in `localStorage`
- **When** I navigate to `/courses`
- **Then** I am redirected to the login page

---

## Test Coverage Map

| Story  | Scenario                                                | Test file                                                         | Test name                                                 |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| US-2.1 | Menu Selection                                          | `frontend/tests/MenuBar.test.js`, `frontend/tests/Courses.test.js` | `Menu Selection`                                          |
| US-2.2 | User creates a new course                               | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `User creates a new course`                               |
| US-2.2 | User creates a course with a missing required field     | `frontend/tests/Courses.test.js`                                  | `User creates a course with a missing required field`     |
| US-2.2 | User creates a course with a name that is too long      | `frontend/tests/Courses.test.js`                                  | `User creates a course with a name that is too long`      |
| US-2.2 | User creates a course with end date before start date   | `frontend/tests/Courses.test.js`                                  | `User creates a course with end date before start date`   |
| US-2.2 | User creates a course with a duplicate name             | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `User creates a course with a duplicate name`             |         
| US-2.2 | User creates a course with an unknown semester          | `backend/tests/courses.test.js`                                   | `User creates a course with an unknown semester`          |
| US-2.3 | Courses view loads with existing courses                | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Courses view loads with existing courses`                |
| US-2.3 | There are no courses                                     | `frontend/tests/Courses.test.js`                                  | `There are no courses`                                     |
| US-2.4 | course rows show edit and delete actions                | `frontend/tests/Courses.test.js`                                  | `course rows show edit and delete actions`                |
| US-2.5 | User selects to edit a course                           | `frontend/tests/Courses.test.js`                                  | `User selects to edit a course`                           |
| US-2.5 | User edits a course with valid values and saves         | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `User edits a course with valid values and saves`         |
| US-2.5 | User edits a course with invalid values and saves       | `frontend/tests/Courses.test.js`                                  | `User edits a course with invalid values and saves`       |
| US-2.5 | User edits a course and cancels                         | `frontend/tests/Courses.test.js`                                  | `User edits a course and cancels`                         |
| US-2.6 | User selects to delete a course                         | `frontend/tests/Courses.test.js`                                  | `User selects to delete a course`                         |
| US-2.6 | User deletes a course                                   | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `User deletes a course`                                   |
| US-2.6 | User cancels deleting a course                          | `frontend/tests/Courses.test.js`                                  | `User cancels deleting a course`                          |
| US-2.7 | Student does not see Courses in the menu                | `frontend/tests/MenuBar.test.js`                                  | `Student does not see Courses in the menu`                |
| US-2.7 | Student can list courses via the API                    | `backend/tests/courses.test.js`                                   | `Student can list courses via the API`                    |
| US-2.7 | Student cannot create a course via the API              | `backend/tests/courses.test.js`                                   | `Student cannot create a course via the API`              |
| US-2.7 | Unauthenticated API request to courses                  | `backend/tests/courses.test.js`                                   | `Unauthenticated API request to courses`                  |
| US-2.7 | Unauthenticated user navigates to courses               | `frontend/tests/router.test.js`                                   | `Unauthenticated user navigates to courses`               |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 2 from @features/feature-2-course-management.md on branch `feature/2-course-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
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

- Student-facing course catalog UI (API `GET` is in this feature)
- Student enrollment in courses (Feature 5)
- Sections and their link to courses (Feature 4)
- Courses catalog (Feature 3)
- Non-admin course management UI
- Creating `MenuBar` (introduced in [Feature 1](feature-1-user-auth.md); this feature only adds **Courses** for role `admin`)

---

## Delivered to Feature 3, 4, and 5

- `MenuBar` is Feature 1 chrome; Feature 2 added **Courses** for `admin`. Later features add their own items (e.g. Courses, Sections) and MUST NOT create a second MenuBar.
- Feature 4 MUST reject `DELETE /api/courses/:courseId` with `400` and `{ "message": "Cannot delete course: sections still exist." }` when sections still reference that course. Do not cascade-delete sections.
- Feature 5 uses `GET /api/courses` so a student can select a course before choosing sections to enroll in.

---
