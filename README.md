# TerraMatrix Academy

TerraMatrix Academy is an Engineering Intelligence Platform for learning, practice, research, collaboration and certification.

This repository contains the React + TypeScript frontend deployed on Vercel. The production frontend is also loaded by a small Google Apps Script web-app shell so that the interface can use `google.script.run` for the shared Google Sheets and Drive backend.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The build publishes fixed bridge asset names:

- `/assets/terramatrix-app.js`
- `/assets/terramatrix-app.css`

Do not rename these files without also updating the Apps Script `Index.html` bridge.

## Architecture

- Frontend and static assets: React, TypeScript, Vite, Vercel
- Shared application services: Google Apps Script
- Structured records: Google Sheets
- Files and learning resources: Google Drive
- Routing: HashRouter, compatible with both Vercel and Apps Script

Private passwords and keys must not be committed to this repository.
