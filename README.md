# Application Flow

A standalone Obsidian community plugin for tracking applications in a central Markdown database. **QuickAdd and Dataview are not required for the plugin.** The original script/template workflow remains available below.

## Install the plugin

Until accepted into the community directory, install manually:

1. Download `main.js`, `manifest.json`, and `styles.css` from [GitHub Releases](https://github.com/DGracy/obsidian-job-application-system/releases).
2. Place them in `<vault>/.obsidian/plugins/dgracy-application-flow/`.
3. Reload Obsidian and enable **Application Flow** in Settings → Community plugins.
4. Use the briefcase ribbon icon or the command **Application Flow: Add application**.
5. Open **Application Flow: Open dashboard / update application** to search, filter, and update applications.

Settings let you choose the Markdown database file and preparation notes folder. Defaults match the original workflow. Existing records are read without importing, copying, or replacing the database. Initialization happens only when saving an application, not when enabling the plugin. Changing settings does not move existing files.

The new form can save a job description and requirements to an optional preparation note. Enable the preparation-note toggle when adding or updating a role. Dates use `YYYY-MM-DD`; clear the deadline field to remove the old deadline. Exact duplicate market/company/role/application-date entries are rejected. Other markets use an `OTHER` ID prefix.

The Add application form has UK, China, and Other tabs with independent drafts. Sponsorship is shown and saved only for UK. Other requires a country/region name, stored as the actual market. Role type and source accept custom text and offer market-specific suggestions plus values from your existing records. More information is collapsed initially; JD and requirements are shown only when preparation notes are enabled. Closing the form discards unsaved drafts.

## Upgrade from 1.0.0 or 1.1.0

The old ID `job-application-tracker` conflicts with another community plugin. Version 1.1.1 uses `dgracy-application-flow` and the name Application Flow.

1. Disable the old **Job Application Tracker** entry whose author is **Zhijie Deng**. Do not install or update the unrelated community entry.
2. Quit Obsidian. Rename your manually installed `.obsidian/plugins/job-application-tracker/` folder to `.obsidian/plugins/dgracy-application-flow/`.
3. Replace `main.js`, `manifest.json`, and `styles.css` with the 1.1.1 release assets. Preserve `data.json` if present; it contains your configured paths.
4. Reopen Obsidian and enable **Application Flow**. Check your database path in settings.

Application records and preparation notes do not need migration. If you intentionally installed the other author's plugin too, keep it in its own folder and install Application Flow separately.

## Language / 语言

In Settings → Application Flow → Interface language, choose **English** or **中文**. The selection is saved for this vault. Settings and dashboards update immediately; reopen an already-open application form to see the chosen language.

在「设置 → Application Flow → 界面语言」选择中文或 English。语言选择会保存在当前仓库中。表单、按钮、招聘阶段、总览和提示支持双语；新建准备笔记的标题使用当前语言。

Language changes translate the interface, not user-entered text or existing notes. Stored market/status/priority values and metadata keys remain stable for compatibility with existing dashboards and scripts. Free-text role/source suggestions retain their original wording.

## Development and validation

Node.js 22 or newer; no npm dependencies are required.

```sh
npm run check
npm run build
npm test
```

`src/plugin.js` uses the Obsidian runtime API. `src/model.js` contains Markdown data operations. `build.js` bundles both into `main.js`; commit the generated file alongside source changes. The release workflow validates the bundle and publishes a GitHub Release only when the manifest version has no existing release. Increment `manifest.json`, `package.json`, and `versions.json` for subsequent releases.

Automated checks cover the data model and mocked plugin loading. Real Obsidian desktop/mobile interface testing is still required. `isDesktopOnly: false` indicates that the implementation avoids desktop-only APIs; it does not claim completed mobile testing. Back up your database before first use.

No telemetry, network requests, or external services are used by the plugin. Application data stays in your vault. Original fictional examples remain unchanged.

---

## Original QuickAdd / Dataview workflow

# Application Flow for Obsidian

A metadata-driven job application workflow built with **Obsidian**, **QuickAdd**, **Dataview**, and **JavaScript**.

The system is designed for high-volume job application tracking without creating a separate note for every application. A central application database stores structured metadata and recruitment status, while dedicated detail notes are created only for high-priority roles, assessments, interviews, or applications that require deeper preparation.

## What it does

- Unified application entry workflow with country-specific fields, demonstrated for the UK and China
- Stable application IDs for reliable updates
- Duplicate-application warning
- Recruitment-stage and deadline tracking
- Automatic process-history logging
- Optional application detail pages
- Automatic detail-page creation when an application reaches assessment/interview stages
- Priority, career-track, source, sponsorship, and CV-version metadata
- Real-time overview and country-specific dashboards powered by Dataview
- Separation between structured tracking data and deeper application research

## Architecture

```mermaid
flowchart TD
    A[QuickAdd: Add Application] --> C[Application Database]
    B[QuickAdd: Update Application] --> C

    C --> D[Overview Dashboard]
    C --> E[Country-Specific Dashboards]

    E --> E1[Applications - UK]
    E --> E2[Applications - China]

    A -. optional .-> G[Application Detail Notes]
    B -. assessment / interview, optional .-> G
    C -. detail link .-> G
```

The Application Database is the single source of truth for status and deadlines.

The country-specific dashboards are filtered views built on top of the same data model. The UK and China dashboards in this repository are example implementations, and the same structure can be extended to other countries or regions.

Application detail notes are optional and deliberately do **not** duplicate live recruitment status.

## Repository layout

```text
03 Work/
├── Application Database.md
└── Job Search/
    ├── 00 Dashboard/
    │   ├── Overview.md
    │   ├── Applications - UK.md
    │   └── Applications - China.md
    ├── 01 Applications/
    └── 02 Scripts/
        ├── add-application.js
        └── update-application.js
```

All application data in this repository is fictional demo data.

## Requirements

Install these Obsidian community plugins:

- **QuickAdd** — runs the add/update JavaScript workflows
- **Dataview** — renders dashboards and KPI views

Dataview JavaScript queries must be enabled for the Overview dashboard.

## Setup

1. Copy `example-vault/03 Work/` into your Obsidian vault, or reproduce the same folder structure.
2. In QuickAdd, create a Macro/User Script command for:
   - `03 Work/Job Search/02 Scripts/add-application.js`
   - `03 Work/Job Search/02 Scripts/update-application.js`
3. Open `03 Work/Job Search/00 Dashboard/Overview.md`.
4. Replace the fictional records in `03 Work/Application Database.md` with your own data.

The default script paths are intentionally centralized at the top of each script so they can be changed if your vault uses a different folder structure.

## Core data model

Each application has stable parent-level metadata:

```markdown
- **Northstar Analytics — Graduate Data Analyst**
  [id:: UK-20260910-01]
  [country:: UK]
  [company:: Northstar Analytics]
  [role:: Graduate Data Analyst]
  [type:: Graduate Scheme]
  [sponsor:: Unknown]
  [source:: Company Website]
  [applied:: 2026-09-10]
  [track:: Data / Analytics]
  [priority:: High]
  [cv_version:: Data]
  [detail:: [[03 Work/Job Search/01 Applications/2026-09-10 - Northstar Analytics - Graduate Data Analyst]]]
    - 🔄 [status:: Online Test] [deadline:: 2026-09-28]
```

Dynamic recruitment information lives on the child status row. This makes status updates safe while keeping the parent metadata stable.

See [`docs/data-model.md`](docs/data-model.md) for the complete schema.

## Design Principles

### Central database instead of one note per application

High-volume job searching can generate dozens of low-value notes. The Application Database keeps entry and scanning fast while remaining queryable through Dataview.

### Selective detail notes

A dedicated note is created only when deeper preparation is useful. This keeps the vault small and separates operational tracking from research and interview preparation.

### Stable application IDs

Updates target an application ID rather than relying on company + role text. This avoids ambiguity when the same employer or role is applied to more than once.

### Status history without duplicating state

The current status is stored once, while each change is appended to the process history for traceability.

## Privacy

Do not publish your live application log without reviewing it first. Real job-search data may contain recruiter details, application URLs, candidate IDs, private notes, or commercially sensitive information.

This repository intentionally uses fictional data so the system can be demonstrated without exposing personal application history.

## License

MIT License. See [`LICENSE`](LICENSE).
