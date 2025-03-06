export const utils = {
  updateSafeMode: (room: Room) => {
    if (
      room.controller?.safeMode != undefined &&
      room.controller.safeMode < 5
    ) {
      room.controller.activateSafeMode();
    }
  },

  goHarvest: (creep: Creep) => {
    const creepCapacity = creep.store.getFreeCapacity();
    const getSource = (creep: Creep): Source | null => {
      let target = creep.memory.targetId
        ? Game.getObjectById<Source>(creep.memory.targetId)
        : creep.pos.findClosestByRange(FIND_SOURCES);

      if (target != null) {
        if (target.energy < creepCapacity) {
          const source = creep.room.find(FIND_SOURCES).find((source) => {
            return source.energy > creepCapacity;
          });

          if (source != undefined) {
            target = source;
          }
        }
      }

      return target;
    };

    const target = getSource(creep);

    if (target != null) {
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
  goRepair: (creep: Creep) => {
    let damagedStructures = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        if (structure.structureType === STRUCTURE_ROAD) {
          return structure.hits < structure.hitsMax * 0.7;
        }
        return false;
      },
    });

    const getWalls = (creep: Creep, maxHits: number): StructureWall | null => {
      return creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          if (
            structure.structureType === STRUCTURE_WALL ||
            structure.structureType == STRUCTURE_RAMPART
          ) {
            return structure.hits < maxHits;
          }
          return false;
        },
      });
    };

    const dmgLvls = [
      10000, 20000, 30000, 40000, 50000, 100000, 300000, 500000, 1000000,
    ];
    dmgLvls.some((it) => {
      if (damagedStructures != null) return true;
      damagedStructures = getWalls(creep, it);
    });

    if (damagedStructures != null) {
      if (creep.repair(damagedStructures) == ERR_NOT_IN_RANGE) {
        creep.moveTo(damagedStructures, {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
    } else {
      creep.moveTo(43, 14, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  },
};
