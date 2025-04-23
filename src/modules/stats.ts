export const stats: StatsModule = {
  start: function () {
    if (Game.time % 35 === 0) {
      for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
          delete Memory.creeps[name];
        }
      }
    }
  },
  execute: (room) => {
    if (!room.memory.stats) {
      room.memory.stats = {
        sourcesCount: room.find(FIND_SOURCES).length,
        constructionSitesCount: room.find(FIND_CONSTRUCTION_SITES).length,
      };
    }

    if (Game.time % 12 === 0) {
      room.memory.stats.constructionSitesCount = room.find(
        FIND_CONSTRUCTION_SITES,
      ).length;
    }
  },
  finish: function () {
    if (Game.time % 11 === 0) {
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
  },
};
