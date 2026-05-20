# TASKS.md

## Phase 0: Project Setup

- [ ] Initialize Next.js project with TypeScript.
- [ ] Install and configure Tailwind CSS.
- [ ] Add shadcn/ui if setup is smooth.
- [ ] Add lucide-react.
- [ ] Define base app metadata.
- [ ] Create initial folder structure.
- [ ] Add global styles.
- [ ] Confirm the dev server starts successfully.

## Phase 1: MVP Closed Loop

Goal: complete upload/paste -> recognition confirmation -> archive -> search.

### Data Foundation

- [ ] Define `Course` type.
- [ ] Define `Material` type.
- [ ] Define `Todo` type.
- [ ] Define `Notice` type.
- [ ] Define `RecognitionDraft` type.
- [ ] Define `AppData` type.
- [ ] Create demo courses.
- [ ] Create demo materials.
- [ ] Create demo todos.
- [ ] Create demo notices.
- [ ] Implement localStorage read helper.
- [ ] Implement localStorage write helper.
- [ ] Implement demo data seeding when storage is empty.
- [ ] Implement ID generation helper.
- [ ] Implement timestamp helper.

### App Shell

- [ ] Create root layout.
- [ ] Create sidebar navigation.
- [ ] Create topbar.
- [ ] Add navigation links for Dashboard, courses, add material, and paste notice.
- [ ] Add active navigation state.
- [ ] Add responsive layout behavior.

### Dashboard

- [ ] Build Dashboard page.
- [ ] Show total course count.
- [ ] Show pending todo count.
- [ ] Show upcoming DDL list.
- [ ] Show recent materials list.
- [ ] Show course overview section.
- [ ] Add entry point to add material.
- [ ] Add entry point to paste notice.

### Courses

- [ ] Build course list page.
- [ ] Render demo and persisted courses.
- [ ] Build course card component.
- [ ] Add course creation form.
- [ ] Save new course to localStorage.
- [ ] Build course detail page.
- [ ] Show course header.
- [ ] Show materials for the selected course.
- [ ] Show todos for the selected course.
- [ ] Show notices for the selected course.
- [ ] Add empty state for courses without data.

### Materials

- [ ] Build add material page.
- [ ] Add course selector.
- [ ] Add file name input.
- [ ] Add material type selector.
- [ ] Add tag input.
- [ ] Add note input.
- [ ] Validate required fields.
- [ ] Save material metadata to localStorage.
- [ ] Redirect or link to the related course detail after save.
- [ ] Render saved material in course detail.

### Notices and Mock Recognition

- [ ] Build paste notice page.
- [ ] Add raw notice textarea.
- [ ] Add optional course selector.
- [ ] Implement mock course recognition.
- [ ] Implement mock title extraction.
- [ ] Implement mock deadline extraction.
- [ ] Implement mock submit method extraction.
- [ ] Implement mock tag extraction.
- [ ] Save recognition draft temporarily.
- [ ] Navigate to recognition confirmation page.

### Recognition Confirmation

- [ ] Build recognition confirmation page.
- [ ] Load recognition draft.
- [ ] Make recognized course editable.
- [ ] Make recognized title editable.
- [ ] Make deadline editable.
- [ ] Make submit method editable.
- [ ] Make tags editable.
- [ ] Show original notice text.
- [ ] Confirm and create `Notice`.
- [ ] Confirm and create linked `Todo`.
- [ ] Persist archived data to localStorage.
- [ ] Clear recognition draft after archive.
- [ ] Show success state or navigate to course detail.

### Todos

- [ ] Build todo list component.
- [ ] Build todo item component.
- [ ] Show deadline status.
- [ ] Toggle todo done and pending.
- [ ] Persist todo status changes.
- [ ] Show source notice relationship when available.

### Search

- [ ] Build global search input.
- [ ] Implement search across course names.
- [ ] Implement search across material file names.
- [ ] Implement search across material tags.
- [ ] Implement search across notice raw text.
- [ ] Implement search across todo titles.
- [ ] Show grouped search results.
- [ ] Link search results to course detail.
- [ ] Add empty state for no results.

### Manual Verification

- [ ] Create a new course.
- [ ] Add material to the course.
- [ ] Paste a notice for the course.
- [ ] Review mock recognition result.
- [ ] Edit recognition result.
- [ ] Archive recognition result.
- [ ] Confirm notice appears in course detail.
- [ ] Confirm todo appears in course detail.
- [ ] Confirm search can find the new material.
- [ ] Confirm search can find the new todo.
- [ ] Refresh the page and confirm data remains.

## Phase 2: MVP Polish

- [ ] Improve mobile layout.
- [ ] Improve empty states.
- [ ] Improve deadline display.
- [ ] Add material type badges.
- [ ] Add tag styling.
- [ ] Add better form validation messages.
- [ ] Add reset demo data action.
- [ ] Add README running instructions after project initialization.
- [ ] Review Chinese UI copy.
- [ ] Remove unused code.

## Phase 3: Future Enhancements

- [ ] Replace mock recognition with real AI API.
- [ ] Support extracting multiple todos from one notice.
- [ ] Add real file upload metadata handling.
- [ ] Add file content parsing.
- [ ] Add OCR for screenshots.
- [ ] Add calendar export.
- [ ] Add backend database.
- [ ] Add authentication.
- [ ] Add cloud storage.
- [ ] Add learning platform integrations.
