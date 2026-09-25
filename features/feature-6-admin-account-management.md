# Feature: Admin Account Management

**Feature ID:** 6
**Branch pattern:** `feature/6-admin-account-management`
**Status:** Ready
**Created:** 2026-09-25
**Input:** Admin can add semesters, courses and sections, faculty and students
**Depends on:** [Feature 1 — User Authentication & Session Management](feature-1-user-auth-session-management.md)
**Related:** [Feature 2 — Semester Management](feature-2-semester-management.md)

---

## User Stories

### US-6.1: Open admin setup from the menu

**As a** signed-in admin  
**I want** the `MenuBar` to include **Semesters**, **Courses**, **Sections**, **Faculty**, and **Students**  
**So that** I can open each setup screen and add records

**Priority:** P1  
**Independent test:** Sign in as `admin` and confirm each of the five items opens its screen; sign in as `student` and confirm none of them appear  
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Add a semester

**As a** signed-in admin  
**I want to** add a semester with a name, start date, and end date  
**So that** sections can be scheduled in an academic term

**Priority:** P1  
**Independent test:** Add semester `2026 Fall` (`2026-08-15` through `2026-12-15`) and see it in the semesters list  
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: Add a course

**As a** signed-in admin  
**I want to** add a course with a code and name  
**So that** sections can be offered for that course

**Priority:** P1  
**Independent test:** Add course `CS101` / `Intro to Programming` and see it in the courses list  
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Add a section

**As a** signed-in admin  
**I want to** add a section for a course in a semester, taught by a faculty member  
**So that** students have a concrete class offering to enroll in later

**Priority:** P1  
**Independent test:** With a semester, course, and faculty member already stored, add section `001` and see it in the sections list  
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Add a faculty account

**As a** signed-in admin  
**I want to** add a faculty account with name, email, username, and password  
**So that** that person can sign in as faculty and be assigned to a section

**Priority:** P1  
**Independent test:** Add faculty user `jlee` and see them in the faculty list with role `faculty` and no password in the response  
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

### US-6.6: Add a student account

**As a** signed-in admin  
**I want to** add a student account with name, email, username, and password  
**So that** that person can sign in as a student

**Priority:** P1  
**Independent test:** Add student user `jstudent` and see them in the student list with role `student`  
**Acceptance scenarios:** see ### US-6.6 under Acceptance Criteria

### US-6.7: Restrict adds to admins

**As the** application  
**I want to** allow only role `admin` to add semesters, courses, sections, faculty, and students  
**So that** other roles cannot change the catalog or create accounts

**Priority:** P1  
**Independent test:** As `student`, the five menu items are hidden, each create endpoint returns `403`, and opening `/courses` redirects home  
**Acceptance scenarios:** see ### US-6.7 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: Every endpoint in this feature MUST require a valid session (`authenticate`). Missing or invalid tokens MUST return `401`.
- **FR-002**: `POST` for semesters, courses, sections, faculty, and students MUST require `req.user.role` equal to `admin`. Any other authenticated role MUST receive `403` with `{ "message": "Admin role required." }` and MUST NOT persist a row.
- **FR-003**: Semesters, courses, and sections MUST be a **shared catalog**. Their tables MUST NOT include `userId`. The API MUST ignore any client-supplied `userId`.
- **FR-004**: `GET /api/semesters`, `GET /api/courses`, and `GET /api/sections` MUST return `200` for any authenticated role. `GET /api/faculty` and `GET /api/students` MUST return `200` only for `admin` and `403` with `{ "message": "Admin role required." }` for every other authenticated role.
- **FR-005**: This feature MUST add records only. It MUST NOT implement edit or delete for semesters, courses, sections, faculty, or students, and those screens MUST NOT show edit or delete actions.
- **FR-006**: Required text fields MUST be trimmed. Whitespace-only values MUST be treated as empty. On each add dialog, an empty required field MUST be blocked with the field message in Screen Requirements and MUST NOT send an API request. If the API receives an empty required field, it MUST return `400` with `{ "message": "Required fields are missing." }`.
- **FR-007**: `semesterName` MUST be required and at most 30 characters. Too-long message: **"Semester name must be 30 characters or fewer."** Duplicate `semesterName` MUST return `400` with `{ "message": "Semester name is already taken." }`. `startDate` and `endDate` MUST be required, and `endDate` MUST be after `startDate`. Date-order message: **"End date must be after start date."** Client-side failures MUST NOT send an API request. The same messages apply when the API rejects the body with `400`.
- **FR-008**: Semesters in `GET /api/semesters` and on the semesters screen MUST be ordered by `startDate` ascending.
- **FR-009**: `courseCode` MUST be required, trimmed, stored uppercase, and at most 10 characters. Too-long message: **"Course code must be 10 characters or fewer."** `courseName` MUST be required, trimmed, and at most 100 characters. Too-long message: **"Course name must be 100 characters or fewer."** Duplicate `courseCode` (case-insensitive) MUST return `400` with `{ "message": "Course code is already taken." }`. Courses MUST be ordered by `courseCode` ascending.
- **FR-010**: A section MUST reference an existing course, an existing semester, and an existing user whose `role` is `faculty`. `sectionNumber` MUST be required, trimmed, and at most 3 characters. Too-long message: **"Section number must be 3 characters or fewer."** Unknown `courseId` MUST return `400` with `{ "message": "Course not found." }`. Unknown `semesterId` MUST return `400` with `{ "message": "Semester not found." }`. A missing user, or a user whose role is not `faculty`, MUST return `400` with `{ "message": "Faculty member not found." }`. The same `sectionNumber` for the same course and semester MUST return `400` with `{ "message": "Section number is already taken for this course and semester." }`.
- **FR-011**: Sections in `GET /api/sections` and on the sections screen MUST be ordered by `courseCode`, then semester `startDate`, then `sectionNumber`, all ascending.
- **FR-012**: Faculty and student accounts MUST be rows in `users`. `POST /api/faculty` MUST set `role` to `faculty`. `POST /api/students` MUST set `role` to `student`. A client-supplied `role` MUST be ignored. The response MUST NOT include `password`, `token`, or a password hash. The admin's session in `localStorage` key `user` MUST stay the admin.
- **FR-013**: Faculty and student passwords MUST be hashed with **bcrypt** (`SALT_ROUNDS = 10`) before persistence. Username MUST be stored lowercase. Email and username MUST be unique across all users. Duplicate username message: **"Username is already taken."** Duplicate email message: **"Email is already registered."** Uniqueness is case-insensitive for username.
- **FR-014**: Faculty and student dialogs MUST use the same email and password rules as Feature 1 registration: required email, regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` with **"Enter a valid email address."**, required username **"Username is required."**, required password **"Password is required."**, minimum 8 characters **"Password must be at least 8 characters."**, and confirm password **"Passwords do not match."** Empty first or last name MUST show **"First name is required."** or **"Last name is required."** Confirm password is client-only and MUST NOT be sent to the API.
- **FR-015**: Faculty list order MUST be `lName`, then `fName`. Student list order MUST be `lName`, then `fName`.
- **FR-016**: This feature MUST reuse the Feature 1 `MenuBar`. It MUST NOT create a second `MenuBar`. It MUST add **Semesters**, **Courses**, **Sections**, **Faculty**, and **Students** for role `admin` only. If Feature 2 already added **Semesters**, this feature MUST NOT add a second **Semesters** item.
- **FR-017**: Unauthenticated navigation to `/semesters`, `/courses`, `/sections`, `/faculty`, or `/students` MUST redirect to `login`. An authenticated user whose role is not `admin` MUST be redirected to `home` and MUST NOT see those five menu items.
- **FR-018**: The semester create contract MUST match [Feature 2](feature-2-semester-management.md): same `semesters` columns and the same `POST /api/semesters` body. This feature MUST NOT create a second semesters resource. Whichever feature is implemented first creates the table and the `GET`/`POST` routes; the other MUST reuse them.

---

## Assumptions

- Feature 1 is merged to `dev` before this feature is implemented: `users`, sessions, `authenticate`, and `MenuBar` exist. Tests may seed an `admin` user.
- Feature 1 public registration is unchanged. Admins provision faculty and student accounts here. Public registration MUST NOT be the way this feature creates those roles.
- Feature 2 (Draft) already specifies full semester CRUD, including add, on the same `semesters` table and `POST /api/semesters` body. This feature authorizes the admin **add** and list only. Semester edit and delete stay in Feature 2.
- Feature 2 names courses, sections, and enrollment as later work, and those feature files are not in this repo. This feature is the authorization to **add** courses and sections. Enrollment is out of scope.
- A section can be added only after at least one semester, one course, and one faculty account exist.
- API mount is `/api`.
- One shared catalog for the whole app. Records are not owned by the admin who created them.

## Edge Cases

- Empty or whitespace-only required field → client block; no API call. Bypassed API → `400` `{ "message": "Required fields are missing." }`.
- `semesterName` longer than 30 characters → **"Semester name must be 30 characters or fewer."**
- `endDate` before or equal to `startDate` → **"End date must be after start date."**
- Duplicate semester name → `400` `{ "message": "Semester name is already taken." }`.
- `courseCode` longer than 10 characters, or `courseName` longer than 100 → the too-long messages in FR-009.
- Duplicate course code, including different letter case → `400` `{ "message": "Course code is already taken." }`.
- Unknown course, semester, or non-faculty user on section create → `400` with the FR-010 message.
- Duplicate section number for the same course and semester → `400` `{ "message": "Section number is already taken for this course and semester." }`.
- Duplicate username or email, including username case differences → `400` with the FR-013 message.
- Body `role: "admin"` on faculty or student create → stored role is still `faculty` or `student`.
- Authenticated non-admin `POST` → `403`. Non-admin `GET` of faculty or students → `403`. Non-admin `GET` of semesters, courses, or sections → `200`.
- No session → API `401`; those routes redirect to `login`.
- Signed-in non-admin opens an admin route directly → redirect to `home`.

## Success Criteria

- **SC-001**: Every Gherkin scenario in this feature has at least one automated test before merge.
- **SC-002**: A signed-in admin can add one semester, one course, one faculty member, one section, and one student in a single manual pass and see each new row on its screen.
- **SC-003**: A signed-in student does not see the five setup items, cannot create any of the five resources, and cannot list faculty or student accounts.
- **SC-004**: `npm test` passes for the semester, course, section, faculty, and student API tests and the matching view, `MenuBar`, and router tests.

---

## Data Ownership & Isolation

Semesters, courses, and sections are a **shared catalog**. Faculty and students are accounts in `users`, not private rows owned by the admin who created them. Only role `admin` may add them. Any authenticated user may read the catalog. Only `admin` may list faculty and student accounts.

| Rule | Requirement |
| ---- | ----------- |
| **Read scope** | `GET /api/semesters`, `GET /api/courses`, and `GET /api/sections` return every row to any authenticated user. `GET /api/faculty` and `GET /api/students` return rows only when `req.user.role` is `admin`. |
| **Write scope** | `POST` on all five resources is allowed only when `req.user.role` is `admin`. |
| **Create scope** | New catalog rows have no owner. Do not persist `userId`. Ignore `userId` if sent. New people are `users` rows with `role` forced by the endpoint. |
| **Secrets** | Password hashes MUST NOT appear in list or create responses. These endpoints MUST NOT return a session `token`. |
| **Non-admin** | Catalog `GET` → `200`. People `GET` and every `POST` → `403` with `{ "message": "Admin role required." }`. |
| **UI scope** | The five menu items and their routes are admin-only. Other roles do not see the items. Direct navigation redirects to `home`. |
| **Implementation** | Use `authenticate` on every endpoint. Use `requireAdmin` after `authenticate` on every `POST`, and on `GET /api/faculty` and `GET /api/students`. |

---

## API Requirements

| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| `GET` | `/api/semesters` | Yes | List the shared semester catalog |
| `POST` | `/api/semesters` | Yes, admin | Add a semester |
| `GET` | `/api/courses` | Yes | List the shared course catalog |
| `POST` | `/api/courses` | Yes, admin | Add a course |
| `GET` | `/api/sections` | Yes | List sections with course, semester, and faculty display fields |
| `POST` | `/api/sections` | Yes, admin | Add a section |
| `GET` | `/api/faculty` | Yes, admin | List users whose role is `faculty` |
| `POST` | `/api/faculty` | Yes, admin | Add a faculty account |
| `GET` | `/api/students` | Yes, admin | List users whose role is `student` |
| `POST` | `/api/students` | Yes, admin | Add a student account |

There is no `PUT` or `DELETE` in this feature.

**Add semester request body** (same as Feature 2):

```json
{
  "semesterName": "2026 Fall",
  "startDate": "2026-08-15",
  "endDate": "2026-12-15"
}
```

**Add course request body:**

```json
{
  "courseCode": "CS101",
  "courseName": "Intro to Programming"
}
```

**Add section request body:**

```json
{
  "courseId": 1,
  "semesterId": 1,
  "sectionNumber": "001",
  "facultyId": 2
}
```

**Add faculty or student request body** (same fields; role comes from the route):

```json
{
  "fName": "Jordan",
  "lName": "Lee",
  "email": "jlee@example.com",
  "username": "jlee",
  "password": "password1"
}
```

Do not send `id`, `userId`, `role`, or `confirmPassword`. If `role` or `userId` is present, ignore it.

**Semester success** (`201` create, and each object in the `200` list):

```json
{
  "id": 1,
  "semesterName": "2026 Fall",
  "startDate": "2026-08-15",
  "endDate": "2026-12-15",
  "createdAt": "2026-09-25T12:00:00.000Z",
  "updatedAt": "2026-09-25T12:00:00.000Z"
}
```

**Course success:**

```json
{
  "id": 1,
  "courseCode": "CS101",
  "courseName": "Intro to Programming",
  "createdAt": "2026-09-25T12:00:00.000Z",
  "updatedAt": "2026-09-25T12:00:00.000Z"
}
```

`courseCode` in the response is uppercase even when the client sent `cs101`.

**Section success:**

```json
{
  "id": 1,
  "sectionNumber": "001",
  "courseId": 1,
  "courseCode": "CS101",
  "courseName": "Intro to Programming",
  "semesterId": 1,
  "semesterName": "2026 Fall",
  "facultyId": 2,
  "facultyName": "Jordan Lee",
  "createdAt": "2026-09-25T12:00:00.000Z",
  "updatedAt": "2026-09-25T12:00:00.000Z"
}
```

`facultyName` is `fName` + space + `lName`. It is not a stored column.

**Faculty or student success** (`password` and `token` omitted):

```json
{
  "id": 2,
  "fName": "Jordan",
  "lName": "Lee",
  "email": "jlee@example.com",
  "username": "jlee",
  "role": "faculty"
}
```

Student create uses the same shape with `"role": "student"`.

`GET` list endpoints return a JSON array of those objects (empty array when none exist). `POST` returns `201` and one object.

**Error response:** `{ "message": "Human-readable explanation." }` with the HTTP status named in the FRs.

---

## Screen Requirements

Shared behavior for every setup screen below:

- Admin-only route. Unauthenticated visitors redirect to `login`. Any other signed-in role redirects to `home`.
- Primary action uses `oc-cta` and `:loading` while the request is in flight. **Cancel** is secondary (`variant="text"` or `outlined`). Do not put labeled buttons inside `v-card-title`.
- Empty required fields use the messages in the FRs. Invalid submit does not send an API request.
- **Loading state:** skeleton or progress indicator while the list is fetching.
- **Error state:** `<v-alert type="error">` for API failures, including duplicate and not-found messages.
- No edit or delete controls.

### [View: Semesters] — route name `semesters` — path `/semesters` — `Semesters.vue`

- Heading: **Semesters**
- Primary action: **+ New semester** opens the **Add Semester** `<v-dialog>`.
- Fields: **Semester Name** (`v-text-field`), **Start Date** (`v-date-picker`), **End Date** (`v-date-picker`).
- Dialog actions: **Create** / **Cancel**.
- List: `v-table`; columns **semester name**, **start date**, **end date**; ordered by start date (FR-008).
- **Empty state:** **"No semesters yet. Create your first semester."** (same copy as Feature 2)

If Feature 2 already built this view with edit and delete, this feature MUST still be able to add a semester through **+ New semester**. It MUST NOT remove Feature 2 edit and delete when those already exist, and it MUST NOT add them when they do not.

### [View: Courses] — route name `courses` — path `/courses` — `Courses.vue`

- Heading: **Courses**
- Primary action: **+ New course** opens **Add Course**.
- Fields: **Course Code**, **Course Name**.
- Dialog actions: **Create** / **Cancel**.
- List columns: **course code**, **course name**; ordered by course code.
- **Empty state:** **"No courses yet. Add your first course."**

### [View: Sections] — route name `sections` — path `/sections` — `Sections.vue`

- Heading: **Sections**
- Primary action: **+ New section** opens **Add Section**.
- Fields:
  - **Course** (`v-select` of courses, item title `courseCode`)
  - **Semester** (`v-select` of semesters, item title `semesterName`)
  - **Section Number** (`v-text-field`)
  - **Faculty** (`v-select` of faculty, item title `fName` + space + `lName`)
- Dialog actions: **Create** / **Cancel**.
- List columns: **course code**, **semester name**, **section number**, **faculty name**.
- **Empty state:** **"No sections yet. Add your first section."**

### [View: Faculty] — route name `faculty` — path `/faculty` — `Faculty.vue`

- Heading: **Faculty**
- Primary action: **+ New faculty** opens **Add Faculty**.
- Fields: **First name**, **Last name**, **Email**, **Username**, **Password**, **Confirm password**.
- Email uses shared `emailRules` from `frontend/src/config/validation.js`.
- Dialog actions: **Create** / **Cancel**.
- List columns: **name** (`fName` + space + `lName`), **email**, **username**. No password column.
- **Empty state:** **"No faculty yet. Add your first faculty member."**

### [View: Students] — route name `students` — path `/students` — `Students.vue`

- Heading: **Students**
- Primary action: **+ New student** opens **Add Student**.
- Fields and validation match **Add Faculty**.
- Dialog actions: **Create** / **Cancel**.
- List columns: **name**, **email**, **username**. No password column.
- **Empty state:** **"No students yet. Add your first student."**

**App chrome**

- Use the `MenuBar` from [Feature 1](feature-1-user-auth-session-management.md). Do not create a second `MenuBar`. Do not hide it on `login` / `register`.
- Add these items for role `admin` only: **Semesters** → `/semesters`, **Courses** → `/courses`, **Sections** → `/sections`, **Faculty** → `/faculty`, **Students** → `/students`.
- Keep the signed-in user's name and **Sign out** from Feature 1.
- After login the user remains on Feature 1 `home`. Opening a setup screen is a menu selection.

---

## Key Entities

- **Semester**: shared catalog row (name, start date, end date). Not owned by a user. Admins add it here. Feature 2 also manages this catalog, including edit and delete.
- **Course**: shared catalog row (code, name). Not owned by a user. A course has many sections.
- **Section**: one offering of a course in a semester, taught by one faculty member.
- **Faculty**: a `users` row with role `faculty`. May teach sections.
- **Student**: a `users` row with role `student`. Created by an admin in this feature.

---

## Data Model Requirements

### `semesters` table

Same table as [Feature 2](feature-2-semester-management.md). Create it here only when Feature 2 has not already created it.

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `semesterName` | STRING(30) | Required; trimmed; at most 30 characters; unique |
| `startDate` | DATE | Required |
| `endDate` | DATE | Required; must be after `startDate` |
| `createdAt` | DATETIME | Sequelize timestamps |
| `updatedAt` | DATETIME | Sequelize timestamps |

Unique index on (`semesterName`). No `userId`.

### `courses` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `courseCode` | STRING(10) | Required; trimmed; stored uppercase; unique |
| `courseName` | STRING(100) | Required; trimmed |
| `createdAt` | DATETIME | Sequelize timestamps |
| `updatedAt` | DATETIME | Sequelize timestamps |

Unique index on (`courseCode`). No `userId`.

### `sections` table

| Field | Type | Rules |
| ----- | ---- | ----- |
| `id` | INTEGER PK | Auto-increment |
| `sectionNumber` | STRING(3) | Required; trimmed |
| `courseId` | INTEGER FK | Required; references `courses.id` |
| `semesterId` | INTEGER FK | Required; references `semesters.id` |
| `facultyId` | INTEGER FK | Required; references `users.id`; referenced user role must be `faculty` |
| `createdAt` | DATETIME | Sequelize timestamps |
| `updatedAt` | DATETIME | Sequelize timestamps |

Unique index on (`courseId`, `semesterId`, `sectionNumber`). No `userId` owner column. Do not cascade-delete courses, semesters, or users.

### `users` table

No new columns. This feature inserts rows using the Feature 1 `users` table. `POST /api/faculty` sets `role` to `faculty`. `POST /api/students` sets `role` to `student`. Password is bcrypt only. Username is stored lowercase.

### Associations (in `models/index.js`)

- Course hasMany Section; Section belongsTo Course.
- Semester hasMany Section; Section belongsTo Semester.
- User hasMany Section as faculty (`facultyId`); Section belongsTo User as faculty.

---

## Acceptance Criteria (Gherkin)

### US-6.1 — Open admin setup from the menu

#### Scenario: Admin sees setup items in MenuBar

- **Given** I am signed in as a user with role `admin`
- **When** I view the `MenuBar`
- **Then** **Semesters** is shown
- **And** **Courses** is shown
- **And** **Sections** is shown
- **And** **Faculty** is shown
- **And** **Students** is shown

#### Scenario: Admin opens Courses from the menu

- **Given** I am signed in as a user with role `admin`
- **When** I click **Courses** in the `MenuBar`
- **Then** the courses view is displayed

#### Scenario: Student does not see admin setup items

- **Given** I am signed in as a user with role `student`
- **When** I view the `MenuBar`
- **Then** **Semesters** is not shown
- **And** **Courses** is not shown
- **And** **Sections** is not shown
- **And** **Faculty** is not shown
- **And** **Students** is not shown

#### Scenario: Faculty does not see admin setup items

- **Given** I am signed in as a user with role `faculty`
- **When** I view the `MenuBar`
- **Then** **Semesters** is not shown
- **And** **Courses** is not shown
- **And** **Sections** is not shown
- **And** **Faculty** is not shown
- **And** **Students** is not shown

---

### US-6.2 — Add a semester

#### Scenario: Admin adds a semester

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall`, start date `2026-08-15`, and end date `2026-12-15`
- **And** I click **Create**
- **Then** the API returns `201` with `semesterName` `2026 Fall`, `startDate` `2026-08-15`, and `endDate` `2026-12-15`
- **And** the semester has no `userId`
- **And** `2026 Fall` appears in the semesters list
- **And** the add-semester dialog closes

#### Scenario: Admin adds a semester with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I leave semester name empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: Admin adds a semester with a name that is too long

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall Extended Summer Session` with valid start and end dates
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Semester name must be 30 characters or fewer."**

#### Scenario: Admin adds a semester with end date before start date

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **When** I click **+ New semester**
- **And** I enter semester name `2026 Fall`, start date `2026-12-15`, and end date `2026-08-15`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"End date must be after start date."**

#### Scenario: Admin adds a semester with a duplicate name

- **Given** I am signed in as a user with role `admin`
- **And** a semester named `2026 Fall` already exists
- **When** I send `POST /api/semesters` with semester name `2026 Fall` and valid dates
- **Then** the API returns `400` with `{ "message": "Semester name is already taken." }`
- **And** no second semester named `2026 Fall` is stored

#### Scenario: Semesters list is empty

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the semesters view
- **And** there are no semesters
- **When** I view the semesters list
- **Then** I see **"No semesters yet. Create your first semester."**

#### Scenario: Admin sees semesters ordered by start date

- **Given** I am signed in as a user with role `admin`
- **And** semester `2026 Fall` starts `2026-08-15`
- **And** semester `2026 Spring` starts `2026-01-10`
- **When** I view the semesters list
- **Then** `2026 Spring` appears before `2026 Fall`

---

### US-6.3 — Add a course

#### Scenario: Admin adds a course

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course code `cs101` and course name `Intro to Programming`
- **And** I click **Create**
- **Then** the API returns `201` with `courseCode` `CS101` and `courseName` `Intro to Programming`
- **And** `CS101` appears in the courses list
- **And** the add-course dialog closes

#### Scenario: Admin adds a course with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I leave course code empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: Admin adds a course with a code that is too long

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **When** I click **+ New course**
- **And** I enter course code `CS101EXTRA` and course name `Intro to Programming`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Course code must be 10 characters or fewer."**

#### Scenario: Admin adds a course with a duplicate code

- **Given** I am signed in as a user with role `admin`
- **And** a course with code `CS101` already exists
- **When** I send `POST /api/courses` with course code `cs101` and course name `Intro to Programming`
- **Then** the API returns `400` with `{ "message": "Course code is already taken." }`
- **And** no second course with code `CS101` is stored

#### Scenario: Courses list is empty

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the courses view
- **And** there are no courses
- **When** I view the courses list
- **Then** I see **"No courses yet. Add your first course."**

#### Scenario: Admin sees courses ordered by course code

- **Given** I am signed in as a user with role `admin`
- **And** courses `MATH200` and `CS101` exist
- **When** I view the courses list
- **Then** `CS101` appears before `MATH200`

---

### US-6.4 — Add a section

#### Scenario: Admin adds a section

- **Given** I am signed in as a user with role `admin`
- **And** semester `2026 Fall` exists
- **And** course `CS101` exists
- **And** faculty member `Jordan Lee` exists
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I select course `CS101`, semester `2026 Fall`, section number `001`, and faculty `Jordan Lee`
- **And** I click **Create**
- **Then** the API returns `201` with `sectionNumber` `001`, `courseCode` `CS101`, `semesterName` `2026 Fall`, and `facultyName` `Jordan Lee`
- **And** that section appears in the sections list
- **And** the add-section dialog closes

#### Scenario: Admin adds a section with a missing required field

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I leave section number empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Required"**

#### Scenario: Admin adds a section with a number that is too long

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **When** I click **+ New section**
- **And** I enter section number `0001` with a course, semester, and faculty selected
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Section number must be 3 characters or fewer."**

#### Scenario: Admin adds a section for an unknown course

- **Given** I am signed in as a user with role `admin`
- **And** semester `2026 Fall` exists
- **And** faculty member `Jordan Lee` exists
- **When** I send `POST /api/sections` with a `courseId` that does not exist
- **Then** the API returns `400` with `{ "message": "Course not found." }`
- **And** no section is stored

#### Scenario: Admin adds a section for an unknown semester

- **Given** I am signed in as a user with role `admin`
- **And** course `CS101` exists
- **And** faculty member `Jordan Lee` exists
- **When** I send `POST /api/sections` with a `semesterId` that does not exist
- **Then** the API returns `400` with `{ "message": "Semester not found." }`
- **And** no section is stored

#### Scenario: Admin adds a section with a user who is not faculty

- **Given** I am signed in as a user with role `admin`
- **And** course `CS101` exists
- **And** semester `2026 Fall` exists
- **And** a user with role `student` exists
- **When** I send `POST /api/sections` with that student's id as `facultyId`
- **Then** the API returns `400` with `{ "message": "Faculty member not found." }`
- **And** no section is stored

#### Scenario: Admin adds a duplicate section number

- **Given** I am signed in as a user with role `admin`
- **And** section `001` already exists for course `CS101` in semester `2026 Fall`
- **When** I send `POST /api/sections` with section number `001` for that same course and semester
- **Then** the API returns `400` with `{ "message": "Section number is already taken for this course and semester." }`
- **And** no second section `001` is stored for that course and semester

#### Scenario: Sections list is empty

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the sections view
- **And** there are no sections
- **When** I view the sections list
- **Then** I see **"No sections yet. Add your first section."**

---

### US-6.5 — Add a faculty account

#### Scenario: Admin adds a faculty member

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **When** I click **+ New faculty**
- **And** I enter first name `Jordan`, last name `Lee`, email `jlee@example.com`, username `JLee`, password `password1`, and matching confirm password
- **And** I click **Create**
- **Then** the API returns `201` with `username` `jlee`, `email` `jlee@example.com`, and `role` `faculty`
- **And** the response does not include `password` or `token`
- **And** the user record stores a bcrypt password hash
- **And** `Jordan Lee` appears in the faculty list
- **And** my `localStorage` key `user` is still the admin session
- **And** the add-faculty dialog closes

#### Scenario: Admin adds a faculty member with missing email

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **When** I click **+ New faculty**
- **And** I leave email empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Email is required."**

#### Scenario: Admin adds a faculty member with invalid email

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **When** I click **+ New faculty**
- **And** I enter email `notanemail`
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Enter a valid email address."**

#### Scenario: Admin adds a faculty member with a password that is too short

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **When** I click **+ New faculty**
- **And** I enter a password with fewer than 8 characters
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Password must be at least 8 characters."**

#### Scenario: Admin adds a faculty member with mismatched passwords

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **When** I click **+ New faculty**
- **And** password and confirm password do not match
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Passwords do not match."**

#### Scenario: Admin adds a faculty member with a duplicate username

- **Given** I am signed in as a user with role `admin`
- **And** a user with username `jlee` already exists
- **When** I send `POST /api/faculty` with username `JLee` and a new email
- **Then** the API returns `400` with `{ "message": "Username is already taken." }`
- **And** no second user with username `jlee` is stored

#### Scenario: Admin adds a faculty member with a duplicate email

- **Given** I am signed in as a user with role `admin`
- **And** a user with email `jlee@example.com` already exists
- **When** I send `POST /api/faculty` with email `jlee@example.com` and a new username
- **Then** the API returns `400` with `{ "message": "Email is already registered." }`
- **And** no second user with that email is stored

#### Scenario: Admin adds a faculty member and a client role is ignored

- **Given** I am signed in as a user with role `admin`
- **When** I send `POST /api/faculty` with a valid faculty body and `"role": "admin"`
- **Then** the API returns `201` with `"role": "faculty"`
- **And** the stored user role is `faculty`

#### Scenario: Faculty list is empty

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the faculty view
- **And** there are no faculty users
- **When** I view the faculty list
- **Then** I see **"No faculty yet. Add your first faculty member."**

---

### US-6.6 — Add a student account

#### Scenario: Admin adds a student

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the students view
- **When** I click **+ New student**
- **And** I enter first name `Sam`, last name `Rivera`, email `srivera@example.com`, username `srivera`, password `password1`, and matching confirm password
- **And** I click **Create**
- **Then** the API returns `201` with `username` `srivera` and `role` `student`
- **And** the response does not include `password` or `token`
- **And** the user record stores a bcrypt password hash
- **And** `Sam Rivera` appears in the students list
- **And** my `localStorage` key `user` is still the admin session
- **And** the add-student dialog closes

#### Scenario: Admin adds a student with missing username

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the students view
- **When** I click **+ New student**
- **And** I leave username empty
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Username is required."**

#### Scenario: Admin adds a student with mismatched passwords

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the students view
- **When** I click **+ New student**
- **And** password and confirm password do not match
- **And** I click **Create**
- **Then** no API call is made
- **And** I see the message **"Passwords do not match."**

#### Scenario: Admin adds a student with a duplicate email

- **Given** I am signed in as a user with role `admin`
- **And** a user with email `srivera@example.com` already exists
- **When** I send `POST /api/students` with email `srivera@example.com` and a new username
- **Then** the API returns `400` with `{ "message": "Email is already registered." }`
- **And** no second user with that email is stored

#### Scenario: Students list is empty

- **Given** I am signed in as a user with role `admin`
- **And** I am viewing the students view
- **And** there are no student users
- **When** I view the students list
- **Then** I see **"No students yet. Add your first student."**

---

### US-6.7 — Restrict adds to admins

#### Scenario: Student cannot add a semester via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/semesters` with a valid semester body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new semester is stored

#### Scenario: Student cannot add a course via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/courses` with a valid course body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new course is stored

#### Scenario: Student cannot add a section via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/sections` with a valid section body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new section is stored

#### Scenario: Student cannot add a faculty member via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/faculty` with a valid faculty body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new user is stored

#### Scenario: Student cannot add a student via the API

- **Given** I am signed in as a user with role `student`
- **When** I send `POST /api/students` with a valid student body
- **Then** the API returns `403` with `{ "message": "Admin role required." }`
- **And** no new user is stored

#### Scenario: Student can list courses via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/courses`
- **Then** the API returns `200` with an array of course objects

#### Scenario: Student can list sections via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/sections`
- **Then** the API returns `200` with an array of section objects

#### Scenario: Student can list semesters via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/semesters`
- **Then** the API returns `200` with an array of semester objects

#### Scenario: Student cannot list faculty via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/faculty`
- **Then** the API returns `403` with `{ "message": "Admin role required." }`

#### Scenario: Student cannot list students via the API

- **Given** I am signed in as a user with role `student`
- **When** I request `GET /api/students`
- **Then** the API returns `403` with `{ "message": "Admin role required." }`

#### Scenario: Unauthenticated API request to courses

- **Given** I have no valid session token
- **When** I request `GET /api/courses`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated API request to faculty

- **Given** I have no valid session token
- **When** I request `GET /api/faculty`
- **Then** the API returns `401` with an unauthorized message

#### Scenario: Unauthenticated user navigates to courses

- **Given** I have no session in `localStorage`
- **When** I navigate to `/courses`
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated user navigates to sections

- **Given** I have no session in `localStorage`
- **When** I navigate to `/sections`
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated user navigates to faculty

- **Given** I have no session in `localStorage`
- **When** I navigate to `/faculty`
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated user navigates to students

- **Given** I have no session in `localStorage`
- **When** I navigate to `/students`
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated user navigates to semesters

- **Given** I have no session in `localStorage`
- **When** I navigate to `/semesters`
- **Then** I am redirected to the login page

#### Scenario: Student navigates directly to courses

- **Given** I am signed in as a user with role `student`
- **When** I navigate to `/courses`
- **Then** I am redirected to the home page

#### Scenario: Faculty navigates directly to faculty

- **Given** I am signed in as a user with role `faculty`
- **When** I navigate to `/faculty`
- **Then** I am redirected to the home page

---

## Test Coverage Map

| Story | Scenario | Test file | Test name |
| ----- | -------- | --------- | --------- |
| US-6.1 | Admin sees setup items in MenuBar | `frontend/tests/MenuBar.test.js` | `Admin sees setup items in MenuBar` |
| US-6.1 | Admin opens Courses from the menu | `frontend/tests/MenuBar.test.js`, `frontend/tests/Courses.test.js` | `Admin opens Courses from the menu` |
| US-6.1 | Student does not see admin setup items | `frontend/tests/MenuBar.test.js` | `Student does not see admin setup items` |
| US-6.1 | Faculty does not see admin setup items | `frontend/tests/MenuBar.test.js` | `Faculty does not see admin setup items` |
| US-6.2 | Admin adds a semester | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `Admin adds a semester` |
| US-6.2 | Admin adds a semester with a missing required field | `frontend/tests/Semesters.test.js` | `Admin adds a semester with a missing required field` |
| US-6.2 | Admin adds a semester with a name that is too long | `frontend/tests/Semesters.test.js` | `Admin adds a semester with a name that is too long` |
| US-6.2 | Admin adds a semester with end date before start date | `frontend/tests/Semesters.test.js` | `Admin adds a semester with end date before start date` |
| US-6.2 | Admin adds a semester with a duplicate name | `backend/tests/semesters.test.js` | `Admin adds a semester with a duplicate name` |
| US-6.2 | Semesters list is empty | `frontend/tests/Semesters.test.js` | `Semesters list is empty` |
| US-6.2 | Admin sees semesters ordered by start date | `backend/tests/semesters.test.js`, `frontend/tests/Semesters.test.js` | `Admin sees semesters ordered by start date` |
| US-6.3 | Admin adds a course | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin adds a course` |
| US-6.3 | Admin adds a course with a missing required field | `frontend/tests/Courses.test.js` | `Admin adds a course with a missing required field` |
| US-6.3 | Admin adds a course with a code that is too long | `frontend/tests/Courses.test.js` | `Admin adds a course with a code that is too long` |
| US-6.3 | Admin adds a course with a duplicate code | `backend/tests/courses.test.js` | `Admin adds a course with a duplicate code` |
| US-6.3 | Courses list is empty | `frontend/tests/Courses.test.js` | `Courses list is empty` |
| US-6.3 | Admin sees courses ordered by course code | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin sees courses ordered by course code` |
| US-6.4 | Admin adds a section | `backend/tests/sections.test.js`, `frontend/tests/Sections.test.js` | `Admin adds a section` |
| US-6.4 | Admin adds a section with a missing required field | `frontend/tests/Sections.test.js` | `Admin adds a section with a missing required field` |
| US-6.4 | Admin adds a section with a number that is too long | `frontend/tests/Sections.test.js` | `Admin adds a section with a number that is too long` |
| US-6.4 | Admin adds a section for an unknown course | `backend/tests/sections.test.js` | `Admin adds a section for an unknown course` |
| US-6.4 | Admin adds a section for an unknown semester | `backend/tests/sections.test.js` | `Admin adds a section for an unknown semester` |
| US-6.4 | Admin adds a section with a user who is not faculty | `backend/tests/sections.test.js` | `Admin adds a section with a user who is not faculty` |
| US-6.4 | Admin adds a duplicate section number | `backend/tests/sections.test.js` | `Admin adds a duplicate section number` |
| US-6.4 | Sections list is empty | `frontend/tests/Sections.test.js` | `Sections list is empty` |
| US-6.5 | Admin adds a faculty member | `backend/tests/faculty.test.js`, `frontend/tests/Faculty.test.js` | `Admin adds a faculty member` |
| US-6.5 | Admin adds a faculty member with missing email | `frontend/tests/Faculty.test.js` | `Admin adds a faculty member with missing email` |
| US-6.5 | Admin adds a faculty member with invalid email | `frontend/tests/Faculty.test.js` | `Admin adds a faculty member with invalid email` |
| US-6.5 | Admin adds a faculty member with a password that is too short | `frontend/tests/Faculty.test.js` | `Admin adds a faculty member with a password that is too short` |
| US-6.5 | Admin adds a faculty member with mismatched passwords | `frontend/tests/Faculty.test.js` | `Admin adds a faculty member with mismatched passwords` |
| US-6.5 | Admin adds a faculty member with a duplicate username | `backend/tests/faculty.test.js` | `Admin adds a faculty member with a duplicate username` |
| US-6.5 | Admin adds a faculty member with a duplicate email | `backend/tests/faculty.test.js` | `Admin adds a faculty member with a duplicate email` |
| US-6.5 | Admin adds a faculty member and a client role is ignored | `backend/tests/faculty.test.js` | `Admin adds a faculty member and a client role is ignored` |
| US-6.5 | Faculty list is empty | `frontend/tests/Faculty.test.js` | `Faculty list is empty` |
| US-6.6 | Admin adds a student | `backend/tests/students.test.js`, `frontend/tests/Students.test.js` | `Admin adds a student` |
| US-6.6 | Admin adds a student with missing username | `frontend/tests/Students.test.js` | `Admin adds a student with missing username` |
| US-6.6 | Admin adds a student with mismatched passwords | `frontend/tests/Students.test.js` | `Admin adds a student with mismatched passwords` |
| US-6.6 | Admin adds a student with a duplicate email | `backend/tests/students.test.js` | `Admin adds a student with a duplicate email` |
| US-6.6 | Students list is empty | `frontend/tests/Students.test.js` | `Students list is empty` |
| US-6.7 | Student cannot add a semester via the API | `backend/tests/semesters.test.js` | `Student cannot add a semester via the API` |
| US-6.7 | Student cannot add a course via the API | `backend/tests/courses.test.js` | `Student cannot add a course via the API` |
| US-6.7 | Student cannot add a section via the API | `backend/tests/sections.test.js` | `Student cannot add a section via the API` |
| US-6.7 | Student cannot add a faculty member via the API | `backend/tests/faculty.test.js` | `Student cannot add a faculty member via the API` |
| US-6.7 | Student cannot add a student via the API | `backend/tests/students.test.js` | `Student cannot add a student via the API` |
| US-6.7 | Student can list courses via the API | `backend/tests/courses.test.js` | `Student can list courses via the API` |
| US-6.7 | Student can list sections via the API | `backend/tests/sections.test.js` | `Student can list sections via the API` |
| US-6.7 | Student can list semesters via the API | `backend/tests/semesters.test.js` | `Student can list semesters via the API` |
| US-6.7 | Student cannot list faculty via the API | `backend/tests/faculty.test.js` | `Student cannot list faculty via the API` |
| US-6.7 | Student cannot list students via the API | `backend/tests/students.test.js` | `Student cannot list students via the API` |
| US-6.7 | Unauthenticated API request to courses | `backend/tests/courses.test.js` | `Unauthenticated API request to courses` |
| US-6.7 | Unauthenticated API request to faculty | `backend/tests/faculty.test.js` | `Unauthenticated API request to faculty` |
| US-6.7 | Unauthenticated user navigates to courses | `frontend/tests/router.test.js` | `Unauthenticated user navigates to courses` |
| US-6.7 | Unauthenticated user navigates to sections | `frontend/tests/router.test.js` | `Unauthenticated user navigates to sections` |
| US-6.7 | Unauthenticated user navigates to faculty | `frontend/tests/router.test.js` | `Unauthenticated user navigates to faculty` |
| US-6.7 | Unauthenticated user navigates to students | `frontend/tests/router.test.js` | `Unauthenticated user navigates to students` |
| US-6.7 | Unauthenticated user navigates to semesters | `frontend/tests/router.test.js` | `Unauthenticated user navigates to semesters` |
| US-6.7 | Student navigates directly to courses | `frontend/tests/router.test.js` | `Student navigates directly to courses` |
| US-6.7 | Faculty navigates directly to faculty | `frontend/tests/router.test.js` | `Faculty navigates directly to faculty` |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-admin-account-management.md on branch `feature/6-admin-account-management`.

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

- Edit or delete of semesters, courses, sections, faculty, or students (semester edit and delete remain [Feature 2](feature-2-semester-management.md))
- Student enrollment in sections
- Section meeting times, rooms, and capacity
- Changing Feature 1 public registration, including which roles a visitor can self-select
- Password reset and email verification
- A second `MenuBar`

---

## Delivered to later features

- Shared `GET /api/semesters`, `GET /api/courses`, and `GET /api/sections` for any authenticated user, so a later enrollment feature can list offerings without a second catalog.
- Faculty and student accounts with roles `faculty` and `student`, able to sign in through Feature 1.
- `MenuBar` items **Courses**, **Sections**, **Faculty**, and **Students** for role `admin`. **Semesters** is the same item Feature 2 adds; do not add it twice.
