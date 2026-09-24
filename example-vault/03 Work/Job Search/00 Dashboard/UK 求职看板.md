# 🇬🇧 UK Applications

> Data source: [[03 Work/找工投递记录|Application Log]]

## ⏰ Upcoming Deadlines

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
S.status AS "Stage",
P.priority AS "Priority",
dateformat(S.deadline, "yyyy.MM.dd") AS "Deadline",
choice(P.detail, P.detail, "-") AS "Details"
FLATTEN file.lists AS S
WHERE file.name = "找工投递记录" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "UK"
AND S.deadline
AND S.deadline >= date(today)
AND S.status != "Rejected" AND S.status != "Offer" AND S.status != "Withdrawn"
SORT S.deadline ASC
```

---

## 🚀 Assessment / Interview

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
S.status AS "Current Stage",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "Deadline",
P.priority AS "Priority",
choice(P.detail, P.detail, "-") AS "Details"
FLATTEN file.lists AS S
WHERE file.name = "找工投递记录" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "UK"
AND (S.status = "Online Test" OR S.status = "Interview 1" OR S.status = "Interview 2" OR S.status = "Interview 3")
SORT S.deadline ASC
```

---

## 📋 Active Applications

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
P.type AS "Type",
P.sponsor AS "Sponsor",
P.source AS "Source",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "Applied",
S.status AS "Status",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "Deadline"
FLATTEN file.lists AS S
WHERE file.name = "找工投递记录" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "UK"
AND S.status != "Rejected" AND S.status != "Offer" AND S.status != "Withdrawn"
SORT P.applied DESC
```

---

## 🎯 Offers

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
P.type AS "Type",
P.sponsor AS "Sponsor",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "Applied",
choice(P.detail, P.detail, "-") AS "Details"
FLATTEN file.lists AS S
WHERE file.name = "找工投递记录" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "UK" AND S.status = "Offer"
SORT P.applied DESC
```

---

## 🗃 Closed Applications

```dataview
TABLE WITHOUT ID
P.company AS "Company",
P.role AS "Position",
default(P.track, "Unknown") AS "Track",
P.type AS "Type",
P.sponsor AS "Sponsor",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "Applied",
S.status AS "Result"
FLATTEN file.lists AS S
WHERE file.name = "找工投递记录" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "UK"
AND (S.status = "Rejected" OR S.status = "Withdrawn")
SORT P.applied DESC
```
