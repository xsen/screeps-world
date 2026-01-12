# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScreepsWorld is a TypeScript-based AI bot for the game [Screeps](https://screeps.com/). It manages a colony of automated
units (creeps) that gather resources, build structures, and defend the colony.

## Build Commands

```bash
npm run remote  # Build TypeScript and deploy to remote Screeps server via API
npm run local   # Build TypeScript and deploy to local Screeps instance
```

Both commands compile TypeScript with Vite and automatically upload the bundled code. The remote deployment uses the
`SCREEPS_TOKEN`, `SCREEPS_BRANCH`, and `SCREEPS_PATH` environment variables from `.env`.

## Architecture

### Game Loop (src/main.ts)

The main loop runs via the exported `loop` function. Modules are organized in two phases:

1. **Global modules**: `create()` initializes state, `execute()` runs global logic
2. **Per-room modules**: `execute(room)` runs for each owned room

### Core Patterns

**Module Pattern**: All game systems use a consistent interface:

```typescript
interface RoomModule {
  create: () => RoomModule;    // Initialize per-tick state
  execute: (room: Room) => void;
}

interface GlobalModule {
  create: () => GlobalModule;
  execute: () => void;
}
```

**Task-Oriented Decomposition** (see ROLES.MD):

- **Roles** (`src/creeps/roles/`) are "conductors" - they decide WHICH task to execute, NOT how
- **Tasks** (`src/creeps/tasks/`) are atomic, reusable actions implementing `Task` interface
- Each task has `execute(creep: Creep): TaskStatus` returning `IN_PROGRESS`, `COMPLETED`, or `FAILED`
- This eliminates code duplication and follows Single Responsibility Principle

**Priority Task List**: Most roles use this pattern in `run()`:

1. Build a prioritized list of potential tasks each tick
2. Execute the first feasible task and stop for the tick

**Target Validation Principle** (CRITICAL):

- Roles MUST validate that `creep.memory.targetId` matches current state
- When state changes (e.g., empty → full), target MUST be reset immediately
- Use `creep.getCreepTarget<T>()` and `creep.setCreepTarget()` helpers
- Failure to validate causes creeps to loop endlessly

**Role Assistance Principle**:

- Idle creeps can perform tasks of other roles
- Borrowed tasks always have LOWER priority than the creep's primary tasks

**Role-Specific Memory Typing**:

- Each role defines its own interface extending `CreepMemory` locally in the role file
- Use type assertion: `const memory = creep.memory as ScavengerMemory;`
- Prevents `CreepMemory` from becoming a "dump" of optional fields

**Caching Layers**:

- `TickCache` (`src/cache/TickCache.ts`): Cleared every tick, for expensive per-tick lookups
- `MemoryCache` (`src/cache/MemoryCache.ts`): Persists with TTL, for pathfinding results

### Key Directories

| Directory              | Purpose                                             |
|------------------------|-----------------------------------------------------|
| `src/modules/`         | Game loop modules (Spawner, Defense, Link, etc.)    |
| `src/managers/`        | Business logic managers (SpawnManager, LinkManager) |
| `src/creeps/roles/`    | Role implementations (11 roles)                     |
| `src/creeps/tasks/`    | Task implementations (14+ tasks)                    |
| `src/creeps/commands/` | Flag-based command handlers                         |
| `src/spawner/`         | Spawn planning and body calculation                 |

### Priority-Based Spawn System

Roles implement `getSpawnPlans(room: Room): SpawnPlan[]`. SpawnManager sorts plans by priority (higher = earlier spawn):

- Refiller: 11 (emergency)
- Miner: 10
- Hauler: 9
- Upgrader: 8
- Builder/Repair: 7

Each `SpawnPlan` defines body composition, generation, limits, and optional `preSpawnTicks`.

## Code Conventions

- **2-space indentation** (see .editorconfig)
- **Strict TypeScript**: `noUnusedLocals`, `noUnusedParameters` enabled
- **Debug output**: Use `creep.debugSay(message)` - respects `DEBUG_MODE` in config
- Don't use the operator ??
- **Role-specific memory**: Extend `CreepMemory` with role-specific interfaces
- **Creep naming**: `{roleabbr}-{generation}{timehash}` (e.g., `ref-1234a`)

## Configuration

- `.env`: Screeps API token, branch, and local path
- `vite.config.ts`: Build config with deploy plugins
- `tsconfig.json`: TypeScript settings (ES2020, strict mode, sourcemaps)
