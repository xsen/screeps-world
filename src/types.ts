declare global {
  interface Memory {
    log: any;
  }

  interface RoomStats {
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
    rooms: { [roomName: string]: RoomStats };
    cpu: CPUStats;
  }

  interface Stats {
    gcl: any;
    cpu: any;
    rooms: any;
    time: number;
  }

  interface Creep {
    memory: CreepMemory;

    getEnergy(range?: number): void;

    getEnergyFromTombstone(): boolean;

    getStatus(): string;

    setStatus(status: string): void;

    getCreepTarget<T extends AnyStructure | Source>(): T | null;

    setCreepTarget(target: AnyStructure | Source | null): void;
  }

  interface CreepMemory {
    room: string;
    status: string;
    roleId: number;
    generation: number;
    targetId?: Id<AnyStructure | Source>;
    commands?: CreepCommand[];
    commandId?: number;
    nearbyContainerId?: Id<StructureContainer>;
  }

  interface RoomSpawnPlan {
    handlerId: number;
    body: SpawnCreepBody[];
    generation: number;
    limit: number;
    target?: string;
    targetRoom?: string;
    commands?: CreepCommand[];
  }

  interface SpawnCreepBody {
    count: number;
    body: BodyPartConstant;
  }

  interface BaseModule {
    create: () => BaseModule;
    execute: (data: ModuleData) => void;
  }

  interface ModuleData {
    room: Room;
    creeps: Creep[];
  }

  interface CreepRoleHandler {
    id: number;
    name: string;
    stage?: string;
    run: (creep: Creep) => void;
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
