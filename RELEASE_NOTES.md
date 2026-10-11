Rename to Application Flow and fix the community plugin ID collision.

- Name: Application Flow; ID: dgracy-application-flow.
- Includes all 1.1.0 market tabs, custom suggestions, independent drafts and collapsed optional fields.
- Application database and preparation notes remain compatible.

Upgrade: disable the old Zhijie Deng plugin entry, quit Obsidian, rename its manually installed folder from job-application-tracker to dgracy-application-flow, and replace main.js, manifest.json and styles.css. Keep data.json if present to preserve path settings. Reopen Obsidian and enable Application Flow.

Do not use the unrelated community entry with the old ID to update this plugin. Real native desktop/mobile UI testing remains pending.
