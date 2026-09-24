/**
 * Job Search - Update Application Status
 *
 * Selects an application by stable ID, updates status/deadline,
 * appends process history, and can create a detail note when useful.
 */
module.exports = async (params) => {
  const { app, quickAddApi } = params;

  const CONFIG = {
    logPath: "03 Work/Application Log.md",
    detailFolder: "03 Work/Job Search/01 Applications",
    statuses: ["Applied", "Online Test", "Interview 1", "Interview 2", "Interview 3", "Offer", "Rejected", "Withdrawn"],
  };

  const file = app.vault.getAbstractFileByPath(CONFIG.logPath);
  const today = window.moment().format("YYYY-MM-DD");
  const cancel = () => { params.abort(); throw new Error("QuickAdd cancelled"); };
  const clean = (value) => String(value ?? "").replace(/[\r\n]+/g, " ").replace(/[\[\]]/g, "").trim();
  const validDate = (value) => !value || window.moment(value, "YYYY-MM-DD", true).isValid();
  const safeName = (value) => clean(value).replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ");
  const yaml = (v) => JSON.stringify(String(v ?? ""));

  const ensureFolder = async (path) => {
    let current = "";
    for (const part of path.split("/")) {
      current = current ? `${current}/${part}` : part;
      if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
    }
  };

  if (!file) { new Notice("Application Log.md not found"); cancel(); }

  const content = await app.vault.read(file);
  const lines = content.split("\n");
  const records = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("- **")) continue;
    const get = (key) => lines[i].match(new RegExp(`\\[${key}::\\s*([^\\]]+)\\]`))?.[1]?.trim() || "";
    const record = {
      start: i,
      id: get("id"),
      company: get("company"),
      role: get("role"),
      country: get("country"),
      applied: get("applied"),
      track: get("track"),
      priority: get("priority"),
      cvVersion: get("cv_version"),
    };
    if (record.id && record.company && record.role) records.push(record);
  }

  if (!records.length) { new Notice("未找到带 application id 的 V2 投递记录"); cancel(); }

  const labels = records.map(r => `${r.id}｜${r.country === "UK" ? "🇬🇧" : "🇨🇳"} ${r.company} — ${r.role}`);
  const selected = await quickAddApi.suggester(labels, records, "按 application id 选择要更新的投递");
  if (!selected) cancel();

  const status = await quickAddApi.suggester(CONFIG.statuses, CONFIG.statuses, "选择当前阶段");
  if (!status) cancel();

  const deadlineResult = await quickAddApi.inputPrompt("截止日期（可留空）", "YYYY-MM-DD；留空会删除旧截止日期");
  if (deadlineResult == null) cancel();
  const deadline = clean(deadlineResult);
  if (!validDate(deadline)) { new Notice("截止日期格式错误，请使用 YYYY-MM-DD"); cancel(); }

  const noteResult = await quickAddApi.inputPrompt("流程备注（可留空）", "例如：收到测评邮件 / 已预约一面");
  if (noteResult == null) cancel();
  const note = clean(noteResult);

  let nextStart = lines.length;
  for (let i = selected.start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("- **")) { nextStart = i; break; }
  }

  let blockEnd = nextStart;
  let statusIndex = -1, processIndex = -1;
  for (let i = selected.start + 1; i < blockEnd; i++) {
    if (/^  - 🔄 \[status::/.test(lines[i])) statusIndex = i;
    if (lines[i] === "  - 流程：") processIndex = i;
  }

  const statusLine = `  - 🔄 [status:: ${status}]${deadline ? ` [deadline:: ${deadline}]` : ""}`;
  if (statusIndex >= 0) lines[statusIndex] = statusLine;
  else {
    lines.splice(selected.start + 1, 0, statusLine);
    blockEnd++;
    if (processIndex >= 0) processIndex++;
  }

  const history = `${today} ${status}${deadline ? `（截止：${deadline}）` : ""}${note ? `｜${note}` : ""}`;
  if (processIndex >= 0) lines.splice(processIndex + 1, 0, `    - ${history}`);
  else {
    lines.splice(blockEnd, 0, "  - 流程：", `    - ${history}`);
    blockEnd += 2;
  }

  const parent = lines[selected.start];
  const detailMatch = parent.match(/\[detail::\s*\[\[([^|\]]+)/);
  const detailTarget = detailMatch?.[1]?.trim() || "";
  const existingDetail = detailTarget ? app.metadataCache.getFirstLinkpathDest(detailTarget, CONFIG.logPath) : null;
  const needsDetail = status === "Online Test" || status.startsWith("Interview");

  let createdDetailPath = "";

  if (needsDetail && !existingDetail) {
    const create = await quickAddApi.yesNoPrompt(
      "尚无有效岗位详情页，是否自动创建？",
      `${selected.id}\n${selected.company} — ${selected.role}\n\n将创建准备、笔记和复盘模板，并写回该投递记录。`
    );

    if (create) {
      await ensureFolder(CONFIG.detailFolder);
      const base = `${selected.applied || today} - ${safeName(selected.company)} - ${safeName(selected.role)}`;
      let filename = base, number = 2;
      while (app.vault.getAbstractFileByPath(`${CONFIG.detailFolder}/${filename}.md`)) filename = `${base} (${number++})`;
      const detailPath = `${CONFIG.detailFolder}/${filename}.md`;
      createdDetailPath = detailPath;

      await app.vault.create(detailPath, [
        "---",
        `application_id: ${yaml(selected.id)}`,
        `company: ${yaml(selected.company)}`,
        `role: ${yaml(selected.role)}`,
        `country: ${yaml(selected.country)}`,
        `track: ${yaml(selected.track || "Unknown")}`,
        `priority: ${yaml(selected.priority || "Medium")}`,
        `cv_version: ${yaml(selected.cvVersion || "General")}`,
        `applied: ${yaml(selected.applied || "")}`,
        "---", "",
        `# ${selected.company} — ${selected.role}`, "",
        "## Role Summary", "", "## Key Requirements", "", "## My Fit", "",
        "### Strong Matches", "", "- ", "", "### Gaps", "", "- ", "",
        "## Application Strategy", "", "### CV Changes", "", "- ", "",
        "### Why This Role", "", "- ", "", "### Why This Company", "", "- ", "",
        "## Assessment / Interview Preparation", "", "## Notes", "", "## Outcome Review", "",
        "### What Worked", "", "- ", "", "### What Could Be Improved", "", "- ", ""
      ].join("\n"));

      const link = `[[${detailPath.slice(0, -3)}]]`;
      lines[selected.start] = lines[selected.start]
        .replace(/\s*\[detail::\s*\[\[[^\]]+\]\]\]/, "")
        .trimEnd() + ` [detail:: ${link}]`;
    }
  }

  try {
    await app.vault.modify(file, lines.join("\n"));
  } catch (error) {
    if (createdDetailPath) {
      const detailFile = app.vault.getAbstractFileByPath(createdDetailPath);
      if (detailFile) await app.vault.delete(detailFile);
    }
    throw error;
  }

  new Notice(`已更新：${selected.id}｜${selected.company} — ${status}${createdDetailPath ? "（已创建详情页）" : ""}`);
};
