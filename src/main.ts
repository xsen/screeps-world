import "./extensions/Creep.ts";

import { defense } from "./modules/defense.ts";
import { spawner } from "./modules/spawner.ts";
import { planner } from "./modules/planner.ts";
import { flags } from "./modules/flags.ts";

export const loop = () => {
  spawner.create();
  defense.create();
  planner.create();

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    const data = {
      room: room,
      creeps: room.find(FIND_MY_CREEPS),
    };

    planner.execute(data);

    if (room.controller?.my) {
      defense.execute(data);
      spawner.execute(data);
    }
  }

  if (Game.time % 99 === 0) {
    flags.create().execute();
  }

  if (Game.time % 10 === 0) {
    updateStats();
  }
};

function updateStats() {
  const stats: GameStats = {
    gcl: {
      progress: Game.gcl.progress,
      progressTotal: Game.gcl.progressTotal,
      level: Game.gcl.level,
    },
    cpu: {
      bucket: Game.cpu.bucket,
      limit: Game.cpu.limit,
      used: Game.cpu.getUsed(),
    },
    rooms: {},
  };

  for (const roomName of Object.keys(Game.rooms)) {
    const room = Game.rooms[roomName];
    if (room.controller?.my == false) continue;

    stats.rooms[roomName] = {
      energy: room.energyAvailable,
      minerals: {},
      controllerProgress: room.controller ? room.controller.progress : 0,
      creeps: Object.keys(Game.creeps).filter(
        (creep) => Game.creeps[creep].room.name === roomName,
      ).length,
      storageEnergy: room.storage ? room.storage.store.energy : 0,
      terminalEnergy: room.terminal ? room.terminal.store.energy : 0,
      energyAvailable: room.energyAvailable,
      energyCapacityAvailable: room.energyCapacityAvailable,
      controllerProgressTotal: room.controller?.progressTotal,
      controllerLevel: room.controller?.level,
    };
  }

  RawMemory.setActiveSegments([0]);
  RawMemory.segments[0] = JSON.stringify(stats);
}
