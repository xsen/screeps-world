import { utils } from "../utils.ts";

export const builder: CreepRole = {
  id: 2,
  name: "builder",

  run: function (creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if (target != null) {
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else {
        utils.goRepair(creep);
      }
    } else {
      utils.goHarvest(creep);
    }
  },
};
