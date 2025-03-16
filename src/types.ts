declare global {
  var myFunction: (arg?: string) => number;

  interface Memory {
    log: any;
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
