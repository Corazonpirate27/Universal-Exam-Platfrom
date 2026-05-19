# Universal Exam Platform

A React + Vite mock exam workspace for user- and teacher-uploaded materials and original practice exams.

This is not an official IELTS, GRE, or exam-board content platform. IELTS appears only as an "IELTS-style practice mode"; the app does not bundle copyrighted PDFs, audio, books, or copied questions.

Content notice: Teachers/users are responsible for uploading content they have rights to use.

## Run

```sh
npm install
npm run dev
```

## Folder Structure

```text
.
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- vite.config.js
|-- src
|   |-- App.jsx
|   |-- main.jsx
|   |-- styles.css
|   |-- components
|   |   |-- AnswerSheet.jsx
|   |   |-- AudioPlayer.jsx
|   |   |-- ExamLayout.jsx
|   |   |-- PDFViewer.jsx
|   |   |-- ReviewModal.jsx
|   |   |-- RoughWorkCanvas.jsx
|   |   |-- SectionTabs.jsx
|   |   |-- SetupScreen.jsx
|   |   |-- ThemeToggle.jsx
|   |   `-- Timer.jsx
|   |-- data
|   |   `-- examTemplates.js
|   |-- services
|   |   `-- examService.js
|   `-- utils
|       `-- exam.js
`-- Universal Exam Platfrom.html
```

## Current Features

- IELTS-style, GRE-style, and universal mock exam modes
- User/teacher PDF upload and audio upload
- Short answer, MCQ, essay/writing, and fill-in-the-blank question types
- Compact section navigation with Previous/Next question controls
- Answered, unanswered, and flagged status
- 5-second autosave with resume session
- Final submission state and answer export
- Rough work canvas for mouse, touch, and stylus
- Dark mode
- Mobile responsive layout
- Accessible labels, keyboard-friendly controls, and leave-page warning during active exams
- Mock service layer for future backend integration

## Prototype Audit

The previous single-file prototype was useful, but not production-ready:

- DOM state, rendering, persistence, timer logic, file handling, and review flow were all coupled in one script.
- Autosave happened on every keystroke while the UI described autosave as a background feature.
- Resume restored answers only after starting and could not restore timer/submission status safely.
- Navigation dots were hidden, which weakened question status visibility.
- Uploaded file object URLs were treated like session state even though they cannot survive refresh.
- Branding centered on an official exam name instead of a neutral platform identity.
- Accessibility was inconsistent: many generated controls lacked stable labels or dialog semantics.
- Maintainability risk was high because question rendering duplicated essay/grid logic and relied on raw DOM IDs.

The first production fixes were therefore architecture, copyright-safe naming, session persistence boundaries, reusable components, and a backend-ready service layer.
