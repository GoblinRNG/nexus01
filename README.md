# Gielinor Nexus — RS3 Companion

A safe, local Windows desktop companion for **RuneScape 3** only.

## Quick Start

```bash
npm install
npm run dev          # Start dev mode (Electron + Vite HMR)
npm test             # Run 39 unit tests
npm run build        # Build renderer + Electron main
npm run build:win    # Build + package Windows installer + portable
```

## Run Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Launch Electron in development mode (hot reload) |
| `npm test` | Run all unit tests (parser, bank engine, AI classifier) |
| `npm run build` | Compile Electron main + renderer |
| `npm run build:win:installer` | Build NSIS Windows installer |
| `npm run build:win:portable` | Build portable .exe |
| `npm run typecheck` | TypeScript check (0 errors) |

## Architecture

```
electron/
  main.ts             IPC handlers, window creation, bridge polling
  preload.ts          contextBridge API exposed to renderer
  bridge/
    launcher.ts       Detect/launch official Jagex Launcher
    processWatcher.ts Detect RS3/Jagex running processes
    apiSync.ts        RS3 HiScores + ItemDB via Electron net.fetch
    storage.ts        JSON persistence in %APPDATA%/GielinorNexus
src/
  types/index.ts      Shared TypeScript types
  context/AppContext.tsx  Global state (useReducer + Context)
  logic/
    parser.ts         RS3 action-message parser
    bankEngine.ts     Local bank add/remove/transform
    dedupe.ts         Event deduplication
    aiClassifier.ts   OCR confidence + parser confidence
    hiscores.ts       HiScores CSV parser
    prices.ts         ItemDB API helpers
    combatLevel.ts    RS3 combat level formula
  data/
    items.seed.json   30 starter items
    goals.seed.json   Sample goals (Necromancy, 99 WC, GE flip)
    methods.seed.json Training method data
  components/
    LauncherPanel.tsx    Left: RS3 launcher-style panel
    LocalBridgePanel.tsx Center: Bridge status + safety info
    NexusShell.tsx       Right: Tab navigation shell
    StatCards.tsx        4 stat cards (Bank value, XP, Level, Time)
    BankOverview.tsx     Bank mirror with sprites + context menu
    InventoryMirror.tsx  4x7 RS3 inventory grid
    ActivityFeed.tsx     Source events + pending approval
    AIObserver.tsx       Tesseract.js OCR screen reader
    GoalsPanel.tsx       Goals + progression tracking
    DailyPanel.tsx       Daily challenges + training sessions
    SettingsPanel.tsx    All user settings
tests/
  parser.test.ts        22 tests
  bankEngine.test.ts    9 tests
  aiClassifier.test.ts  8 tests
```

## Safety Boundary

This app NEVER:
- Reads game memory
- Injects into any process
- Sniffs network packets
- Automates mouse/keyboard input
- Stores Jagex credentials

This app ONLY:
- Opens the official Jagex Launcher via spawn() unmodified
- Reads RS3 HiScores via public Jagex API
- Reads RS3 item prices via public Jagex ItemDB API
- Reads your screen (selected region, explicit permission only)
- Runs OCR locally via Tesseract.js — data never uploaded
- Stores everything locally in %APPDATA%\GielinorNexus\

## Tests Passed

```
Tests  39 passed (39)

  parser.test.ts      22 tests — all RS3 action message patterns
  bankEngine.test.ts   9 tests — add/remove/transform/value
  aiClassifier.test.ts 8 tests — confidence, dedupe, category
```

## Known Limitations

1. Process detection uses `tasklist.exe` — Windows only. Dev mode on Linux shows bridge as "not detected".
2. Screen capture requires the packaged Electron app (desktopCapturer).
3. Item sprites loaded from Jagex CDN — require internet. Fallback boxes shown offline.
4. Windows installer cross-compile from Linux requires Wine or a Windows CI runner.

## Data Sources

- RS3 HiScores: secure.runescape.com/m=hiscore — Jagex Ltd.
- RS3 ItemDB / GE Prices: services.runescape.com/m=itemdb_rs — Jagex Ltd.
- Item sprites: services.runescape.com/m=itemdb_rs/obj_sprite.gif — Jagex Ltd.

Gielinor Nexus is not affiliated with or endorsed by Jagex Ltd. RuneScape(R) is a registered trademark of Jagex Ltd.
