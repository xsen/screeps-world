declare global {
  var myFunction: (arg?: string) => number;

  interface Creep {
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
  }

  interface SpawnCreepPlan {
    handler: CreepHandler;
    body: SpawnCreepBody[];
    generation: number;
    limit: number;
    room?: string;
    target?: string;
  }

  interface SpawnCreepBody {
    count: number;
    body: BodyPartConstant;
  }

  interface BaseModule {
    config?: any;
    create: () => BaseModule;
    execute: (data: ModuleData) => void;
  }

  interface ModuleData {
    room: Room;
    creeps: Creep[];
  }

  interface CreepHandler {
    id: number;
    name: string;
    stage?: string;
    run: (creep: Creep) => void;
  }
}
