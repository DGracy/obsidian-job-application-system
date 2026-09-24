# Data Model

## Parent-level fields

| Field | Purpose | Example |
|---|---|---|
| `id` | Stable application identifier | `UK-20260910-01` |
| `country` | Market | `UK`, `China` |
| `company` | Employer | `Northstar Analytics` |
| `role` | Position | `Graduate Data Analyst` |
| `type` | Employment/program type | `Graduate Scheme` |
| `sponsor` | UK visa sponsorship signal | `Yes`, `No`, `Unknown` |
| `source` | Application source | `LinkedIn`, `Company Website` |
| `applied` | Application date | `2026-09-10` |
| `track` | Career track | `Data / Analytics` |
| `priority` | Application priority | `High`, `Medium`, `Low` |
| `cv_version` | CV variant actually used | `Data`, `Product`, `General` |
| `detail` | Optional detail-note link | Obsidian wiki link |

China records intentionally omit `sponsor`.

## Dynamic child fields

| Field | Purpose |
|---|---|
| `status` | Current recruitment stage |
| `deadline` | Current-stage deadline, if one exists |

Supported default statuses:

- Applied
- Online Test
- Interview 1
- Interview 2
- Interview 3
- Offer
- Rejected
- Withdrawn

## Example

```markdown
- **Northstar Analytics — Graduate Data Analyst** [id:: UK-20260910-01] [country:: UK] [company:: Northstar Analytics] [role:: Graduate Data Analyst] [type:: Graduate Scheme] [sponsor:: Unknown] [source:: Company Website] [applied:: 2026-09-10] [track:: Data / Analytics] [priority:: High] [cv_version:: Data]
  - 🔄 [status:: Online Test] [deadline:: 2026-09-28]
  - Website：https://example.com/jobs/data-analyst
  - JD：
  - Requirements：
  - 流程：
    - 2026-09-10 Submitted
```

## Detail-note schema

Detail notes are optional and are not the source of truth for status/deadline.

```yaml
---
application_id: "UK-20260910-01"
company: "Northstar Analytics"
role: "Graduate Data Analyst"
country: "UK"
track: "Data / Analytics"
priority: "High"
cv_version: "Data"
applied: "2026-09-10"
---
```

Typical note sections:

- Role Summary
- Key Requirements
- My Fit
- Strong Matches
- Gaps
- Application Strategy
- CV Changes
- Why This Role
- Why This Company
- Assessment / Interview Preparation
- Notes
- Outcome Review
