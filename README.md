# Vault Explorer

A browser-based viewer for [Obsidian](https://obsidian.md) vaults. Load a vault from a local folder or `.zip` archive, browse your notes, visualize the link graph, and chat with your knowledge base via the Claude API — all without uploading files to any server.

## Features

- **Vault loading** — drag-and-drop a folder or `.zip` archive; parsing happens entirely in the browser
- **File tree navigation** — collapsible sidebar with tab-based navigation scoped to top-level folders
- **Markdown rendering** — full GitHub Flavored Markdown with syntax highlighting and wiki-link (`[[Note]]`) resolution
- **Knowledge graph** — interactive node graph (powered by React Flow) showing outlinks and backlinks; click a node to open the file
- **Split view** — document and graph side by side
- **Claude AI chat** — ask questions about your vault; the assistant receives your notes as context and streams answers in real time (requires your own Anthropic API key)
- **Frontmatter parsing** — YAML frontmatter extracted and available per file

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
| ZIP parsing | JSZip |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Animations | Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended) — or npm/yarn

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
2. Drag your Obsidian vault folder onto the drop zone, **or** drag/click to select a `.zip` export of the vault.
3. The vault is parsed client-side — no files leave your machine.
4. Use the sidebar to browse files and the top tabs to navigate between top-level folders.
5. Toggle between **Document**, **Graph**, and **Split** views with the view switcher.
6. Click the chat button (bottom-right) and enter your Anthropic API key to start asking questions about your notes.

## Project Structure

```
src/
├── components/
│   ├── chat/          # Claude chat panel (ApiKeySetup, ChatWindow, MessageList)
│   ├── error-boundary/
│   ├── graph/         # React Flow canvas and custom node
│   ├── layout/        # AppShell, Sidebar, TabBar, ContentArea, ViewToggle
│   ├── markdown/      # MarkdownView + WikiLink renderer
│   ├── navigation/    # FileTree, FileTreeNode
│   └── upload/        # UploadZone (landing drop target)
├── hooks/             # useActiveFile, useGraphData
├── lib/
│   ├── claude/        # streamChat — Anthropic SDK integration
│   ├── graph/         # Graph node/edge builder from vault links
│   └── parser/        # Vault loading: folder & zip parsing, frontmatter, link resolver
├── pages/             # landing, explorer, error
├── providers/         # RootProvider
├── stores/            # Zustand stores: vault, ui, chat
├── styles/
└── types/             # Vault, Graph, UI type definitions
```

## AI Chat

The chat feature uses the Anthropic Claude API directly from the browser (`dangerouslyAllowBrowser: true`). Your API key is stored only in the browser session (Zustand in-memory store) and is never sent anywhere other than `api.anthropic.com`.

The assistant receives up to **120 000 characters** of vault content as its system prompt. For very large vaults, notes are included in order until the limit is reached.

Model: `claude-sonnet-4-6`, max tokens: `4096`.

## Linting

```bash
pnpm lint
```

ESLint is configured with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
