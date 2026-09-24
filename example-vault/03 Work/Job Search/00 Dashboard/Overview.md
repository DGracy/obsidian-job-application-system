# Job Search

> [!info] Overview
> Personal application pipeline, priorities and upcoming actions.

Last updated: `$=dv.date("today").toFormat("yyyy.MM.dd")`

[[03 Work/Job Search/00 Dashboard/Applications - UK|UK Applications]] · [[03 Work/Job Search/00 Dashboard/Applications - China|China Applications]] · [[Analytics|Analytics]]

## Overview

```dataviewjs
const LOG = "03 Work/Application Log";
const closed = new Set(["Rejected", "Withdrawn", "Offer"]);
const lists = dv.page(LOG).file.lists.array();
const parents = lists.filter(p => p.company && p.role && !(p.company === "Company" && p.role === "Role"));
const parentByLine = new Map(parents.map(p => [p.line, p]));
const apps = lists.filter(s => s.status && parentByLine.has(s.parent)).map(s => ({ ...s, app: parentByLine.get(s.parent) }));
const count = predicate => apps.filter(predicate).length;
const cards = [
  ["Active", count(x => !closed.has(x.status)), "applications"],
  ["Assessment", count(x => x.status === "Online Test"), "online tests"],
  ["Interviews", count(x => /^Interview [123]$/.test(x.status)), "in progress"],
  ["Offers", count(x => x.status === "Offer"), "outcomes"],
  ["Total", apps.length, "applications"],
  ["Rejected", count(x => x.status === "Rejected"), "closed"]
];
const html = cards.map(([label, value, note]) => `
  <div style="min-width:0; padding:0.75rem 0.85rem; border:1px solid var(--background-modifier-border); border-radius:8px; background:var(--background-secondary);">
    <div style="font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted);">${label}</div>
    <div style="font-size:1.7rem; line-height:1.25; font-weight:700; color:var(--text-normal); margin-top:0.2rem;">${value}</div>
    <div style="font-size:0.78rem; color:var(--text-muted);">${note}</div>
  </div>`).join("");
const grid = dv.el("div");
grid.style.display = "grid";
grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(145px, 1fr))";
grid.style.gap = "0.65rem";
grid.style.margin = "0.35rem 0 0.5rem";
grid.innerHTML = html;
```

---

## Action Required

### Overdue

```dataviewjs
const LOG = "03 Work/Application Log";
const closed = new Set(["Rejected", "Withdrawn", "Offer"]);
const today = dv.date("today").startOf("day");
const lists = dv.page(LOG).file.lists.array();
const parents = lists.filter(p => p.company && p.role && !(p.company === "Company" && p.role === "Role"));
const byLine = new Map(parents.map(p => [p.line, p]));
const rows = lists.filter(s => s.status && byLine.has(s.parent)).map(s => ({ s, p: byLine.get(s.parent), d: s.deadline ? dv.date(s.deadline) : null }))
  .filter(x => x.d && x.d < today && !closed.has(x.s.status)).sort((a, b) => a.d.ts - b.d.ts);
if (!rows.length) dv.paragraph("No overdue actions.");
else dv.table(["Company", "Position", "Stage", "Deadline", "Priority"], rows.map(x => [x.p.company, x.p.role, x.s.status, x.d.toFormat("yyyy.MM.dd"), x.p.priority || "-"]));
```

### Next 7 Days

```dataviewjs
const LOG = "03 Work/Application Log";
const closed = new Set(["Rejected", "Withdrawn", "Offer"]);
const today = dv.date("today").startOf("day"), horizon = today.plus({ days: 7 });
const lists = dv.page(LOG).file.lists.array();
const parents = lists.filter(p => p.company && p.role && !(p.company === "Company" && p.role === "Role"));
const byLine = new Map(parents.map(p => [p.line, p]));
const rows = lists.filter(s => s.status && byLine.has(s.parent)).map(s => ({ s, p: byLine.get(s.parent), d: s.deadline ? dv.date(s.deadline) : null }))
  .filter(x => x.d && x.d >= today && x.d <= horizon && !closed.has(x.s.status)).sort((a, b) => a.d.ts - b.d.ts);
if (!rows.length) dv.paragraph("No upcoming actions in the next 7 days.");
else dv.table(["Company", "Position", "Stage", "Deadline", "Priority", "Details"], rows.map(x => [x.p.company, x.p.role, x.s.status, x.d.toFormat("yyyy.MM.dd"), x.p.priority || "-", x.p.detail || "-"]));
```

---

## High Priority

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
S.status AS "Stage",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "Deadline",
choice(P.detail, P.detail, "-") AS "Details"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.role
AND P.company != "Company" AND P.role != "Role"
AND P.priority = "High"
AND S.status != "Rejected" AND S.status != "Withdrawn" AND S.status != "Offer"
SORT S.deadline ASC, P.applied DESC
```

---

## Recruitment Pipeline

```dataviewjs
const LOG = "03 Work/Application Log";
const lists = dv.page(LOG).file.lists.array();
const parents = lists.filter(p => p.company && p.role && !(p.company === "Company" && p.role === "Role"));
const byLine = new Map(parents.map(p => [p.line, p]));
const apps = lists.filter(s => s.status && byLine.has(s.parent));
const count = f => apps.filter(f).length;
const stages = [
  ["Applied", count(x => x.status === "Applied")],
  ["Online Test", count(x => x.status === "Online Test")],
  ["Interviews", count(x => /^Interview [123]$/.test(x.status))],
  ["Offer", count(x => x.status === "Offer")],
  ["Rejected", count(x => x.status === "Rejected")],
  ["Withdrawn", count(x => x.status === "Withdrawn")]
];
const max = Math.max(1, ...stages.map(x => x[1]));
const html = stages.map(([label, value]) => `<div style="display:grid; grid-template-columns:100px 28px minmax(80px, 1fr); gap:0.55rem; align-items:center; margin:0.38rem 0;">
  <span style="color:var(--text-normal);">${label}</span><strong>${value}</strong>
  <span style="display:block; height:0.52rem; border-radius:999px; background:var(--background-modifier-border); overflow:hidden;"><span style="display:block; width:${(value / max) * 100}%; height:100%; background:var(--interactive-accent);"></span></span>
</div>`).join("");
dv.el("div", html, { attr: { style: "max-width:620px;" } });
```

---

## Recent Applications

```dataview
TABLE WITHOUT ID
choice(P.detail, P.detail, P.company) AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "Applied",
S.status AS "Stage",
P.priority AS "Priority"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.role
AND P.company != "Company" AND P.role != "Role"
SORT P.applied DESC
LIMIT 8
```

---

## Application Mix

```dataview
TABLE WITHOUT ID
key AS "Track",
length(rows) AS "Applications"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.role
AND P.company != "Company" AND P.role != "Role"
GROUP BY default(P.track, "Unknown")
SORT length(rows) DESC
```

---

## Assessment & Interview Focus

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
S.status AS "Stage",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "Deadline",
P.priority AS "Priority",
choice(P.detail, P.detail, "-") AS "Details"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.role
AND P.company != "Company" AND P.role != "Role"
AND (S.status = "Online Test" OR S.status = "Interview 1" OR S.status = "Interview 2" OR S.status = "Interview 3")
SORT S.deadline ASC
```

---

## Quick Access

- [[03 Work/Job Search/00 Dashboard/Applications - UK|UK Applications]]
- [[03 Work/Job Search/00 Dashboard/Applications - China|China Applications]]
- [[Analytics|Job Search Analytics]]
