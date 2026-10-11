Initial standalone Obsidian plugin release.

- Native application entry and update forms; no QuickAdd or Dataview dependency.
- Central Markdown database compatible with the original example workflow.
- Stable application IDs, duplicate checks, stage/deadline updates and history.
- Optional Markdown preparation notes with job description and requirements.
- Searchable dashboard with UK, China and other-market filtering.
- Configurable database and preparation-note paths.

Manual installation: download main.js, manifest.json and styles.css into <vault>/.obsidian/plugins/job-application-tracker/, reload Obsidian, and enable Job Application Tracker under Community plugins. The plugin has not yet been listed in the community directory.

Validation: JavaScript syntax checks, data-model regression tests against the original demo, and mocked Obsidian plugin loading. Real desktop/mobile UI testing remains to be completed. Back up your database before using a first release with live applications.
