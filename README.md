# Quantity Checker

Upload a CSV and get total quantities per product in a clean, filterable, sortable table.

## Features

- App Router (Next.js 14) with React Server Components
- Client-side CSV parsing via PapaParse
- Validates required columns: `Lineitem name` and `Lineitem quantity`
- Aggregates quantities across duplicate product names
- Search and sort (by name and quantity)
- Tailwind CSS styling, responsive layout

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and upload your CSV.

## CSV Requirements

- Must include headers: `Lineitem name`, `Lineitem quantity`
- Quantities are parsed as numbers (commas are ignored)

## Deploying to Vercel

- Push this folder to a Git repository (GitHub/GitLab/Bitbucket)
- Import the project in Vercel and deploy (defaults work out of the box)

## Tech

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- PapaParse


