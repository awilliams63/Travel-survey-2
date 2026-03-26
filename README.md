# Dream Travel Survey

## Description

Dream Travel Survey is a data-collection web application built for BAIS:3300 that asks college students and families four targeted questions about their travel preferences, dream destinations, and activity interests. Responses are stored anonymously in a Supabase PostgreSQL database and visualized in real time on an aggregated results dashboard. The app exists to help identify trends in travel inspiration across different traveler segments, and is designed to be lightweight, accessible, and deployable to Azure Static Web Apps with zero backend infrastructure.

---

## Badges

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## Features

- **Four-question survey** covering dream destination, destination type, traveler style, and preferred activities — completing in under two minutes
- **Conditional "Other" input** — a text field appears automatically when "Other" is selected in the activities question, with auto-focus and required validation
- **Inline form validation** with accessible error messages linked via `aria-describedby` so screen readers announce errors clearly
- **Live results dashboard** at `/results` displaying four Recharts visualizations: destination types, traveler personas, most popular activities, and top 10 dream destinations
- **Aggregated-only display** — individual responses are never shown, protecting respondent privacy
- **Confirmation screen** after submission, summarizing the user's own answers with options to submit again or view the results
- **Fully responsive layout** that works on mobile, tablet, and desktop from a single-column stack on small screens
- **Zero backend required** — the frontend connects directly to Supabase using row-level security, making it trivially deployable as a static site

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component library and rendering |
| TypeScript | Static typing across all source files |
| Vite | Dev server, HMR, and production bundler |
| Tailwind CSS 4 | Utility-first styling and responsive layout |
| shadcn/ui + Radix UI | Accessible, unstyled component primitives |
| Supabase (`@supabase/supabase-js`) | PostgreSQL database — insert and query survey responses |
| Recharts | Bar chart visualizations on the results page |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| React Hook Form | Form state management and submission handling |
| Zod | Schema validation for form fields |
| Framer Motion | Entry animations for page transitions |
| Azure Static Web Apps | Production hosting with SPA routing fallback |

---

## Getting Started

### Prerequisites

- [Node.js v18+](https://nodejs.org/en/download)
- [pnpm v8+](https://pnpm.io/installation)
- A [Supabase](https://supabase.com) account with a project created

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/dream-travel-survey.git
   cd dream-travel-survey
   ```

2. **Install all workspace dependencies**

   ```bash
   pnpm install
   ```

3. **Set up the Supabase database**

   Open your [Supabase SQL Editor](https://app.supabase.com) and run the contents of `supabase-setup.sql`. This creates the `travel_survey_results` table and applies row-level security policies that allow anonymous inserts and reads.

4. **Configure environment variables**

   Create a `.env` file inside `artifacts/dream-travel-survey/`:

   ```env
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```

   > These are public/publishable keys. Do **not** use your Supabase service role key here.

5. **Start the development server**

   ```bash
   pnpm --filter @workspace/dream-travel-survey run dev
   ```

   The app will be available at the port printed in your terminal.

---

## Usage

### Running the App

| Command | Description |
|---|---|
| `pnpm --filter @workspace/dream-travel-survey run dev` | Start development server with HMR |
| `pnpm --filter @workspace/dream-travel-survey run build` | Build for production into `dist/` |
| `pnpm --filter @workspace/dream-travel-survey run serve` | Preview the production build locally |
| `pnpm --filter @workspace/dream-travel-survey run typecheck` | Run TypeScript type checking |

### App Pages

| Route | Description |
|---|---|
| `/` | Home page — welcome message, links to survey and results |
| `/survey` | The four-question survey form |
| `/results` | Aggregated results dashboard with charts |

### Configuration

All configuration is via environment variables prefixed with `VITE_` so Vite embeds them at build time:

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon (public) key |

---

## Project Structure

```
dream-travel-survey/
├── artifacts/
│   └── dream-travel-survey/          # React + Vite frontend artifact
│       ├── public/
│       │   ├── images/
│       │   │   └── hero-bg.png       # AI-generated hero background image
│       │   └── staticwebapp.config.json  # Azure SWA SPA routing fallback config
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout.tsx        # Shared page wrapper with header and footer
│       │   │   └── ui/               # shadcn/ui component library (button, input, etc.)
│       │   ├── hooks/
│       │   │   └── use-survey.ts     # React hook encapsulating survey submission logic
│       │   ├── lib/
│       │   │   ├── supabase.ts       # Supabase client initialized from env vars
│       │   │   └── utils.ts          # Tailwind class merging utility (cn)
│       │   ├── pages/
│       │   │   ├── home.tsx          # Landing page with hero and navigation buttons
│       │   │   ├── survey.tsx        # Four-question form with validation and confirmation
│       │   │   └── results.tsx       # Aggregated results page with four Recharts charts
│       │   ├── App.tsx               # Wouter router — maps routes to page components
│       │   ├── index.css             # Tailwind base + custom CSS variable theme
│       │   └── main.tsx              # React DOM entry point
│       ├── package.json              # Artifact-level dependencies and scripts
│       ├── tsconfig.json             # TypeScript config extending workspace base
│       └── vite.config.ts            # Vite config with Tailwind and Replit plugins
├── supabase-setup.sql                # Run once in Supabase SQL Editor to create schema
├── README.md                         # This file
└── pnpm-workspace.yaml               # pnpm monorepo workspace configuration
```

---

## Changelog

### v1.0.0 — 2026-03-24

- Initial release
- Four-question survey form with inline validation and WCAG 2.1 AA accessibility
- Supabase PostgreSQL integration with row-level security
- Results dashboard with four Recharts visualizations
- Confirmation screen with response summary after successful submission
- Conditional "Other" activity input with auto-focus
- Responsive layout for mobile, tablet, and desktop
- Azure Static Web Apps routing config (`staticwebapp.config.json`)
- SQL setup script for one-step Supabase schema creation

---

## Known Issues / To-Do

- [ ] Results charts do not auto-refresh — users must reload the page to see new submissions after their own
- [ ] No rate limiting on submissions — a single user could submit the survey multiple times without restriction
- [ ] The "Top Dream Destinations" chart normalizes casing but does not normalize common spelling variants (e.g., "Greece" vs "Santorini, Greece" count as separate entries)
- [ ] No loading skeleton is shown for individual chart sections while data fetches — only a full-page spinner
- [ ] The app does not yet support embedding in an iframe for use in course LMS platforms

---

## Roadmap

- **Duplicate submission prevention** — use browser `localStorage` to detect and warn repeat submitters
- **Admin export view** — password-protected `/admin` page with a CSV download of all anonymized responses
- **Word cloud visualization** — replace or augment the destination bar chart with a word cloud for more visual impact
- **Response timestamp filter** — allow the results page to filter charts by date range (e.g., responses from this week only)
- **Multi-language support** — add Spanish and French translations to reach a broader student audience

---

## Contributing

This project was created as a course assignment and is not actively seeking external contributions. However, if you find a bug or want to suggest an improvement, feel free to open an issue. To contribute code:

1. Fork the repository on GitHub
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch with a clear description of your changes

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Amanda Williams**  
University of Iowa — College of Business  
Course: BAIS:3300 · Spring 2026

---

## Contact

GitHub: [@amandawilliams](https://github.com/amandawilliams)

---

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — for clear documentation on row-level security and the JavaScript client
- [Recharts](https://recharts.org) — for the composable, React-native charting library used on the results page
- [shadcn/ui](https://ui.shadcn.com) — for the accessible component system built on Radix UI primitives
- [Tailwind CSS](https://tailwindcss.com/docs) — for the utility-first styling approach used throughout the app
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/) — for SPA routing and deployment configuration guidance
- [Vite Docs](https://vite.dev) — for the fast build tooling and environment variable handling
- [Replit](https://replit.com) — development environment and AI-assisted scaffolding
- [Claude (Anthropic)](https://anthropic.com) — AI assistant used for code generation, accessibility guidance, and project structure
