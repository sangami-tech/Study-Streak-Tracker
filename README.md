# 📓 Study Streak Tracker

A minimal, no-backend web app for tracking your daily study habit — built to look and feel like a paper study logbook instead of a generic dashboard.

**[Try the app](#) — open `index.html` in any browser, no install required.**

## Features

- **Streak counter** — tracks your current and best study streaks, calculated from the days you've logged.
- **This week ledger** — a quick 7-day tally of which days you've studied.
- **Calendar page** — click any past or present day to log a session (subject, minutes, notes) or edit an existing one.
- **Stats footer** — current streak, best streak, total days logged, and total hours studied.
- **Local-first** — all data is saved in your browser's `localStorage`. Nothing is sent to a server.
- **Backup / restore** — export your data to a JSON file, or import a previous backup.

## Running it locally

No build step or dependencies. Just open the file:

```bash
git clone <your-repo-url>
cd study-streak-tracker
open index.html   # macOS
# or just double-click index.html
```

Or serve it locally:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```


## Project structure

```
study-streak-tracker/
├── index.html   # page structure
├── style.css    # notebook-styled visual design
├── script.js    # streak logic, calendar rendering, storage
└── README.md
```

## How the streak logic works

- A day counts as "studied" if it has a logged entry.
- The **current streak** counts consecutive logged days ending today (or yesterday, if you haven't logged today yet — so the streak doesn't reset the moment the clock strikes midnight).
- The **best streak** is the longest run of consecutive logged days in your history.


## License

MIT — do whatever you'd like with it.
