Chinese and English interface support.

- Choose English or 中文 under Settings → Application Flow → Interface language.
- Language preference is saved per vault; settings/dashboard update immediately.
- Forms, buttons, command names, recruitment-stage labels, validation messages and summary counts are translated.
- New preparation note headings follow the selected language; existing notes and user text are untouched.
- Metadata keys and stored market/status/priority values remain stable for compatibility.
- Free-text suggestions preserve their original wording.

Replace main.js, manifest.json and styles.css in .obsidian/plugins/dgracy-application-flow/, preserve data.json, and reload the plugin. Reopen an existing form after changing language.

Automated data, plugin loading, language persistence and mocked form tests pass. Native Obsidian desktop/mobile UI verification remains pending.
