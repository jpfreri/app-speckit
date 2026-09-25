# Feature: Section Management

**Feature ID:** 5
**Branch pattern:** `feature/5-student-enrollment`
**Status:** Draft
**Created:** 2026-09-23
**Input:** Signed-in users manage a owned enrollment catalog on one screen; new enrollments are added via a dialog. a required section (Feature 4) , a required course (Feature 3), a required semester (Feature 2), start date, and end date.
**Depends on:** [Feature 1 — User Authentication](feature-1-user-auth.md); [Feature 2 — Semester Management](feature-2-semester-management.md); [Feature 3 — Course Management](feature-3-course-management); [Feature 4 - Section Management](feature-4-section-management)

---

## User Stories

### US-2.1: Select to Enroll in classes

**As a** signed-in user  
**I want to** open the class enrollment view from the menu  
**So that** I can manage enrollment in classes

**Priority:** P1  
**Independent test:** login, view enrollment on menubar; enrollment view appears
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: Add an enrollment for student

**As a** signed-in user  
**I want to** Add an enrollmet for student
**So that** student can add enrollments

**Priority:** P1  
**Independent test:** Open enrollment dialog, add a enrollmet; it appears in the enrollment view  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: View Enrollments

**As a** signed-in user  
**I want to** see all added enrollments on one screen  
**So that** I can see the current enrollments

**Priority:** P1  
**Independent test:** Selecting Enrollment loads a screen that displays all current enrollments 
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Manage added enrollments

**As a** signed-in user  
**I want** each added enrollment to show **edit** and **delete** actions  
**So that** I can manage enrollment without leaving the enrollment view

**Priority:** P1  
**Independent test:** Each enrollment exposes add/edit and delete icon actions  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Edit a enrollment

**As a** signed-in user  
**I want to** edit an enrollment 
**So that** I can change parts of an enrollment

**Priority:** P2  
**Independent test:** Edit a enrollment from row actions; enrollment view updates  
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

### US-2.6: Delete a enrollment

**As a** signed-in user  
**I want to** delete a enrollment
**So that** I can unenroll from classes

**Priority:** P2  
**Independent test:** Delete a class from semester; enrollment view updates  
**Acceptance scenarios:** see ### US-2.6 under Acceptance Criteria

### US-2.7: Restrict enrollment management to each user

**As the** signed-in user  
**I want to** only be able to view, add, or delete my own enrollments
**So that** users cannot create, edit, or delete other enrollments

**Priority:** P1  
**Independent test:** Sign in as a student — **Enrollment** only shows signed-in user's enrollments
**Acceptance scenarios:** see ### US-2.8 under Acceptance Criteria

## Requirements

### Functional Requirements

- **FR-001**: All enrollment endpoints MUST require a valid session (`authenticate`). `GET` MUST be allowed for any authenticated role. `POST`, `PUT`, and `DELETE` MUST require `req.user.role` equal to `admin`.
- **FR-002**: Enrollments MUST belong to the authenticated student. The API MUST associate the enrollment with the `userId` of the logged-in student derived from the session `req.user.id`, and MUST ignore or overwrite any client-supplied `userId`.
- **FR-003**: Enrollment fields (`sectionId`) MUST be present and valid. On the Enrollment UI, empty selections MUST be blocked with **Required** and MUST NOT send an API request. If the API receives missing required fields, it MUST return `400`.
- **FR-004**: Unauthenticated enrollment API requests MUST return `401`. Unauthenticated navigation to `/enrollment` MUST redirect to `login`.
- **FR-005**: Enrolled courses MUST be ordered chronologically by section start date or section time in API responses and in the student's enrollment view.
- **FR-007**: This feature MUST deliver student class registration and enrollment management in `Enrollments.vue` (viewing available sections, enrolling, and dropping classes). No sidebar/main split.
- **FR-008**: `sectionName` MUST be required, trimmed, and at most 30 characters. Too-long message: **"Section name must be 30 characters or fewer."** On the Sections UI, a too-long name MUST be blocked and MUST NOT send an API request. If the API receives a too-long `sectionName`, it MUST return `400` with that message. `sectionName` MUST be unique. Duplicate message: **"Section name is already taken."**
- **FR-008**: A student MUST NOT be allowed to enroll in the same section or course more than once. Duplicate enrollment message: **"You are already enrolled in this course section."** On the UI, duplicate enrollment MUST be blocked or disabled and MUST NOT send an API request. If the API receives a duplicate request, it MUST return `400` with that message.
- **FR-009**: `sectionId` MUST be required on create (POST /api/enrollments). It MUST reference an existing row in the `sections` table. On the UI, missing section selection MUST be blocked with ****"Required"** and MUST NOT send an API request. If the API receives an invalid or missing sectionId, it MUST return `400`. If the section does not exist, it MUST return `400` with `{ "message": "Section with id=<id> not found." }`.

---

## Assumptions

- Feature 1 auth (users with role of admin or student, authenticate, MenuBar) MUST be merged to dev before implementing this feature.
- Feature 2 semester catalog (`semesters` table, `GET /api/semesters`) MUST be merged to dev before implementing this feature. Tests may seed at least one semester.
- Feature 3 course catalog (`courses` table, `GET /api/courses`) MUST be merged to dev before implementing this feature. Tests may seed at least one course.
- Feature 4 section catalog (`courses` table, `GET /api/courses`) MUST be merged to dev before implementing this feature. Tests may seed at least one course.
- A user exists for this feature (Feature 1 `role`; tests may seed a user).
- Sections are not owned by a signed-in user. Any authenticated user MAY `GET` the section catalog. The 
- Sections use **dialog-based** workflows (no split sidebar / main panel).
- API mount for this resource is `/api/…`. Use `/api/enrollment`.

## Edge Cases

- Empty or whitespace-only required field (including missing semester or course) → client block; **"Required"**; no API call.
- `sectionName` longer than 30 characters → **"Section name must be 30 characters or fewer."**
- Enrolling in a section the student is already enrolled in → client-side block/disable button; API returns `400` with {**"You are already enrolled in this course section."** }.
- `endDate` before or equal to `startDate` → **"End date must be after start date."**
- Unknown `sectionId` on enrollment creation (POST /api/enrollments) → `400` with { **"message": "Section with id=<id> not found."** }.
- Unknown `enrollmentId` on drop (DELETE /api/enrollments/:id) → `404` with { ****"message": "Enrollment record with id=<id> not found."** }.
- Authenticated `student` (or any non-admin) on `POST` / `PUT` / `DELETE` → `403`.
Authenticated `student` on `GET` `/api/enrollments` → `200` returning only the enrollments associated with `req.user.id`.
- Unauthenticated user on `/enrollment` or `GET /api/enrollment` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A signed-in user can create semeesters, view, edit, and delete their enrollments on one screen.
- **SC-003**: A signed-in student MAY `GET` the their enrollments; they cannot open the sections manager and cannot mutate sections via the API.
- **SC-004**: `npm test` passes for sections API and sections view behavior.

---

## Data Ownership & Isolation

Sections are a **user-owned**. They are owned by or assigned to a user. Any authenticated `user` MAY `GET` their own enrollments.

| Rule               | Requirement                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**     | `GET /api/enrollments` returns only the enrollments belonging to the authenticated `user` (`req.user.id`).  user.                                                |
| **Write scope**    | `POST`, `PUT`, and `DELETE` are allowed only when `user` is authenticated                                       |
| **Create scope**   | New enrollments MUST be explicitly bound to the logged-in user. Do not persist `userId`. Ignore `userId` if sent in the                  body.                                 |
| **Missing section** | Unknown `sectionId` → `404` with `{ "message": "Section with id=<id> not found." }`. Never use ownership `404` to hide rows. |
| **UI scope**       | **Enrollment** menu and `/enrollment` are seen by all authenticated users                                       |
| **Implementation** | Use `authenticate` on all endpoints. Use `requireAdmin` after `authenticate` on `POST`, `PUT`, and `DELETE` only.        |

---

## API Requirements

| Method   | Endpoint                     | Auth       | Purpose                                 |
| -------- | ---------------------------- | ---------- | --------------------------------------- |
| `GET`    | `/api/enrollment`           | Yes        | Fetch all enrollments for signed-in user|
| `POST`   | `/api/enrollment`           | Yes | Create a enrollment for the signed-in user   |
| `PUT`    | `/api/enrollment/:enrollmentId` | Yes | Update an enrollment                         |
| `DELETE` | `/api/enrollment/:enrollmentId` | Yes  | Delete an enrollment                        |

**Create enrollment request body:**

```json
{
  "sectionId": 1,
  "courseId": 1,
  "semesterId": 1,
}
```

Do not send `id` or `userId` on create. If `userId` is present, ignore it. `sectionId`, `courseId`, and `semesterId` are required and MUST reference an existing course and semester.

**Drop enrollment request body:** same fields as create (no `id` / `userId`).

**Enrollment success response** (`200` / `201`):

```json
{
  "id": 1,
  "sectionName": "01",
  "sectionId": 1,
  "courseId": 1,
  "semesterId": 1,
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** unknown `sectionId` → `404` with `{ "message": "Section with id=<id> not found." }`. Unknown `semesterId` or `courseId` on create/update → `400` 

---

## Screen Requirements

### [View: Sections] — route name `enrollment` — path `/enrollment` — `enrollment.vue`

- Heading: **Enrollment**
- Primary action: **Add Enrollment**  opens the **Add Enrollment** `<v-dialog>`.
- **Add Enrollment** fields (same set on **Edit Enrollment**, drop pre-filled):
  - **Semester** (`v-select`) — required; options loaded from the Feature 2 semester catalog (`GET /api/semesters`); on edit, pre-selected with the section's current semester. User MUST choose a semester when adding or editing a enrollment. 
  - **Course** (`v-select`) — required; options loaded from the Feature 3 course catalog (`GET /api/courses`); on edit, pre-selected with the enrollments's current course. User MUST choose a course when adding or editing a enrollment.
  - **Section** (`v-select`) — required; options loaded from the Feature 3 course catalog (`GET /api/Section`); on edit, pre-selected with the section's current section. User MUST choose a course when adding or editing a enrollment.
 

- **Add Enrollment** actions: **Create** (`oc-cta`) / **Cancel** (secondary `variant="text"` or `outlined`).
- List: `v-table` (or `v-list`); columns **section name**, **course**, **semester**, **start date**, and **end date**; rows ordered by start date (FR-005). No Items icon in this feature.
- Icon-only row actions use `size="small"` and accessible `aria-label`s:
  - **Edit Enrollment** — opens **Edit Enrollment** `<v-dialog>` pre-filled with current data; **Save Enrollment** (`oc-cta`) / **Cancel** (secondary)
  - **Delete Enrollment** — opens **Delete Enrollment** confirmation `<v-dialog>` with copy **"Delete this Enrollment?"**; **Delete Enrolment** (`oc-cta`) / **Cancel** (secondary)
- Client-side validation: required fields use inline rules (`"Required"`); invalid submit does not send an API request.
- **Empty state:** **"No enrollments yet. Add your first enrollment."** when the catalog has no enrollments.
- **Loading state:** skeleton or progress indicator while enrollments are fetching.
- **Error state:** `<v-alert type="error">` for API failures.
- Admin-only: **Enrollment** menu item and `/enrollment` are for signed-in users. Unauthenticated navigation to `/enrollment` redirects to `login`.
- Enrollment CRUD dialogs live in `enrollment.vue` (or child presentational dialogs). No sidebar/main split.

**App chrome**

- Use the `MenuBar` introduced in [Feature 1](feature-1-user-auth.md). Do **not** create a second `MenuBar`. Do **not** hide it on `login` / `register`.
- Add **Enrollment** (navigates to `/enrollment`) to `MenuBar`. Keep name and **Sign out** from Feature 1.
- After login, the user remains on Feature 1 `home`. US-2.1 is selecting **Enrollment** in the menu.

## Data Model Requirements

### `sections` table

| Field       | Type       | Rules                                              |
| ----------- | ---------- | -------------------------------------------------- |
| `id`        | INTEGER PK | Auto-increment                                     |
| `userId`    | INTEGER FK | Required; references `users.id` (Feature 1)        |
| `sectionId` | INTEGER FK | Required; references `sections.id` (Feature 4)     |
| `courseId`  | INTEGER FK | Required; references `courses.id` (Feature 3)      |
| `semesterId`| INTEGER FK | Required; references `semesters.id` (Feature 2)    |
| `startDate` | DATE       | Requiredl; references `sections.id` (Feature 4)    |
| `endDate`   | DATE       | Required; references `sections.id` (Feature 4)     |               
| `createdAt` | DATETIME       | Sequelize timestamps                           |    
| `updatedAt` | DATETIME       | Sequelize timestamps                           |   

Unique composite index on (`userId`, `sectionId`).  

### Associations (in `models/index.js`)

- Enrollment belongsTo User (`userId`). User hasMany Enrollment.
- Enrollment belongsTo Section (`sectionId`). Section hasMany Enrollment.



---

## Acceptance Criteria (Gherkin)

### US-2.1 — Select to work with Sections

#### Scenario: Menu Selection

- **Given** I am a signed in user 
- **When** I click **Enrollment** in Menu Bar
- **Then** the Enrollment view is displayed

### US-2.2 — Create Enrollment

#### Scenario: User creates a new enrollment

- **Given** I am signed in as a user
- **And** a semester named `2026 Fall` already exists
- **And** a course named `CMSC-1234` already exists
- **And**  a section named `01` already exists
- **And** I am viewing the enrollment view
- **When** I click **+ New enrollment**
- **And** I select section name `01`, select course `CMSC-1234`, select semester `2026 Fall`
- **And** I click **Create**
- **Then** the API returns `201` with a section object containing `id`, `sectionName` `01`, `courseId`, `semesterId`, `startDate`, and `endDate`
- **And** `id` appears in the enrollment view list with section `01`course `CMSC-1234` and semester `2026 Fall`
- **And** the add-section dialog closes

#### Scenario: User creates a enrollment with a missing required field

- **Given** I am signed in as a user 
- **And** I am viewing the enrollment view
- **When** I click **New Enrollment**
- **And** I leave a required field empty (including section course or semester)
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

---

### US-2.3 — View Enrollment

#### Scenario: Enrollment view loads with existing enrollments

- **Given** I am signed in as a user 
- **And** I am viewing the enrollment view
- **And** enrollments exist
- **When** I view the enrollment list
- **Then** all the enrollments are displayed in the list ordered by start date

#### Scenario: There are no enrollments

- **Given** I am signed in as a user 
- **And** I am viewing the enrollment view
- **And** there are no enrollments
- **When** I view the enrollment list
- **Then** I see **"No enrollments yet. Create your first enrollment."**

---

### US-2.4 — Manage enrollment rows

#### Scenario: enrollment rows show edit and delete actions

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **When** I view a enrollment row
- **Then** the enrollment row shows an **Edit enrollment** icon action
- **And** the enrollment row shows a **Delete enrollment** icon action

---

### US-2.5 — Edit a enrollment

#### Scenario: User selects to edit a enrollment

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **When** I click the edit icon on a enrollment row
- **Then** the enrollment edit dialog is displayed pre-filled with that enrollment's data

#### Scenario: User edits a enrollment with valid values and saves

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **And** the enrollment edit dialog is displayed
- **When** I update values in the fields with valid values
- **And** I click **Save Enrollment**
- **Then** the enrollment data is updated
- **And** the dialog is closed

#### Scenario: User edits a enrollment with invalid values and saves

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **And** the enrollment edit dialog is displayed
- **When** I update values in the fields with invalid values
- **And** I click **Save Enrollment**
- **Then** the appropriate error messages are shown
- **And** the dialog is not closed

#### Scenario: User edits a enrollment and cancels

- **Given** I am signed in as a user 
- **And** I am viewing the enrollmentview
- **And** the enrollment edit dialog is displayed
- **When** I update values in the fields
- **And** I click **Cancel**
- **Then** the enrollment data is not updated
- **And** the dialog is closed

---

### US-2.6 — Delete a enrollment

#### Scenario: User selects to delete a enrollment

- **Given** I am signed in as a user`
- **And** I am viewing the enrollment view
- **When** I click the delete icon on a enrollment row
- **Then** the enrollment delete dialog is displayed

#### Scenario: User deletes a enrollment

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **And** the enrollment delete dialog is displayed
- **When** I click **Delete Enrollment**
- **Then** the enrollment is deleted
- **And** the dialog is closed
- **And** the enrollment list is displayed and the enrollment is not in the list

#### Scenario: User cancels deleting a enrollment

- **Given** I am signed in as a user
- **And** I am viewing the enrollment view
- **And** the enrollment delete dialog is displayed
- **When** I click **Cancel**
- **Then** the enrollment is not deleted
- **And** the dialog is closed
- **And** the enrollment list is displayed and the enrollment is in the list

--- 

#### Scenario: Unauthenticated API request to enrollment

- **Given** I have no valid session token
- **When** I request `GET /api/enrollment`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to sections

- **Given** I have no session in `localStorage`
- **When** I navigate to `/enrollment`
- **Then** I am redirected to the login page

---

## Test Coverage Map

| Story  | Scenario                                                | Test file                                                         | Test name                                                 |
| ------ | ------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
---

## Test Coverage Map

| Story | Scenario | Test file | Test name |
| --- | --- | --- | --- |
| US-2.1 | Menu Selection for Course Registration | `frontend/tests/MenuBar.test.js`, `frontend/tests/Enrollments.test.js` | `Menu Selection for Course Registration` |
| US-2.2 | Student enrolls in a course section | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student enrolls in a course section` |
| US-2.2 | Student attempts enrollment without selecting a section | `frontend/tests/Enrollments.test.js` | `Student attempts enrollment without selecting a section` |
| US-2.2 | Student attempts to enroll in a course section already enrolled in | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student attempts to enroll in a course section already enrolled in` |
| US-2.2 | Student attempts to enroll in a full section | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student attempts to enroll in a full section` |
| US-2.2 | Student attempts to enroll in a section with a time conflict | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student attempts to enroll in a section with a time conflict` |
| US-2.2 | Student attempts enrollment with an unknown sectionId | `backend/tests/enrollments.test.js` | `Student attempts enrollment with an unknown sectionId` |
| US-2.3 | Student views current enrollments | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student views current enrollments` |
| US-2.3 | Student has no active enrollments | `frontend/tests/Enrollments.test.js` | `Student has no active enrollments` |
| US-2.4 | Enrollment rows show drop/cancel action | `frontend/tests/Enrollments.test.js` | `Enrollment rows show drop/cancel action` |
| US-2.5 | Student selects to drop a class | `frontend/tests/Enrollments.test.js` | `Student selects to drop a class` |
| US-2.5 | Student drops an enrolled course section | `backend/tests/enrollments.test.js`, `frontend/tests/Enrollments.test.js` | `Student drops an enrolled course section` |
| US-2.5 | Student cancels dropping a section | `frontend/tests/Enrollments.test.js` | `Student cancels dropping a section` |
| US-2.5 | Student attempts to drop an unknown enrollment record | `backend/tests/enrollments.test.js` | `Student attempts to drop an unknown enrollment record` |
| US-2.6 | Admin / Non-student does not see Course Registration in the menu | `frontend/tests/MenuBar.test.js` | `Admin / Non-student does not see Course Registration in the menu` |
| US-2.6 | Non-student role attempts enrollment endpoint | `backend/tests/enrollments.test.js` | `Non-student role attempts enrollment endpoint` |
| US-2.6 | Unauthenticated API request to enrollments | `backend/tests/enrollments.test.js` | `Unauthenticated API request to enrollments` |
| US-2.6 | Unauthenticated user navigates to enrollments | `frontend/tests/router.test.js` | `Unauthenticated user navigates to enrollments` |
---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 5 from @features/feature-5-student-enrollment on branch `feature/5-student-enrollment`.

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
- Creating or editing courses (Feature 3) or semesters (Feature 2) or sections (Feature 5)
- Creating `MenuBar` (introduced in [Feature 1](feature-1-user-auth.md); this feature only adds **Enrollment**)

---
