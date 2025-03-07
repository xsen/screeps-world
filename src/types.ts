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

    room?: string;
    building?: boolean;
    upgrading?: boolean;
    working?: boolean;
  }

  interface SpawnCreeps {
    role: CreepRole;
    body: BodyPartConstant[];
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

  interface CreepRole {
    id: number;
    name: string;
    stage?: string;
    run: (creep: Creep) => void;
  }
}
