# CLAUDE.md

## Project

期末救命箱 is a 72-hour MVP for college students to organize course materials, group notices, assignments, review resources, and deadlines by course.
The product is not a cloud drive. It is a course information workspace that turns scattered course fragments into searchable materials and trackable todos.

## MVP Goal

Phase 1 must complete this loop:

Upload or paste -> mock recognition -> user confirmation -> archive -> search.

Do not expand Phase 1 beyond this loop.

## Product Boundaries

Build in Phase 1:

- Dashboard
- Course list
- Course detail page
- Add material page
- Paste notice page
- Recognition confirmation page
- Global keyword search
- Demo mock data
- localStorage persistence

Do not build in Phase 1:

- Login or registration
- QQ or WeChat auto import
- Learning platform integration
- OCR
- Vector database
- Full file content parsing
- Multi-user collaboration
- Real cloud storage
- Calendar sync
- Mobile app

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui when convenient
- lucide-react for icons
- localStorage for MVP persistence
- date-fns only if useful

Avoid backend services, databases, auth frameworks, object storage, and AI orchestration libraries during Phase 1.

## Code Style

- UI copy must be Chinese.
- File names, variable names, type names, and function names must be English.
- Keep components small and purpose-specific.
- Keep business logic out of page files when it can live in `lib/` or hooks.
- Prefer typed domain models in `lib/types.ts`.
- Prefer clear, boring code over clever abstractions.
- Use local helper functions before adding broad abstractions.
- Add comments only when the code needs context.

## Data Rules

- Store MVP data in localStorage.
- Treat localStorage access as an implementation detail behind helper functions or hooks.
- Use one coherent app data shape containing courses, materials, todos, and notices.
- Include stable IDs and timestamps on saved entities.
- Seed demo data when no local data exists.

## Mock Recognition

Phase 1 recognition is rule-based mock logic.

It may infer:

- Course by matching existing course names
- Deadline by simple date or time patterns
- Submit method by keywords
- Tags by keywords such as 作业, 考试, 复习, 实验, 论文, 小组

Keep the recognition API replaceable so a real AI call can be added later.

## UX Rules

- The first screen should be the working Dashboard, not a marketing landing page.
- Prefer dense, scannable, student-workflow-oriented UI.
- Make empty states useful.
- Make confirmation editable before archive.
- Search should cover course names, material file names, tags, notice text, and todo titles.

## Development Flow

1. Define types and mock data.
2. Add localStorage persistence.
3. Build layout and Dashboard.
4. Build courses and course detail.
5. Build material input.
6. Build notice paste and mock recognition.
7. Build recognition confirmation and archive.
8. Build global search.
9. Test the full loop manually.

## Testing Expectations

- Manually verify the full Phase 1 loop.
- Verify data survives page refresh through localStorage.
- Verify search finds data across all MVP entities.
- Keep automated tests optional until the first working MVP is complete.

## Prohibited Drift

- Do not add non-MVP integrations while Phase 1 is incomplete.
- Do not introduce a backend before localStorage flow works.
- Do not implement real file storage in Phase 1.
- Do not hide core flow behind login.
- Do not put all UI and logic into one giant file.
