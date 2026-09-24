# 🇨🇳 中国求职看板

> 数据来源：[[03 Work/Application Log|Application Log]]

## ⏰ 近期截止

```dataview
TABLE WITHOUT ID
P.company AS "公司",
P.role AS "岗位",
S.status AS "当前阶段",
P.priority AS "优先级",
dateformat(S.deadline, "yyyy.MM.dd") AS "截止日期",
choice(P.detail, P.detail, "-") AS "详情"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "China"
AND S.deadline
AND S.deadline >= date(today)
AND S.status != "Rejected" AND S.status != "Offer" AND S.status != "Withdrawn"
SORT S.deadline ASC
```

---

## 🚀 测评 / 面试中

```dataview
TABLE WITHOUT ID
P.company AS "公司",
P.role AS "岗位",
default(P.track, "Unknown") AS "方向",
S.status AS "当前阶段",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "截止日期",
P.priority AS "优先级",
choice(P.detail, P.detail, "-") AS "详情"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "China"
AND (S.status = "Online Test" OR S.status = "Interview 1" OR S.status = "Interview 2" OR S.status = "Interview 3")
SORT S.deadline ASC
```

---

## 📋 进行中的申请

```dataview
TABLE WITHOUT ID
P.company AS "公司",
P.role AS "岗位",
default(P.track, "Unknown") AS "方向",
P.type AS "类型",
P.source AS "渠道",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "投递日期",
S.status AS "当前阶段",
choice(S.deadline, dateformat(S.deadline, "yyyy.MM.dd"), "-") AS "截止日期"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "China"
AND S.status != "Rejected" AND S.status != "Offer" AND S.status != "Withdrawn"
SORT P.applied DESC
```

---

## 🎯 Offer

```dataview
TABLE WITHOUT ID
P.company AS "公司",
P.role AS "岗位",
default(P.track, "Unknown") AS "方向",
P.type AS "类型",
P.source AS "渠道",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "投递日期",
choice(P.detail, P.detail, "-") AS "详情"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "China" AND S.status = "Offer"
SORT P.applied DESC
```

---

## 🗃️ 已结束

```dataview
TABLE WITHOUT ID
P.company AS "公司",
P.role AS "岗位",
default(P.track, "Unknown") AS "方向",
P.type AS "类型",
P.source AS "渠道",
choice(P.applied, dateformat(P.applied, "yyyy.MM.dd"), "-") AS "投递日期",
S.status AS "结果"
FLATTEN file.lists AS S
WHERE file.name = "Application Log" AND S.status
FLATTEN filter(file.lists, (P) => P.line = S.parent) AS P
WHERE P.company AND P.country = "China"
AND (S.status = "Rejected" OR S.status = "Withdrawn")
SORT P.applied DESC
```
