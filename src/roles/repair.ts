import { utils } from "../utils.ts";

export const repair: CreepRole = {
  id: 4,
  name: "repair",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0 || creep.memory.stage == "spawned") {
      creep.memory.stage = "refilling";
    }

    if (creep.memory.stage == "refilling") {
      utils.getEnergy(creep);
      if (creep.store.getFreeCapacity() == 0) {
        creep.memory.stage = "repairing";
      }
    }

    if (creep.memory.stage == "repairing") {
      utils.goRepair(creep);
    }
  },
};
