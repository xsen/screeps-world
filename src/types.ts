declare global {
  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    roleId: number;
    room?: string;
    targetId?: string;
    building?: boolean;
    upgrading?: boolean;
    working?: boolean;
  }

  interface CreepSpawn {
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
    run: (creep: Creep) => void;
  }
}
