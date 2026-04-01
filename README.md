# Apply Direct

Apply Direct is a Vite + React + TypeScript web app for sending your EmailJS template email with your resume attached automatically.

## Features

- Single email field workflow
- Subject and body managed directly in your EmailJS template
- Direct EmailJS send flow with your resume attached automatically
- Automatic resume loading from the bundled `resume_chhatrapati.pdf`
- Success and failure toasts
- Mobile responsive modern UI

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your EmailJS keys.
3. By default the app uses the root-level `resume_chhatrapati.pdf`.
4. If you want a different file, set `VITE_RESUME_PATH` and optionally `VITE_RESUME_FILENAME`.
5. In your EmailJS template, configure these dynamic fields:
   - `to_email`
   - `resume_attachment`
   - `resume_filename`
   - `resume_content_type`
6. In the EmailJS template editor, add a variable attachment using:
   - Parameter name: `resume_attachment`
   - Filename: `{{resume_filename}}`
   - Content type: `{{resume_content_type}}`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
