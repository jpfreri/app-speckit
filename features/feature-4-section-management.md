# Feature: Section Management

**Feature ID:** 4
**Branch pattern:** `feature/4-section-management`
**Status:** Draft
**Created:** 2026-09-23
**Input:** Signed-in admin users manage a shared section catalog on one screen; new sections are added via a dialog. Sections have a name (30 characters), a required course (Feature 3), a required semester (Feature 2), start date, and end date. Students (Feature 5) choose sections when enrolling. Sections are not assigned to a user.
**Depends on:** [Feature 1 — User Authentication](feature-1-user-auth.md); [Feature 2 — Semester Management](feature-2-semester-management.md); [Feature 3 — Course Management](feature-3-course-management)

---

## User Stories

### US-2.1: Select to work with Sections

**As a** signed-in admin user  
**I want to** open the section view from the menu  
**So that** I can manage the academic calendar

**Priority:** P1  
**Independent test:** login as admin, view Sections on menubar; section view appears
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: Create section

**As a** signed-in admin user  
**I want to** create sections 
**So that** students can enroll in scheduled course offerings

**Priority:** P1  
**Independent test:** Open add-section dialog, create a section; it appears in the sections view  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: View sections

**As a** signed-in admin user  
**I want to** see all sections on one screen  
**So that** I can see the section catalog

**Priority:** P1  
**Independent test:** Selecting Sections loads a screen that displays all sections  
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Manage section rows

**As a** signed-in admin user  
**I want** each section row to show **edit** and **delete** actions  
**So that** I can manage sections without leaving the sections view

**Priority:** P1  
**Independent test:** Each section row exposes edit and delete icon actions  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Edit a section

**As a** signed-in admin user  
**I want to** edit section data  
**So that** I can keep the section data accurate

**Priority:** P2  
**Independent test:** Edit a section from row actions; section view updates  
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

### US-2.6: Delete a section

**As a** signed-in admin user  
**I want to** delete a section  
**So that** I can keep the section data accurate

**Priority:** P2  
**Independent test:** Delete a section from row actions; section view updates  
**Acceptance scenarios:** see ### US-2.6 under Acceptance Criteria

### US-2.7: Restrict section management to admins

**As the** application  
**I want to** allow only users with role `admin` to manage the section catalog  
**So that** students cannot create, edit, or delete sections

**Priority:** P1  
**Independent test:** Sign in as a student — **Sections** is hidden; `POST /api/sections` returns `403`  
**Acceptance scenarios:** see ### US-2.7 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: All section endpoints MUST require a valid session (`authenticate`). `GET` MUST be allowed for any authenticated role. `POST`, `PUT`, and `DELETE` MUST require `req.user.role` equal to `admin`.
- **FR-002**: Sections MUST be a **shared catalog**. The `sections` table MUST NOT include `userId`. The API MUST ignore any client-supplied `userId`.
- **FR-003**: Authenticated non-admin users (including `student`) MUST receive `403` with `{ "message": "Admin role required." }` on `POST`, `PUT`, and `DELETE`. `GET` MUST return `200` for any authenticated user. They MUST NOT see **Sections** in `MenuBar`.
- **FR-004**: Required section fields MUST be present and trimmed. On the Sections UI, empty or whitespace-only values MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives empty or whitespace-only required fields, it MUST return `400`.
- **FR-005**: Unauthenticated section API requests MUST return `401`. Unauthenticated navigation to `/sections` MUST redirect to `login`.
- **FR-006**: Sections MUST be ordered by start date in API responses and in the sections view.
- **FR-007**: This feature MUST deliver admin section CRUD and a **single-view** section UI in `Sections.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-008**: `sectionName` MUST be required, trimmed, and at most 30 characters. Too-long message: **"Section name must be 30 characters or fewer."** On the Sections UI, a too-long name MUST be blocked and MUST NOT send an API request. If the API receives a too-long `sectionName`, it MUST return `400` with that message. `sectionName` MUST be unique. Duplicate message: **"Section name is already taken."**
- **FR-009**: `startDate` and `endDate` MUST be required. `endDate` MUST be after `startDate` (equal dates are invalid). Date-order message: **"End date must be after start date."** On the Sections UI, an invalid date order MUST be blocked and MUST NOT send an API request. If the API receives `endDate` before or equal to `startDate`, it MUST return `400` with that message.
- **FR-010**: Unknown sectionId on PUT / DELETE MUST return 404 with message: **"Section with id=<id> not found."**
- **FR-011**: `semesterId` MUST be required on create and update. It MUST reference an existing row in the Feature 2 `semesters` table. On the Sections UI, a missing semester MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives a missing `semesterId`, it MUST return `400`. If the API receives a `semesterId` that does not exist, it MUST return `400` with `{ "message": "Semester with id=<id> not found." }`.
- **FR-012**: `courseId` MUST be required on create and update. It MUST reference an existing row in the Feature 3 `courses` table. On the Sections UI, a missing course MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives a missing `courseId`, it MUST return `400`. If the API receives a `courseId` that does not exist, it MUST return `400` with `{ "message": "Course with id=<id> not found." }`.

---

## Assumptions

- Feature 1 auth (users with role of admin or student, authenticate, MenuBar) MUST be merged to dev before implementing this feature.
- Feature 2 semester catalog (`semesters` table, `GET /api/semesters`) MUST be merged to dev before implementing this feature. Tests may seed at least one semester.
- Feature 3 course catalog (`courses` table, `GET /api/courses`) MUST be merged to dev before implementing this feature. Tests may seed at least one course.
- A user with role `admin` exists for this feature (Feature 1 `role`; tests may seed an admin).
- Sections are not owned by a signed-in user. Any authenticated user MAY `GET` the section catalog. The **Sections** manager UI is admin-only. Student enrollment UI is Feature 5.
- Sections use **dialog-based** workflows (no split sidebar / main panel).
- API mount for this resource is `/api/…`. Use `/api/sections`.

## Edge Cases

- Empty or whitespace-only required field (including missing semester or course) → client block; **"Required"**; no API call.
- `sectionName` longer than 30 characters → **"Section name must be 30 characters or fewer."**
- `endDate` before or equal to `startDate` → **"End date must be after start date."**
- Duplicate sectionName → `400` with `{ "message": "Section name is already taken." }`
- Unknown `semesterId` on POST/PUT → `400` with `{ "message": "Semester with id=<id> not found." }`
- Unknown `courseId` on POST/PUT → `400` with `{ "message": "Course with id=<id> not found." }`
- Unknown `sectionId` on PUT/DELETE → `404` (section does not exist — not a per-user hide).
- Authenticated `student` (or any non-admin) on `POST` / `PUT` / `DELETE` → `403`.
- Authenticated `student` on `GET` → `200` with the shared catalog.
- Unauthenticated user on `/sections` or `GET /api/sections` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in admin can create, view, edit, and delete the shared section catalog on one screen.
- **SC-003**: A signed-in student MAY `GET` the sections catalog; they cannot open the sections manager and cannot mutate sections via the API.
- **SC-004**: `npm test` passes for sections API and sections view behavior.

---

## Data Ownership & Isolation

Sections are a **shared catalog**. They are not owned by or assigned to a user. Only role `admin` may manage them. Any authenticated user MAY `GET` the catalog. Role `student` does not see the manager UI (enrollment is feature 5).

| Rule               | Requirement                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**     | `GET /api/sections` returns **all** sections to any authenticated user.                                                |
| **Write scope**    | `POST`, `PUT`, and `DELETE` are allowed only when `req.user.role` is `admin`.                                            |
| **Create scope**   | New sections have no owner. Do not persist `userId`. Ignore `userId` if sent in the body.                                 |
| **Missing section** | Unknown `sectionId` → `404` with `{ "message": "Section with id=<id> not found." }`. Never use ownership `404` to hide rows. |
| **Non-admin**      | Authenticated non-admin `GET` → `200`. `POST` / `PUT` / `DELETE` → `403` with `{ "message": "Admin role required." }`.   |
| **UI scope**       | **Sections** menu and `/sections` are admin-only. Students do not see this manager.                                        |
| **Implementation** | Use `authenticate` on all endpoints. Use `requireAdmin` after `authenticate` on `POST`, `PUT`, and `DELETE` only.        |

---

## API Requirements

| Method   | Endpoint                     | Auth       | Purpose                                 |
| -------- | ---------------------------- | ---------- | --------------------------------------- |
| `GET`    | `/api/sections`           | Yes        | Fetch all sections in the shared catalog |
| `POST`   | `/api/sections`           | Yes, admin | Create a section in the shared catalog   |
| `PUT`    | `/api/sections/:sectionId` | Yes, admin | Update a section                         |
| `DELETE` | `/api/sections/:sectionId` | Yes, admin | Delete a section                         |

**Create section request body:**

```json
{
  "sectionName": "01",
  "courseId": 1,
  "semesterId": 1,
  "startDate": "2026-08-15",
  "endDate": "2026-12-15"
}
```

Do not send `id` or `userId` on create. If `userId` is present, ignore it. `courseId` and `semesterId` are required and MUST reference an existing course and semester (FR-011, FR-012).

**Update section request body:** same fields as create (no `id` / `userId`).

**Section success response** (`200` / `201`):

```json
{
  "id": 1,
  "sectionName": "01",
  "courseId": 1,
  "semesterId": 1,
  "startDate": "2026-08-15",
  "endDate": "2026-12-15",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** unknown `sectionId` → `404` with `{ "message": "Section with id=<id> not found." }`. Unknown `semesterId` or `courseId` on create/update → `400` (FR-011, FR-012). Non-admin writes still use `403` (FR-003).

---

## Screen Requirements

### [View: Sections] — route name `sections` — path `/sections` — `Sections.vue`

- Heading: **Sections**
- Primary action: **+ New section** (`oc-cta`) opens the **Add Section** `<v-dialog>`.
- **Add Section** fields (same set on **Edit Section**, edit pre-filled):
  - **Section Name** (`v-text-field`)
  - **Course** (`v-select`) — required; options loaded from the Feature 3 course catalog (`GET /api/courses`); on edit, pre-selected with the section's current course. Admin MUST choose a course when adding or editing a section.
  - **Semester** (`v-select`) — required; options loaded from the Feature 2 semester catalog (`GET /api/semesters`); on edit, pre-selected with the section's current semester. Admin MUST choose a semester when adding or editing a section.
  - **Start Date** (`v-date-picker`)
  - **End Date** (`v-date-picker`)
- **Add Section** actions: **Create** (`oc-cta`) / **Cancel** (secondary `variant="text"` or `outlined`).
- List: `v-table` (or `v-list`); columns **section name**, **course**, **semester**, **start date**, and **end date**; rows ordered by start date (FR-006). No Items icon in this feature.
- Icon-only row actions use `size="small"` and accessible `aria-label`s:
  - **Edit section** — opens **Edit Section** `<v-dialog>` pre-filled with current data; **Save Section** (`oc-cta`) / **Cancel** (secondary)
  - **Delete section** — opens **Delete Section** confirmation `<v-dialog>` with copy **"Delete this section?"**; **Delete Section** (`oc-cta`) / **Cancel** (secondary)
- Client-side validation: required fields use inline rules (`"Required"`); invalid submit does not send an API request.
- **Empty state:** **"No sections yet. Create your first section."** when the shared catalog has no sections.
- **Loading state:** skeleton or progress indicator while sections are fetching.
- **Error state:** `<v-alert type="error">` for API failures.
- Admin-only: **Sections** menu item and `/sections` are for signed-in admin users. Other roles do not see the **Sections** item. Unauthenticated navigation to `/sections` redirects to `login`.
- Section CRUD dialogs live in `Sections.vue` (or child presentational dialogs). No sidebar/main split.

**App chrome**

- Use the `MenuBar` introduced in [Feature 1](feature-1-user-auth.md). Do **not** create a second `MenuBar`. Do **not** hide it on `login` / `register`.
- Add **Sections** (allowed role `admin`; navigates to `/sections`) to `MenuBar`. Keep name and **Sign out** from Feature 1.
- Students MUST NOT see **Sections** (`user.role` is not `admin`).
- After login, the user remains on Feature 1 `home`. US-2.1 is selecting **Sections** in the menu.

---

## Key Entities

- **Section**: shared catalog row (section name, course, semester, start date, end date). Belongs to a Course (Feature 3) and a Semester (Feature 2). Not owned by a user. Admins manage it in this feature. Students select sections when enrolling (Feature 5).

---

## Data Model Requirements

### `sections` table

| Field       | Type       | Rules                                              |
| ----------- | ---------- | -------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                     |
| `sectionName`      | STRING(30) | Required; trimmed; at most 30 characters           |
| `courseId`  | INTEGER FK | Required; references `courses.id` (Feature 3)      |
| `semesterId` | INTEGER FK | Required; references `semesters.id` (Feature 2)   |
| `startDate` | DATE       | Required                                           |
| `endDate`   | DATE       | Required; must be after `startDate`                |               |
| `createdAt` | DATETIME       | Sequelize timestamps                               
| `updatedAt` | DATETIME       | Sequelize timestamps                               |

Unique index on (`sectionName`).  

### Associations (in `models/index.js`)

- Section belongsTo Course (`courseId`). Course hasMany Section.
- Section belongsTo Semester (`semesterId`). Semester hasMany Section.

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Select to work with Sections

#### Scenario: Menu Selection

- **Given** I am signed in as a user with role `admin`
- **When** I click **Sections** in Menu Bar
- **Then** the sections view is displayed

### US-2.2 — Create section

#### Scenario: User creates a new section

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I enter section name `01`, select course `CMSC-1234`, select semester `2026 Fall`, start date `2026-08-15`, and end date `2026-12-15`
- **And** I click **Create**
- **Then** the API returns `201` with a section object containing `id`, `sectionName` `01`, `courseId`, `semesterId`, `startDate`, and `endDate`
- **And** `01` appears in the sections view list with course `CMSC-1234` and semester `2026 Fall`
- **And** the add-section dialog closes

#### Scenario: User creates a section with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I leave a required field empty (including course or semester)
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: User creates a section with a name that is too long

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I enter section name `2026 Fall Extended Summer Session`, select course `CMSC-1234`, select semester `2026 Fall`, with valid start and end dates
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Section name must be 30 characters or fewer."**

#### Scenario: User creates a section with end date before start date

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I enter section name `01`, select course `CMSC-1234`, select semester `2026 Fall`, start date `2026-12-15`, and end date `2026-08-15`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"End date must be after start date."**

#### Scenario: User creates a section with a duplicate name

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And** a section named `01` already exists
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I enter section name `01`, select course `CMSC-1234`, select semester `2026 Fall`, with valid start and end dates
- **And** I click **Create**
- **Then** the API returns `400` with `{ "message": "Section name is already taken." }`
- **And** no second section named `01` is stored

#### Scenario: User creates a section with an unknown semester

- **Given** I am signed in as a user with role `admin`
- **And** a course named `CMSC-1234` already exists
- **When** I send `POST /api/sections` with a valid section body except `semesterId` that does not exist
- **Then** the API returns `400` with `{ "message": "Semester with id=<id> not found." }`
- **And** no new section is stored

#### Scenario: User creates a section with an unknown course

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **When** I send `POST /api/sections` with a valid section body except `courseId` that does not exist
- **Then** the API returns `400` with `{ "message": "Course with id=<id> not found." }`
- **And** no new section is stored

---

### US-2.3 — View sections

#### Scenario: Sections view loads with existing sections

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** sections exist
- **When** I view the sections list
- **Then** all the sections are displayed in the list ordered by start date

#### Scenario: There are no sections

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** there are no sections
- **When** I view the sections list
- **Then** I see **"No sections yet. Create your first section."**

---

### US-2.4 — Manage section rows

#### Scenario: section rows show edit and delete actions

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I view a section row
- **Then** the section row shows an **Edit section** icon action
- **And** the section row shows a **Delete section** icon action

---

### US-2.5 — Edit a section

#### Scenario: User selects to edit a section

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I click the edit icon on a section row
- **Then** the section edit dialog is displayed pre-filled with that section's data

#### Scenario: User edits a section with valid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** the section edit dialog is displayed
- **When** I update values in the fields with valid values
- **And** I click **Save Section**
- **Then** the section data is updated
- **And** the dialog is closed

#### Scenario: User edits a section with invalid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** the section edit dialog is displayed
- **When** I update values in the fields with invalid values
- **And** I click **Save Section**
- **Then** the appropriate error messages are shown
- **And** the dialog is not closed

#### Scenario: User edits a section and cancels

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** the section edit dialog is displayed
- **When** I update values in the fields
- **And** I click **Cancel**
- **Then** the section data is not updated
- **And** the dialog is closed

---

### US-2.6 — Delete a section

#### Scenario: User selects to delete a section

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I click the delete icon on a section row
- **Then** the section delete dialog is displayed

#### Scenario: User deletes a section

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** the section delete dialog is displayed
- **When** I click **Delete Section**
- **Then** the section is deleted
- **And** the dialog is closed
- **And** the section list is displayed and the section is not in the list

#### Scenario: User cancels deleting a section

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** the section delete dialog is displayed
- **When** I click **Cancel**
- **Then** the section is not deleted
- **And** the dialog is closed
- **And** the section list is displayed and the section is in the list

---

### US-2.7 — Restrict section management to admins

#### Scenario: Student does not see Sections in the menu

- **Given** I am signed in as a user with role `student`
- **When** I view the `MenuBar`
- **Then** **Sections** is not shown

#### Scenario: Student can list sections via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/sections`
- **Then** the API returns `200` with an array of section objects

#### Scenario: Student cannot create a section via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/sections` with a valid section body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new section is stored

#### Scenario: Unauthenticated API request to sections

- **Given** I have no valid session token
- **When** I request `GET /api/sections`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to sections

- **Given** I have no session in `localStorage`
- **When** I navigate to `/sections`
- **Then** I am redirected to the login page

---

## Test Coverage Map

| Story  | Scenario                                                | Test file                                                         | Test name                                                 |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| US-2.1 | Menu Selection                                          | `frontend/tests/MenuBar.test.js`, `frontend/tests/Sections.test.js` | `Menu Selection`                                          |
| US-2.2 | User creates a new section                               | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `User creates a new section`                               |
| US-2.2 | User creates a section with a missing required field     | `frontend/tests/Sections.test.js`                                  | `User creates a section with a missing required field`     |
| US-2.2 | User creates a section with a name that is too long      | `frontend/tests/Sections.test.js`                                  | `User creates a section with a name that is too long`      |
| US-2.2 | User creates a section with end date before start date   | `frontend/tests/Sections.test.js`                                  | `User creates a section with end date before start date`   |
| US-2.2 | User creates a section with a duplicate name             | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `User creates a section with a duplicate name`             |         
| US-2.2 | User creates a section with an unknown semester          | `backend/tests/sections.test.js`                                   | `User creates a section with an unknown semester`          |
| US-2.2 | User creates a section with an unknown course            | `backend/tests/sections.test.js`                                   | `User creates a section with an unknown course`            |
| US-2.3 | Sections view loads with existing sections                | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `Sections view loads with existing sections`                |
| US-2.3 | There are no sections                                     | `frontend/tests/Sections.test.js`                                  | `There are no sections`                                     |
| US-2.4 | section rows show edit and delete actions                | `frontend/tests/Sections.test.js`                                  | `section rows show edit and delete actions`                |
| US-2.5 | User selects to edit a section                           | `frontend/tests/Sections.test.js`                                  | `User selects to edit a section`                           |
| US-2.5 | User edits a section with valid values and saves         | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `User edits a section with valid values and saves`         |
| US-2.5 | User edits a section with invalid values and saves       | `frontend/tests/Sections.test.js`                                  | `User edits a section with invalid values and saves`       |
| US-2.5 | User edits a section and cancels                         | `frontend/tests/Sections.test.js`                                  | `User edits a section and cancels`                         |
| US-2.6 | User selects to delete a section                         | `frontend/tests/Sections.test.js`                                  | `User selects to delete a section`                         |
| US-2.6 | User deletes a section                                   | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `User deletes a section`                                   |
| US-2.6 | User cancels deleting a section                          | `frontend/tests/Sections.test.js`                                  | `User cancels deleting a section`                          |
| US-2.7 | Student does not see Sections in the menu                | `frontend/tests/MenuBar.test.js`                                  | `Student does not see Sections in the menu`                |
| US-2.7 | Student can list sections via the API                    | `backend/tests/sections.test.js`                                   | `Student can list sections via the API`                    |
| US-2.7 | Student cannot create a section via the API              | `backend/tests/sections.test.js`                                   | `Student cannot create a section via the API`              |
| US-2.7 | Unauthenticated API request to sections                  | `backend/tests/sections.test.js`                                   | `Unauthenticated API request to sections`                  |
| US-2.7 | Unauthenticated user navigates to sections               | `frontend/tests/router.test.js`                                   | `Unauthenticated user navigates to sections`               |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 4 from @features/feature-4-section-management on branch `feature/4-section-management`.

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

- Student-facing section catalog UI (API `GET` is in this feature)
- Student enrollment in sections (Feature 5)
- Creating or editing courses (Feature 3) or semesters (Feature 2)
- Non-admin section management UI
- Creating `MenuBar` (introduced in [Feature 1](feature-1-user-auth.md); this feature only adds **Sections** for role `admin`)

---

## Delivered to Feature 5

- `MenuBar` is Feature 1 chrome; Features 2–4 add **Semesters**, **Courses**, and **Sections** for `admin`. Feature 5 MUST NOT create a second MenuBar.
- Feature 5 uses `GET /api/sections` so a student can select sections to enroll in.
- Feature 3 (or later) MAY reject `DELETE /api/courses/:courseId` with `400` when sections still reference that course. This feature does not cascade-delete enrollments.

---
