# Example Vault

This vault demonstrates every feature of the app. Drop the `example/` folder onto the upload zone to load it.

---

## What to try

### Board view  `▤`
All files with a `status` field appear as Kanban cards.  
Try dragging a card between columns — the frontmatter updates instantly.  
Statuses in this vault: `todo`, `in-progress`, `done`, `blocked`

### Calendar view  `▦`
Two event types appear in the calendar:
- **Violet** — files with a `due:` or `date:` frontmatter field
- **Amber** — inline ISO dates (`2026-05-XX`) mentioned anywhere in the file body

Click any event to see a detail popover with context, then **Open →** to navigate.  
Check May and June 2026 — both have events.

### Graph view  `⬡`
Wiki-links between files are visualised. Node colour = `type` field:
- **Amber** → task
- **Indigo** → project
- **Emerald** → meeting
- **Pink** → contact
- **Gray** → note (no type)

Click **⊟ Filter** (top-right of graph) to filter by type or status.

### Editor  `✎`
Open any file, click **✎** in the toolbar to edit raw markdown.  
**⌘S** saves. Changes persist in-memory and export with **↓ ZIP**.

### Properties panel  `⊟`
In document view, click **⊟** to open the frontmatter panel.  
Edit `type`, `status`, `priority`, `due`, `tags` with dedicated inputs.  
Changes reflect immediately on the Kanban board and graph.

### New file  `+`
Click **+** in the sidebar header to create a file in the current folder.  
The new file opens straight in edit mode.

---

## Vault structure

```
Projects/   — three projects in different states
Tasks/      — five tasks across all four Kanban columns
People/     — three contacts linked to projects and meetings
Meetings/   — four calendar events (May + June 2026)
Notes/      — free-form notes with inline date mentions
```
