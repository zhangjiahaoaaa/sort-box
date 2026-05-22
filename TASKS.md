# TASKS.md

## Current MVP Status

第一阶段目标已经完成：上传/粘贴 -> 识别确认 -> 归档 -> 搜索。

当前版本额外完成了本地文件库、资料预览下载、课程删除、资料删除、演示数据重置、识别 provider 抽象、可选 AI 通知识别、期末救命搜索。

## Done

### Project Foundation

- [x] Initialize Next.js project with TypeScript.
- [x] Configure Tailwind CSS.
- [x] Add lucide-react.
- [x] Define base app metadata.
- [x] Create app folder structure.
- [x] Add global styles.
- [x] Confirm dev server starts successfully.

### Data Foundation

- [x] Define `Course`, `Material`, `Todo`, `Notice`, `RecognitionDraft`, `AppData`.
- [x] Create demo courses, materials, todos, notices.
- [x] Implement localStorage read/write helpers.
- [x] Seed demo data when storage is empty.
- [x] Add ID and timestamp helpers.
- [x] Add IndexedDB file storage helper.

### Core App

- [x] Build Dashboard page.
- [x] Build course list page.
- [x] Build course detail page.
- [x] Add course creation.
- [x] Add course deletion with cascade cleanup.
- [x] Add material list, todo list, notice list.
- [x] Add empty states.
- [x] Add demo data reset action.

### Materials

- [x] Build add material page.
- [x] Support course selector and query `courseId`.
- [x] Save real file Blob to IndexedDB.
- [x] Save material metadata to localStorage.
- [x] Store `fileId`, `mimeType`, `fileSize`, `extractedText`.
- [x] Mock-recognize material filename for course/type/tags.
- [x] Suggest likely new course and allow one-click create.
- [x] Add material preview page `/materials/[materialId]`.
- [x] Preview PDF, image, and text files.
- [x] Show unsupported preview state for Office files.
- [x] Download files from IndexedDB.
- [x] Delete materials and clean up IndexedDB file blobs.

### Notices and Recognition

- [x] Build paste notice page.
- [x] Support optional course selector and query `courseId`.
- [x] Implement mock course/title/deadline/submit method/tag recognition.
- [x] Improve relative date handling.
- [x] Suggest likely new course and allow one-click create.
- [x] Build recognition confirmation page.
- [x] Keep AI/mock suggestions editable before archive.
- [x] Create linked `Notice` and `Todo` after confirmation.
- [x] Clear recognition draft after archive.
- [x] Add recognition provider abstraction.
- [x] Add optional OpenAI/DeepSeek notice recognition route.

### Todos

- [x] Build todo list and todo item components.
- [x] Show deadline status.
- [x] Toggle todo done/pending.
- [x] Delete todos.
- [x] Persist status changes.
- [x] Group DDL on Dashboard.

### Search

- [x] Build global search input.
- [x] Search course names.
- [x] Search material file names, tags, notes, course names.
- [x] Search material `extractedText`.
- [x] Search notice raw/original text.
- [x] Search todo titles, deadline text, submit method, tags.
- [x] Show grouped search results.
- [x] Show result type.
- [x] Show match field and snippet.
- [x] Highlight keywords.
- [x] Link results to material preview or course detail.
- [x] Add empty state for no results.

## Manual Verification Checklist

- [ ] Open `http://localhost:3000`.
- [ ] Reset demo data.
- [ ] Create a new course.
- [ ] Upload PDF and confirm preview/download works after refresh.
- [ ] Upload image and confirm preview/download works after refresh.
- [ ] Upload docx and confirm unsupported preview + download works.
- [ ] Upload txt and confirm body text can be searched.
- [ ] Paste a notice for a course.
- [ ] Review recognition result.
- [ ] Edit recognition result.
- [ ] Archive recognition result.
- [ ] Confirm notice appears in course detail.
- [ ] Confirm todo appears in course detail.
- [ ] Search a keyword and confirm grouped, highlighted results.
- [ ] Delete material and confirm it disappears.
- [ ] Delete course and confirm related materials/todos/notices disappear.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.

## Next High-Value Tasks

- [ ] Add PDF text extraction.
- [ ] Add docx text extraction.
- [ ] Support splitting one notice into multiple todos.
- [ ] Show AI provider/confidence on confirmation page.
- [ ] Add source relationship from todo back to notice snippet.
- [ ] Add import/export for local demo data.
- [ ] Improve mobile layout.

## Not In Current MVP

- [ ] Login/register.
- [ ] Cloud storage.
- [ ] Backend database.
- [ ] QQ/WeChat automatic import.
- [ ] Learning platform API integration.
- [ ] OCR.
- [ ] Vector database.
- [ ] Multi-user collaboration.
- [ ] Calendar sync.
- [ ] Mobile app.
