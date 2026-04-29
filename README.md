# AI-Based Vernacular Career Mentor

> **TCSD (Technology Commercialization for Startup Development) Project**  
> An AI-powered career mentoring platform for students — with vernacular language support, structured learning roadmaps, resume building, mock interviews, and internship guidance.

---

## Features

| Module | Description | Status |
|--------|-------------|--------|
| Authentication | Email/password login and signup (localStorage) | ✅ |
| User Profile | Student profile with language preference | ✅ |
| Domain Selection | Pick career domain or get AI suggestion via quiz | ✅ |
| Learning Roadmap | Checklist-based roadmap per domain with progress tracking | ✅ |
| AI Resume Builder | Form → AI-generated resume → PDF download | ✅ |
| Mock Interview | Text-based AI interview with feedback | ✅ |
| Language Support | Hindi / Marathi UI toggle via i18next | ✅ |
| Internship Guidance | Platform links + AI chatbot | ✅ |
| Dark Mode | Light/dark theme toggle | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| AI / LLM | Google Gemini 1.5 Flash |
| PDF Export | react-to-print |
| Multilingual UI | i18next + react-i18next |
| Data Storage | localStorage |
| Authentication | localStorage-based (email/password) |

---

## Project Structure

```
career-mentor/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/            # Static assets (images, SVGs)
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx
│   │   └── Toast.jsx
│   ├── context/           # React contexts
│   │   └── ToastContext.jsx
│   ├── data/              # Static roadmap JSON files
│   │   └── roadmaps.json
│   ├── locales/           # i18n translation files
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── mr.json
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Domains.jsx
│   │   ├── Roadmap.jsx
│   │   ├── ResumeBuilder.jsx
│   │   ├── Interview.jsx
│   │   ├── Internship.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── services/          # API and storage logic
│   │   ├── gemini.js      # Google Gemini AI service
│   │   ├── storage.js     # localStorage wrapper
│   │   └── i18n.js        # Internationalization setup
│   ├── styles/            # Global styles
│   │   └── global.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env                   # API keys (gitignored)
├── .env.example           # Template for required env vars
├── .gitignore
├── index.html
├── package.json
├── server.js              # Static file server for production
├── start.bat              # Windows startup script
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Devendra-006/AI-Mentor-TCSD.git

# 2. Navigate into the project
cd AI-Mentor-TCSD

# 3. Install dependencies
npm install

# 4. Create your environment file
copy .env.example .env
# Add your Gemini API key to .env (optional — app works in demo mode without it)

# 5. Start the development server
npm run dev
```

The app will run at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key from [Google AI Studio](https://aistudio.google.com/).

> **Note:** The app works without an API key in **demo mode** — AI features will use pre-built fallback responses. You can also enter your API key in the Settings page at runtime.

---

## AI Features

All AI features are powered by **Google Gemini 1.5 Flash** and include graceful fallbacks:

- **Domain Suggestion Quiz** — AI analyzes quiz answers and suggests the best career domain
- **Resume Generation** — AI converts form data into a professional resume format
- **Mock Interview** — AI conducts a 5-question technical interview with feedback
- **Internship Chatbot** — AI answers questions about internship preparation

Without an API key, all features fall back to curated demo responses.

---

## License

This project is built for educational purposes as part of a Technology Commercialization & Startup Development assignment.

---

*Made by Devendra | Second Year Engineering Student*  
*Project: AI-Based Vernacular Career Mentor — TCSD Assignment*