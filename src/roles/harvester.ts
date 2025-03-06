import { utils } from "../utils.ts";

export const harvester: CreepRole = {
  id: 1,
  name: "harvester",
  run: function (creep: Creep) {
    if (creep.store.getFreeCapacity() > 0) {
      utils.goHarvest(creep);
      return;
    }

    const chargeStructure = [
      STRUCTURE_EXTENSION,
      // STRUCTURE_TOWER,
      STRUCTURE_SPAWN,
    ];

    const targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (
        structure: StructureExtension | /*StructureTower |*/ StructureSpawn,
      ) => {
        return (
          chargeStructure.includes(structure.structureType) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });

    if (targets != undefined) {
      if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targets, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  },
};
