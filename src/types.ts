declare global {
  interface Memory {
    logs: MemoryLogs;
    avoidPositions: { [roomName: string]: RoomPosition[] };
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
  }

  interface LocalRoomStats {
    sourcesCount: number;
    constructionSitesCount: number;
  }

  interface Creep {
    memory: CreepMemory;

    getEnergy(): void;

    getEnergyFromTombstone(): boolean;

    getStatus(): string;

    setStatus(status: string): void;

    getCreepTarget<T extends AnyStructure | Source | Resource>(): T | null;

    setCreepTarget(target: AnyStructure | Source | Resource | null): void;

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
    targetId?: Id<AnyStructure | Source | Resource>;
    commands?: CreepCommand[];
    commandId?: number;
    nearbyContainerId?: Id<StructureContainer>;
  }

  interface RoomModule {
    create: () => RoomModule;
    execute: (room: Room) => void;
  }

  interface SpawnPlan {
    handlerName: string;
    body: SpawnCreepBody[];
    generation: number;
    limit: number;
    target?: string;
    targetRoom?: string;
    commands?: CreepCommand[];
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
    defaultMinBody?: SpawnCreepBody[];
    defaultIsEmergency?: boolean;
    defaultPriority?: number;
    defaultPreSpawnTicks?: number;
  }

  interface CreepCommand {
    target?: RoomPosition;
    handler: CreepCommandHandler;
  }

  interface CreepCommandHandler {
    id: string;
    /**
     * @param creep the creep to run command
     * @param position the target of the command
     * @returns true if command is finished
     */
    run: (creep: Creep, position: RoomPosition) => boolean;
  }
}
