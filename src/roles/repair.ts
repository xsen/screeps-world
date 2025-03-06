import { utils } from "../utils.ts";

export const repair: CreepRole = {
  id: 4,
  name: "repair",

  run: function (creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 repair");
    }

    if (creep.memory.building) {
      utils.goRepair(creep);
    } else {
      utils.goHarvest(creep);
    }
  },
};
