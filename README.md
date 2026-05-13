# Obsidian CRM

A local-first project operating system built on top of [Obsidian](https://obsidian.md) vaults. Load a vault from a local folder or `.zip` archive and manage tasks, projects, contacts, and meetings — all in the browser, all without uploading files to any server.

## Features

### Vault
- **Vault loading** — drag-and-drop a folder or `.zip` archive; parsing happens entirely in the browser
- **File tree navigation** — collapsible sidebar with tab-based navigation scoped to top-level folders
- **File creation** — create new `.md` files directly from the sidebar; file opens immediately in the editor
- **Export** — download the full vault (including unsaved edits) as a `.zip`
- **Dirty tracking** — amber dot on any file with unsaved in-memory changes

### Editing
- **Markdown editor** — full-content textarea with Cmd+S save shortcut and save confirmation toast
- **Frontmatter panel** — right-sidebar field editor for `type`, `status`, `priority`, `due`, `tags`, and custom fields; add or delete fields inline

### Views
| View | Description |
|---|---|
| Document | Rendered GitHub Flavored Markdown with wiki-link resolution |
| Editor | Raw markdown editor with frontmatter panel |
| Graph | Interactive node graph (React Flow) — click a node to open the file |
| Split | Document and graph side by side |
| Kanban | Files grouped by `status` frontmatter field; drag cards to change status |
| Calendar | Monthly grid showing `due`/`date` frontmatter events and inline ISO date mentions (`2026-05-30`) |

### Graph
- Node color by `type` frontmatter (task, project, meeting, contact, note)
- Status badge dot per node
- Filter panel — toggle visible types and statuses; live node/edge count

### Calendar
- Frontmatter events (violet) from `due` or `date` fields
- Inline date events (amber) scanned from the markdown body
- Click any event for a popover with file details, context snippet, and an "Open →" button

### AI Chat
- Ask questions about your vault; the assistant receives your notes as context and streams answers in real time
- Requires your own Anthropic API key (stored in-session only, sent only to `api.anthropic.com`)

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 + Rolldown / Babel (React Compiler) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Zustand v5 |
| Graph | @xyflow/react (React Flow) |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| YAML | js-yaml |
| ZIP | JSZip |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Notifications | react-toastify |
| Animations | Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app runs at `http://localhost:5173`.

### Production build

```bash
pnpm build
pnpm preview   # serve the dist/ folder locally
```

## Usage

1. Open the app in a browser.
2. Drag your Obsidian vault folder onto the drop zone, **or** drag/click to select a `.zip` export.
3. The vault is parsed client-side — no files leave your machine.
4. Browse files in the sidebar; use the top tabs to navigate between top-level folders.
5. Switch views with the view switcher: Document → Graph → Split → Kanban → Calendar.
6. Edit a file with the pencil icon; save with Cmd+S or the Save button.
7. Open the frontmatter panel (sidebar icon) to edit structured fields.
8. Click the chat button (bottom-right) and enter your Anthropic API key to ask questions about your notes.

## Example Vault

The `example/` folder contains a ready-made vault that demonstrates every feature:

```
example/
├── Projects/      # Alpha Launch (in-progress), Beta Features (todo), Legacy Migration (done)
├── Tasks/         # 5 tasks across all 4 Kanban statuses, p1–p3 priorities
├── People/        # Alice Chen, Bob Martinez, Carol Kim (contact nodes in graph)
├── Meetings/      # Sprint Planning, Design Review, Stakeholder Sync, Q2 Retrospective
└── Notes/         # Architecture Overview, API Design Notes, Onboarding Guide
```

Drop the `example/` folder into the app to explore all views with real data.

## Project Structure

```
src/
├── components/
│   ├── calendar/      # CalendarView, month grid, event popover
│   ├── chat/          # Claude chat panel
│   ├── frontmatter/   # FrontmatterPanel — field editing sidebar
│   ├── graph/         # GraphCanvas (React Flow), GraphNode (type colors, status badge)
│   ├── kanban/        # KanbanView, KanbanCard — drag-and-drop board
│   ├── layout/        # AppShell, Sidebar, TabBar, ContentArea, ViewToggle
│   ├── markdown/      # MarkdownView, EditorView, WikiLink renderer
│   ├── navigation/    # FileTree, FileTreeNode (dirty indicator)
│   └── upload/        # UploadZone
├── hooks/             # useActiveFile, useGraphData, useKanbanData, useCalendarData
├── lib/
│   ├── claude/        # streamChat — Anthropic SDK integration
│   ├── graph/         # Graph node/edge builder
│   └── parser/        # Vault loading, frontmatter (js-yaml), link resolver
├── pages/             # landing, explorer, error
├── providers/         # RootProvider (ToastContainer)
├── stores/            # Zustand: vault, ui, chat
├── styles/
└── types/             # Vault, Graph, UI type definitions
```

## Linting

```bash
pnpm lint
```
