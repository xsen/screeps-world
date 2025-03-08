import { utils } from "../utils.ts";
import { Color } from "../enums.ts";

export const upgrader: CreepHandler = {
  id: 3,
  name: "upgrader",

  run: function (creep: Creep) {
    if (creep.room.controller == undefined) {
      console.log("Error: no controller in the current room", creep.room.name);
      return;
    }

    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.stage = "refilling";
    }
    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.stage = "upgrading";
    }

    if (creep.memory.stage == "refilling") {
      utils.getEnergy(creep);
      return;
    }

    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, {
        visualizePathStyle: { stroke: Color.YELLOW },
      });
    }
  },
};
