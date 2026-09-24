# Architecture

## Goal

The system optimizes two competing needs:

1. **Low-friction tracking** for a large number of applications.
2. **Deep preparation** only for applications that justify extra work.

A hybrid architecture is used rather than creating one note for every job.

## Components

### Central application log

`03 Work/Application Database.md` is the single source of truth for:

- application identity
- company / role metadata
- market and source
- current recruitment status
- deadline
- priority and career track
- optional detail-note link
- chronological process history

### Add workflow

`add-application.js`:

- collects structured application metadata
- validates dates
- detects likely duplicates
- generates a stable ID
- optionally creates a detail note
- inserts the application into the appropriate month section

### Update workflow

`update-application.js`:

- identifies applications by stable ID
- updates current status
- updates or removes deadlines
- appends a dated process-history entry
- optionally creates a detail note when an application reaches an assessment/interview stage

### Dashboards

Dataview treats the central log as a lightweight database. The dashboards are read-only views:

- `Overview.md`: KPIs, deadlines, priorities, pipeline, recent applications
- `Applications - UK.md`: UK-specific active/closed/offer views
- `Applications - China.md`: China-specific active/closed/offer views

## Why the status is a child row

Static metadata stays on the parent list item while frequently changing fields live on a dedicated child row:

```text
application metadata
└── current status + deadline
```

The update script can replace the dynamic row without reconstructing the entire application record.

## Failure boundaries

The scripts avoid treating detail notes as the source of truth. If a detail note is absent, the application remains fully trackable from the central log. This keeps the core workflow resilient to optional-note creation or deletion.
