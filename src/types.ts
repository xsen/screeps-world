declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    roleId: number;
    stage: string;
    targetId?: string;
    generation: number;
  }

  interface SpawnCreeps {
    handler: CreepHandler;
    body: BodyPartConstant[];
    generation: number;
    limit: number;
    target?: string;
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
