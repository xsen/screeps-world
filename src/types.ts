export enum TaskStatus {
  IN_PROGRESS,
  COMPLETED,
  FAILED,
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      tickCache: { [key: string]: any };
    }
  }

  type AnyTarget =
    | AnyStructure
    | Source
    | Resource
    | Ruin
    | Tombstone
    | ConstructionSite;

  // noinspection JSUnusedGlobalSymbols
  interface Memory {
    logs: MemoryLogs;
    avoidPositions: { [roomName: string]: RoomPosition[] };
    cache?: { [key: string]: any };
  }

  interface MemoryLogs {
    lastError?: any;
    data?: any;
  }

  interface GlobalRoomStats {
    energy: number;
    minerals: { [type: string]: number };
    controllerProgress?: number;
    creeps: number;
    storageEnergy: number;
    terminalEnergy: number;
    energyAvailable: number;
    energyCapacityAvailable: number;
    controllerProgressTotal?: number;
    controllerLevel?: number;
  }

  interface GCLStats {
    progress: number;
    progressTotal: number;
    level: number;
  }

  interface CPUStats {
    bucket: number;
    limit: number;
    used: number;
  }

  interface GameStats {
    gcl: GCLStats;
    rooms: { [roomName: string]: GlobalRoomStats };
    cpu: CPUStats;
  }

  interface Room {
    memory: RoomMemory;
  }

  interface RoomMemory {
    isSafe: boolean;
    stats: LocalRoomStats;
    targets: { [targetId: string]: RoomPosition };
    avoidPositions: RoomPosition[];
    linkCache?: {
      centralLinkId?: Id<StructureLink>;
      sourceLinkIds: Id<StructureLink>[];
      scanTime: number;
    };
    targetId?: Id<Creep>;
  }

  interface LocalRoomStats {
    sourcesCount: number;
    constructionSitesCount: number;
  }

  interface Creep {
    memory: CreepMemory;

    getStatus(): string;

    setStatus(status: string): void;

    getCreepTarget<T extends AnyTarget>(): T | null;

    setCreepTarget(target: AnyTarget | null): void;

    customMoveTo(
      target:
        | RoomPosition
        | {
            pos: RoomPosition;
          },
      opts?: MoveToOpts,
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;

    debugSay(message: string): void;
  }

  interface CreepMemory {
    room: string;
    status: string;
    role: string;
    roleId?: number;
    generation: number;
    targetId?: Id<AnyTarget>;
    commands?: CreepCommand[];
    commandId?: number;
    nearbyContainerId?: Id<StructureContainer>;
    working?: boolean;
  }

  interface Task {
    execute(creep: Creep): TaskStatus;
  }

  interface RoomModule {
    create: () => RoomModule;
    execute: (room: Room) => void;
  }

  interface SpawnPlan {
    handlerName: string;
    body: SpawnCreepBody[] | ((room: Room) => SpawnCreepBody[]);
    generation: number;
    limit: number | ((room: Room) => number);
    targetId?: Id<any>; // For permanent assignments like a miner to a source
    target?: string;
    targetRoom?: string;
    commands?: CreepCommand[] | ((room: Room) => CreepCommand[]);
    isEmergency?: boolean;
    minBody?: SpawnCreepBody[];
    priority?: number;
    preSpawnTicks?: number;
  }

  type SpawnPlansByRoom = Record<string, SpawnPlan[]>;

  interface SpawnCreepBody {
    count: number;
    body: BodyPartConstant;
  }

  interface GlobalModule {
    create: () => GlobalModule;
    execute: () => void;
  }

  interface RoomModule {
    create: () => RoomModule;
    execute: (room: Room) => void;
  }

  interface CreepRoleHandler {
    name: string;
    run: (creep: Creep) => void;
    getSpawnPlans(room: Room): SpawnPlan[];
  }

  interface CreepCommand {
    target?: RoomPosition;
    handler: CreepCommandHandler;
  }

  interface CreepCommandHandler {
    id: string;
    run: (creep: Creep, position: RoomPosition) => boolean;
  }
}
