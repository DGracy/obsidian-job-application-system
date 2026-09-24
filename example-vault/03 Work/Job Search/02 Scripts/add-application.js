/**
 * Job Search - Add Application
 *
 * QuickAdd user script for a central-log + optional-detail-note workflow.
 */
module.exports = async (params) => {
  const { app, quickAddApi } = params;

  const CONFIG = {
    logPath: "03 Work/Application Log.md",
    detailFolder: "03 Work/Job Search/01 Applications",
    statuses: ["Applied", "Online Test", "Interview 1", "Interview 2", "Interview 3", "Offer", "Rejected", "Withdrawn"],
    tracks: ["Data / Analytics", "Product", "Technology", "Finance / M&A", "Strategy", "Operations"],
    cvVersions: ["Data", "Product", "Technology", "Finance", "Strategy", "General"],
  };

  const today = window.moment().format("YYYY-MM-DD");
  const cancel = () => { params.abort(); throw new Error("QuickAdd cancelled"); };
  const clean = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").replace(/[\[\]]/g, "").trim();
  const normalize = (v) => clean(v).toLocaleLowerCase();
  const validDate = (v) => window.moment(v, "YYYY-MM-DD", true).isValid();
  const safeName = (v) => clean(v).replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ");
  const yaml = (v) => JSON.stringify(String(v ?? ""));

  const required = async (title, hint = "") => {
    const value = clean(await quickAddApi.inputPrompt(title, hint));
    if (!value) cancel();
    return value;
  };

  const optional = async (title, hint = "可留空") => {
    const value = await quickAddApi.inputPrompt(title, hint);
    if (value == null) cancel();
    return clean(value);
  };

  const pick = async (title, values, custom = false) => {
    const value = await quickAddApi.suggester(values, values, title, custom);
    if (value == null || value === "") cancel();
    return clean(value);
  };

  const ensureFolder = async (path) => {
    let current = "";
    for (const part of path.split("/")) {
      current = current ? `${current}/${part}` : part;
      if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
    }
  };

  let logFile = app.vault.getAbstractFileByPath(CONFIG.logPath);
  if (!logFile) logFile = await app.vault.create(CONFIG.logPath, "# Application Log\n");
  let log = await app.vault.read(logFile);

  const country = (await pick("选择投递市场", ["🇬🇧 UK", "🇨🇳 China"])) === "🇬🇧 UK" ? "UK" : "China";
  const countryCode = country === "UK" ? "UK" : "CN";
  const company = await required(`${country}｜公司名称`, country === "UK" ? "例如：Example Analytics" : "例如：示例科技");
  const role = await required(`${country}｜岗位名称`, "例如：Data Analyst Graduate Scheme");
  const type = await pick(`${country}｜岗位类型`, ["Graduate Scheme", "Full-time", "Internship", "Part-time", "Unknown"]);
  const sponsor = country === "UK" ? await pick("UK｜是否提供签证担保", ["Unknown", "Yes", "No"]) : "";
  const sourceList = country === "UK"
    ? ["LinkedIn", "targetjobs", "Company Website", "UCL Career", "Greenhouse", "Indeed", "Referral"]
    : ["Boss直聘", "公司官网", "招聘平台", "LinkedIn", "内推"];
  const source = await pick(`${country}｜投递渠道（可直接输入新来源）`, sourceList, true);

  let applied = await optional(`${country}｜投递日期`, `YYYY-MM-DD；默认今天：${today}`);
  applied = applied || today;
  if (!validDate(applied)) { new Notice("投递日期格式错误，请使用 YYYY-MM-DD"); cancel(); }

  const status = await pick(`${country}｜当前阶段`, CONFIG.statuses);
  const deadline = await optional(`${country}｜当前阶段截止日期`, "YYYY-MM-DD；没有就留空");
  if (deadline && !validDate(deadline)) { new Notice("截止日期格式错误，请使用 YYYY-MM-DD"); cancel(); }

  const website = await optional(`${country}｜岗位链接`);
  const track = await pick("求职方向 Track（可直接输入自定义内容）", CONFIG.tracks, true);
  const priority = await pick("申请优先级", ["High", "Medium", "Low"]);
  const cvVersion = await pick("本次使用的 CV Version（可直接输入自定义内容）", CONFIG.cvVersions, true);

  const duplicate = log.split("\n").some((line) => {
    if (!line.startsWith("- **")) return false;
    const companyValue = line.match(/\[company::\s*([^\]]+)\]/)?.[1]?.trim() || "";
    const roleValue = line.match(/\[role::\s*([^\]]+)\]/)?.[1]?.trim() || "";
    const appliedValue = line.match(/\[applied::\s*([^\]]+)\]/)?.[1]?.trim() || "";
    return normalize(companyValue) === normalize(company) && normalize(roleValue) === normalize(role) && appliedValue === applied;
  });

  if (duplicate && !await quickAddApi.yesNoPrompt("检测到可能重复的投递", `${company} — ${role}\n${applied}\n\n仍然继续新增？`)) cancel();

  const prefix = `${countryCode}-${applied.replace(/-/g, "")}-`;
  const idRegex = new RegExp(`\\[id::\\s*${prefix}(\\d+)\\]`, "g");
  let max = 0, match;
  while ((match = idRegex.exec(log)) !== null) max = Math.max(max, Number(match[1]));
  const id = `${prefix}${String(max + 1).padStart(2, "0")}`;

  const createDetail = await quickAddApi.yesNoPrompt(
    "是否创建岗位详情页？",
    "建议用于高优先级、需要定制 CV 或后续测评/面试的岗位。"
  );

  let detailLink = "";
  let detailPath = "";

  if (createDetail) {
    await ensureFolder(CONFIG.detailFolder);
    const summary = await quickAddApi.wideInputPrompt("详情页｜Role Summary / JD 摘要", "粘贴或概括核心内容");
    if (summary == null) cancel();
    const requirements = await quickAddApi.wideInputPrompt("详情页｜Key Requirements", "粘贴或概括核心要求");
    if (requirements == null) cancel();

    const base = `${applied} - ${safeName(company)} - ${safeName(role)}`;
    let filename = base, n = 2;
    while (app.vault.getAbstractFileByPath(`${CONFIG.detailFolder}/${filename}.md`)) filename = `${base} (${n++})`;
    detailPath = `${CONFIG.detailFolder}/${filename}.md`;
    detailLink = `[[${detailPath.slice(0, -3)}]]`;

    await app.vault.create(detailPath, [
      "---",
      `application_id: ${yaml(id)}`,
      `company: ${yaml(company)}`,
      `role: ${yaml(role)}`,
      `country: ${yaml(country)}`,
      `track: ${yaml(track)}`,
      `priority: ${yaml(priority)}`,
      `cv_version: ${yaml(cvVersion)}`,
      `applied: ${yaml(applied)}`,
      "---", "",
      `# ${company} — ${role}`, "",
      "## Role Summary", "", String(summary).trim(), "",
      "## Key Requirements", "", String(requirements).trim(), "",
      "## My Fit", "", "### Strong Matches", "", "- ", "", "### Gaps", "", "- ", "",
      "## Application Strategy", "", "### CV Changes", "", "- ", "", "### Why This Role", "", "- ", "", "### Why This Company", "", "- ", "",
      "## Assessment / Interview Preparation", "", "## Notes", "", "## Outcome Review", "",
      "### What Worked", "", "- ", "", "### What Could Be Improved", "", "- ", ""
    ].join("\n"));
  }

  const meta = [
    `[id:: ${id}]`, `[country:: ${country}]`, `[company:: ${company}]`, `[role:: ${role}]`, `[type:: ${type}]`
  ];
  if (country === "UK") meta.push(`[sponsor:: ${sponsor}]`);
  meta.push(`[source:: ${source}]`, `[applied:: ${applied}]`, `[track:: ${track}]`, `[priority:: ${priority}]`, `[cv_version:: ${cvVersion}]`);
  if (detailLink) meta.push(`[detail:: ${detailLink}]`);

  const entry = [
    `- **${company} — ${role}** ${meta.join(" ")}`,
    `  - 🔄 [status:: ${status}]${deadline ? ` [deadline:: ${deadline}]` : ""}`,
    `  - Website：${website}`,
    detailLink ? `  - JD：见 ${detailLink}` : "  - JD：",
    detailLink ? `  - Requirements：见 ${detailLink}` : "  - Requirements：",
    "  - 流程：",
    `    - ${applied} Submitted`
  ].join("\n");

  const preview = [
    `${company} — ${role}`,
    `ID: ${id}`,
    `Country: ${country}`,
    `Track: ${track}`,
    `Priority: ${priority}`,
    `CV: ${cvVersion}`,
    `Status: ${status}`,
    deadline ? `Deadline: ${deadline}` : "Deadline: -",
    `Detail page: ${createDetail ? "Yes" : "No"}`
  ].join("\n");

  if (!await quickAddApi.yesNoPrompt("确认新增投递？", preview)) {
    if (detailPath) {
      const file = app.vault.getAbstractFileByPath(detailPath);
      if (file) await app.vault.delete(file);
    }
    cancel();
  }

  try {
    log = await app.vault.read(logFile);
    const month = applied.slice(0, 7);
    const dotted = month.replace("-", ".");
    const lines = log.split("\n");
    const monthIndex = lines.findIndex(line => line.trim() === `## ${month}` || line.trim() === `## ${dotted}`);
    let output;

    if (monthIndex < 0) {
      output = `${log.trimEnd()}\n\n## ${month}\n${entry}\n`;
    } else {
      let end = lines.length;
      for (let i = monthIndex + 1; i < lines.length; i++) {
        if (/^##\s+/.test(lines[i])) { end = i; break; }
      }
      const before = lines.slice(0, end);
      while (before.length && before.at(-1) === "") before.pop();
      output = [...before, "", ...entry.split("\n"), "", ...lines.slice(end)].join("\n");
    }

    await app.vault.modify(logFile, output);
  } catch (error) {
    if (detailPath) {
      const file = app.vault.getAbstractFileByPath(detailPath);
      if (file) await app.vault.delete(file);
    }
    throw error;
  }

  new Notice(`已录入：${company} — ${role}${detailLink ? "（已创建详情页）" : ""}`);
};
