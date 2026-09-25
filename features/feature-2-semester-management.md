# Feature: Semester Management

**Feature ID:** 2
**Branch pattern:** `feature/2-semester-management`
**Status:** Draft
**Created:** 2026-09-23
**Input:** Signed-in admin users manage a shared semester catalog on one screen; new semesters are added via a dialog. Semesters have a name (30 characters), start date, and end date. Sections (Feature 4) belong to a semester, and students (Feature 5) choose a semester when enrolling. Semesters are not assigned to a user.
**Depends on:** [Feature 1 — User Authentication](feature-1-user-auth.md)

---

## User Stories

### US-2.1: Select to work with Semesters

**As a** signed-in admin user  
**I want to** open the semesters view from the menu  
**So that** I can manage the academic calendar

**Priority:** P1  
**Independent test:** login as admin, view Semesters on menubar; semester view appears
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: Create semester

**As a** signed-in admin user  
**I want to** create semesters (e.g. "2026 Fall", "2026 Spring")  
**So that** sections can be scheduled in them and students can enroll

**Priority:** P1  
**Independent test:** Open add-semester dialog, create a semester; it appears in the semesters view  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: View semesters

**As a** signed-in admin user  
**I want to** see all semesters on one screen  
**So that** I can see the semester catalog

**Priority:** P1  
**Independent test:** Selecting Semesters loads a screen that displays all semesters  
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Manage semester rows

**As a** signed-in admin user  
**I want** each semester row to show **edit** and **delete** actions  
**So that** I can manage semesters without leaving the semesters view

**Priority:** P1  
**Independent test:** Each semester row exposes edit and delete icon actions  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Edit a semester

**As a** signed-in admin user  
**I want to** edit semester data  
**So that** I can keep the semester data accurate

**Priority:** P2  
**Independent test:** Edit a semester from row actions; semester view updates  
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

### US-2.6: Delete a semester

**As a** signed-in admin user  
**I want to** delete a semester  
**So that** I can keep the semester data accurate

**Priority:** P2  
**Independent test:** Delete a semester from row actions; semester view updates  
**Acceptance scenarios:** see ### US-2.6 under Acceptance Criteria

### US-2.7: Restrict semester management to admins

**As the** application  
**I want to** allow only users with role `admin` to manage the semester catalog  
**So that** students cannot create, edit, or delete semesters

**Priority:** P1  
**Independent test:** Sign in as a student — **Semesters** is hidden; `POST /api/semesters` returns `403`  
**Acceptance scenarios:** see ### US-2.7 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: All semester endpoints MUST require a valid session (`authenticate`). `GET` MUST be allowed for any authenticated role. `POST`, `PUT`, and `DELETE` MUST require `req.user.role` equal to `admin`.
- **FR-002**: Semesters MUST be a **shared catalog**. The `semesters` table MUST NOT include `userId`. The API MUST ignore any client-supplied `userId`.
- **FR-003**: Authenticated non-admin users (including `student`) MUST receive `403` with `{ "message": "Admin role required." }` on `POST`, `PUT`, and `DELETE`. `GET` MUST return `200` for any authenticated user. They MUST NOT see **Semesters** in `MenuBar`.
- **FR-004**: Required semester fields MUST be present and trimmed. On the Semesters UI, empty or whitespace-only values MUST be blocked with **"Required"** and MUST NOT send an API request. If the API receives empty or whitespace-only required fields, it MUST return `400`.
- **FR-005**: Unauthenticated semester API requests MUST return `401`. Unauthenticated navigation to `/semesters` MUST redirect to `login`.
- **FR-006**: Semesters MUST be ordered by start date in API responses and in the semesters view.
- **FR-007**: This feature MUST deliver admin semester CRUD and a **single-view** semester UI in `Semesters.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-008**: `semesterName` MUST be required, trimmed, and at most 30 characters. Too-long message: **"Semester name must be 30 characters or fewer."** On the Semesters UI, a too-long name MUST be blocked and MUST NOT send an API request. If the API receives a too-long `semesterName`, it MUST return `400` with that message. `semesterName` MUST be unique. Duplicate message: **"Semester name is already taken."**
- **FR-009**: `startDate` and `endDate` MUST be required. `endDate` MUST be after `startDate` (equal dates are invalid). Date-order message: **"End date must be after start date."** On the Semesters UI, an invalid date order MUST be blocked and MUST NOT send an API request. If the API receives `endDate` before or equal to `startDate`, it MUST return `400` with that message.
- **FR-010**: Unknown semesterId on PUT / DELETE MUST return 404 with message: **"Semester with id=<id> not found."**

---

## Assumptions

- Feature 1 auth (users with role of admin or student, authenticate, MenuBar) MUST be merged to dev before implementing this feature.
- A user with role `admin` exists for this feature (Feature 1 `role`; tests may seed an admin).
- Semesters are not owned by a signed-in user. Any authenticated user MAY `GET` the semester catalog. The **Semesters** manager UI is admin-only. Student enrollment UI is Feature 5.
- Semesters use **dialog-based** workflows (no split sidebar / main panel).
- API mount for this resource is `/api/…`. Use `/api/semesters`.

## Edge Cases

- Empty or whitespace-only required field → client block; **"Required"**; no API call.
- `semesterName` longer than 30 characters → **"Semester name must be 30 characters or fewer."**
- `endDate` before or equal to `startDate` → **"End date must be after start date."**
- Duplicate semesterName → `400` with `{ "message": "Semester name is already taken." }`
- Unknown `semesterId` on PUT/DELETE → `404` (semester does not exist — not a per-user hide).
- Authenticated `student` (or any non-admin) on `POST` / `PUT` / `DELETE` → `403`.
- Authenticated `student` on `GET` → `200` with the shared catalog.
- Unauthenticated user on `/semesters` or `GET /api/semesters` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in admin can create, view, edit, and delete the shared semester catalog on one screen.
- **SC-003**: A signed-in student MAY `GET` the semesters catalog; they cannot open the semesters manager and cannot mutate semesters via the API.
- **SC-004**: `npm test` passes for semesters API and semesters view behavior.

---

## Data Ownership & Isolation

Semesters are a **shared catalog**. They are not owned by or assigned to a user. Only role `admin` may manage them. Any authenticated user MAY `GET` the catalog. Role `student` does not see the manager UI (enrollment is feature 5).

| Rule               | Requirement                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**     | `GET /api/semesters` returns **all** semesters to any authenticated user.                                                |
| **Write scope**    | `POST`, `PUT`, and `DELETE` are allowed only when `req.user.role` is `admin`.                                            |
| **Create scope**   | New semesters have no owner. Do not persist `userId`. Ignore `userId` if sent in the body.                                 |
| **Missing semester** | Unknown `semesterId` → `404` with `{ "message": "Semester with id=<id> not found." }`. Never use ownership `404` to hide rows. |
| **Non-admin**      | Authenticated non-admin `GET` → `200`. `POST` / `PUT` / `DELETE` → `403` with `{ "message": "Admin role required." }`.   |
| **UI scope**       | **Semesters** menu and `/semesters` are admin-only. Students do not see this manager.                                        |
| **Implementation** | Use `authenticate` on all endpoints. Use `requireAdmin` after `authenticate` on `POST`, `PUT`, and `DELETE` only.        |

---

## API Requirements

| Method   | Endpoint                     | Auth       | Purpose                                 |
| -------- | ---------------------------- | ---------- | --------------------------------------- |
| `GET`    | `/api/semesters`           | Yes        | Fetch all semesters in the shared catalog |
| `POST`   | `/api/semesters`           | Yes, admin | Create a semester in the shared catalog   |
| `PUT`    | `/api/semesters/:semesterId` | Yes, admin | Update a semester                         |
| `DELETE` | `/api/semesters/:semesterId` | Yes, admin | Delete a semester                         |

**Create semester request body:**

```json
{
  "semesterName": "2026 Fall",
  "startDate": "2026-08-15",
  "endDate": "2026-12-15"
}
```

Do not send `id` or `userId` on create. If `userId` is present, ignore it.

**Update semester request body:** same fields as create (no `id` / `userId`).

**Semester success response** (`200` / `201`):

```json
{
  "id": 1,
  "semesterName": "2026 Fall",
  "startDate": "2026-08-15",
  "endDate": "2026-12-15",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** unknown `semesterId` → `404` with `{ "message": "Semester with id=<id> not found." }`. Non-admin writes still use `403` (FR-003).

---

## Screen Requirements

### [View: Semesters] — route name `semesters` — path `/semesters` — `Semesters.vue`

- Heading: **Semesters**
- Primary action: **+ New semester** (`oc-cta`) opens the **Add Semester** `<v-dialog>`.
- **Add Semester** fields (same set on **Edit Semester**, edit pre-filled):
  - **Semester Name** (`v-text-field`)
  - **Start Date** (`v-date-picker`)
  - **End Date** (`v-date-picker`)
- **Add Semester** actions: **Create** (`oc-cta`) / **Cancel** (secondary `variant="text"` or `outlined`).
- List: `v-table` (or `v-list`); columns **semester name**, **start date**, and **end date**; rows ordered by start date (FR-006). No Items/sections icon in this feature.
- Icon-only row actions use `size="small"` and accessible `aria-label`s:
  - **Edit semester** — opens **Edit Semester** `<v-dialog>` pre-filled with current data; **Save Semester** (`oc-cta`) / **Cancel** (secondary)
  - **Delete semester** — opens **Delete Semester** confirmation `<v-dialog>` with copy **"Delete this semester?"**; **Delete Semester** (`oc-cta`) / **Cancel** (secondary)
- Client-side validation: required fields use inline rules (`"Required"`); invalid submit does not send an API request.
- **Empty state:** **"No semesters yet. Create your first semester."** when the shared catalog has no semesters.
- **Loading state:** skeleton or progress indicator while semesters are fetching.
- **Error state:** `<v-alert type="error">` for API failures.
- Admin-only: **Semesters** menu item and `/semesters` are for signed-in admin users. Other roles do not see the **Semesters** item. Unauthenticated navigation to `/semesters` redirects to `login`.
- Semester CRUD dialogs live in `Semesters.vue` (or child presentational dialogs). No sidebar/main split.

**App chrome**

- Use the `MenuBar` introduced in [Feature 1](feature-1-user-auth.md). Do **not** create a second `MenuBar`. Do **not** hide it on `login` / `register`.
- Add **Semesters** (allowed role `admin`; navigates to `/semesters`) to `MenuBar`. Keep name and **Sign out** from Feature 1.
- Students MUST NOT see **Semesters** (`user.role` is not `admin`).
- After login, the user remains on Feature 1 `home`. US-2.1 is selecting **Semesters** in the menu.

---

## Key Entities

- **Semester**: shared catalog row (semester name, start date, end date). Not owned by a user. Admins manage it in this feature. Sections are scheduled in a semester (Feature 4), and students select a semester when enrolling (Feature 5).

---

## Data Model Requirements

### `semesters` table

| Field       | Type       | Rules                                              |
| ----------- | ---------- | -------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                     |
| `semesterName`      | STRING(30) | Required; trimmed; at most 30 characters           |
| `startDate` | DATE       | Required                                           |
| `endDate`   | DATE       | Required; must be after `startDate`                |               |
| `createdAt` | DATETIME       | Sequelize timestamps                               
| `updatedAt` | DATETIME       | Sequelize timestamps                               |

Unique index on (`semesterName`).  

### Associations (in `models/index.js`)

- None in this feature. Feature 4 adds Section belongsTo Semester / Semester hasMany Section.

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Select to work with Semesters

#### Scenario: Menu Selection

- **Given** I am signed in as a user with role `admin`
- **When** I click **Semesters** in Menu Bar
- **Then** the semesters view is displayed

### US-2.2 — Create semester

#### Scenario: User creates a new semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall`, start date `2026-08-15`, and end date `2026-12-15`
- **And** I click **Create**
- **Then** the API returns `201` with a semester object containing `id`, `semesterName` `2026 Fall`, `startDate`, and `endDate`
- **And** `2026 Fall` appears in the semesters view list
- **And** the add-semester dialog closes

#### Scenario: User creates a semester with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I leave a required field empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: User creates a semester with a name that is too long

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall Extended Summer Session` with valid start and end dates
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Semester name must be 30 characters or fewer."**

#### Scenario: User creates a semester with end date before start date

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall`, start date `2026-12-15`, and end date `2026-08-15`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"End date must be after start date."**

#### Scenario: User creates a semester with a duplicate name

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall` with valid start and end dates
- **And** I click **Create**
- **Then** the API returns `400` with `{ "message": "Semester name is already taken." }`
- **And** no second semester named `2026 Fall` is stored

---

### US-2.3 — View semesters

#### Scenario: Semesters view loads with existing semesters

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** semesters exist
- **When** I view the semesters list
- **Then** all the semesters are displayed in the list ordered by start date

#### Scenario: There are no semesters

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** there are no semesters
- **When** I view the semesters list
- **Then** I see **"No semesters yet. Create your first semester."**

---

### US-2.4 — Manage semester rows

#### Scenario: semester rows show edit and delete actions

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I view a semester row
- **Then** the semester row shows an **Edit semester** icon action
- **And** the semester row shows a **Delete semester** icon action

---

### US-2.5 — Edit a semester

#### Scenario: User selects to edit a semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click the edit icon on a semester row
- **Then** the semester edit dialog is displayed pre-filled with that semester's data

#### Scenario: User edits a semester with valid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** the semester edit dialog is displayed
- **When** I update values in the fields with valid values
- **And** I click **Save Semester**
- **Then** the semester data is updated
- **And** the dialog is closed

#### Scenario: User edits a semester with invalid values and saves

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** the semester edit dialog is displayed
- **When** I update values in the fields with invalid values
- **And** I click **Save Semester**
- **Then** the appropriate error messages are shown
- **And** the dialog is not closed

#### Scenario: User edits a semester and cancels

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** the semester edit dialog is displayed
- **When** I update values in the fields
- **And** I click **Cancel**
- **Then** the semester data is not updated
- **And** the dialog is closed

---

### US-2.6 — Delete a semester

#### Scenario: User selects to delete a semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click the delete icon on a semester row
- **Then** the semester delete dialog is displayed

#### Scenario: User deletes a semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** the semester delete dialog is displayed
- **When** I click **Delete Semester**
- **Then** the semester is deleted
- **And** the dialog is closed
- **And** the semester list is displayed and the semester is not in the list

#### Scenario: User cancels deleting a semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** the semester delete dialog is displayed
- **When** I click **Cancel**
- **Then** the semester is not deleted
- **And** the dialog is closed
- **And** the semester list is displayed and the semester is in the list

---

### US-2.7 — Restrict semester management to admins

#### Scenario: Student does not see Semesters in the menu

- **Given** I am signed in as a user with role `student`
- **When** I view the `MenuBar`
- **Then** **Semesters** is not shown

#### Scenario: Student can list semesters via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/semesters`
- **Then** the API returns `200` with an array of semester objects

#### Scenario: Student cannot create a semester via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/semesters` with a valid semester body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new semester is stored

#### Scenario: Unauthenticated API request to semesters

- **Given** I have no valid session token
- **When** I request `GET /api/semesters`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to semesters

- **Given** I have no session in `localStorage`
- **When** I navigate to `/semesters`
- **Then** I am redirected to the login page

---

## Test Coverage Map

| Story  | Scenario                                                | Test file                                                         | Test name                                                 |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| US-2.1 | Menu Selection                                          | `frontend/tests/MenuBar.test.js`, `frontend/tests/Semesters.test.js` | `Menu Selection`                                          |
| US-2.2 | User creates a new semester                               | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `User creates a new semester`                               |
| US-2.2 | User creates a semester with a missing required field     | `frontend/tests/Semesters.test.js`                                  | `User creates a semester with a missing required field`     |
| US-2.2 | User creates a semester with a name that is too long      | `frontend/tests/Semesters.test.js`                                  | `User creates a semester with a name that is too long`      |
| US-2.2 | User creates a semester with end date before start date   | `frontend/tests/Semesters.test.js`                                  | `User creates a semester with end date before start date`   |
| US-2.2 | User creates a semester with a duplicate name             | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `User creates a semester with a duplicate name`             |         
| US-2.3 | Semesters view loads with existing semesters                | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `Semesters view loads with existing semesters`                |
| US-2.3 | There are no semesters                                     | `frontend/tests/Semesters.test.js`                                  | `There are no semesters`                                     |
| US-2.4 | semester rows show edit and delete actions                | `frontend/tests/Semesters.test.js`                                  | `semester rows show edit and delete actions`                |
| US-2.5 | User selects to edit a semester                           | `frontend/tests/Semesters.test.js`                                  | `User selects to edit a semester`                           |
| US-2.5 | User edits a semester with valid values and saves         | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `User edits a semester with valid values and saves`         |
| US-2.5 | User edits a semester with invalid values and saves       | `frontend/tests/Semesters.test.js`                                  | `User edits a semester with invalid values and saves`       |
| US-2.5 | User edits a semester and cancels                         | `frontend/tests/Semesters.test.js`                                  | `User edits a semester and cancels`                         |
| US-2.6 | User selects to delete a semester                         | `frontend/tests/Semesters.test.js`                                  | `User selects to delete a semester`                         |
| US-2.6 | User deletes a semester                                   | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `User deletes a semester`                                   |
| US-2.6 | User cancels deleting a semester                          | `frontend/tests/Semesters.test.js`                                  | `User cancels deleting a semester`                          |
| US-2.7 | Student does not see Semesters in the menu                | `frontend/tests/MenuBar.test.js`                                  | `Student does not see Semesters in the menu`                |
| US-2.7 | Student can list semesters via the API                    | `backend/tests/semesters.test.js`                                   | `Student can list semesters via the API`                    |
| US-2.7 | Student cannot create a semester via the API              | `backend/tests/semesters.test.js`                                   | `Student cannot create a semester via the API`              |
| US-2.7 | Unauthenticated API request to semesters                  | `backend/tests/semesters.test.js`                                   | `Unauthenticated API request to semesters`                  |
| US-2.7 | Unauthenticated user navigates to semesters               | `frontend/tests/router.test.js`                                   | `Unauthenticated user navigates to semesters`               |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 2 from @features/feature-2-semester-management.md on branch `feature/2-semester-management`.

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

- Student-facing semester catalog UI (API `GET` is in this feature)
- Student enrollment in semesters (Feature 5)
- Sections and their link to semesters (Feature 4)
- Courses catalog (Feature 3)
- Non-admin semester management UI
- Creating `MenuBar` (introduced in [Feature 1](feature-1-user-auth.md); this feature only adds **Semesters** for role `admin`)

---

## Delivered to Feature 3, 4, and 5

- `MenuBar` is Feature 1 chrome; Feature 2 added **Semesters** for `admin`. Later features add their own items (e.g. Courses, Sections) and MUST NOT create a second MenuBar.
- Feature 4 MUST reject `DELETE /api/semesters/:semesterId` with `400` and `{ "message": "Cannot delete semester: sections still exist." }` when sections still reference that semester. Do not cascade-delete sections.
- Feature 5 uses `GET /api/semesters` so a student can select a semester before choosing sections to enroll in.

---
