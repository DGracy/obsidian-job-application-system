# Advanced setup

## Upgrade from 1.0.0 or 1.1.0

The old ID `job-application-tracker` conflicts with another community plugin. Version 1.1.1 uses `dgracy-application-flow` and the name Application Flow.

1. Disable the old **Job Application Tracker** entry whose author is **Zhijie Deng**. Do not install or update the unrelated community entry.
2. Quit Obsidian. Rename your manually installed `.obsidian/plugins/job-application-tracker/` folder to `.obsidian/plugins/dgracy-application-flow/`.
3. Replace `main.js`, `manifest.json`, and `styles.css` with the latest release assets. Preserve `data.json` if present; it contains your configured paths.
4. Reopen Obsidian and enable **Application Flow**. Check your database path in settings.

Application records and preparation notes do not need migration. If you intentionally installed the other author's plugin too, keep it in its own folder and install Application Flow separately.


## Manual installation

Download main.js, manifest.json and styles.css from GitHub Releases. Place them in `<vault>/.obsidian/plugins/dgracy-application-flow/`, reload Obsidian and enable Application Flow. Preserve data.json when replacing files.

## Database paths

Use a vault-relative Markdown file path. Changing paths does not move or delete files. Existing application records remain compatible.
