import { utils } from "../utils.ts";
import { Color } from "../enums.ts";

export const upgrader: CreepRole = {
  id: 3,
  name: "upgrader",

  run: function (creep: Creep) {
    if (creep.room.controller == undefined) {
      console.log("Error: no controller in the current room", creep.room.name);
      return;
    }

    if (creep.store.getUsedCapacity() == 0 || creep.memory.stage == "spawned") {
      creep.memory.stage = "refilling";
    }

    switch (creep.memory.stage) {
      case "refilling":
        // creep.say("⚡ up: downloading");
        if (creep.store.getFreeCapacity() > 0) {
          utils.getEnergy(creep);
          return;
        }
        creep.memory.stage = "upgrading";
        break;

      case "upgrading":
        // creep.say("⚡ up: uploading");
        if (
          creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE
        ) {
          creep.moveTo(creep.room.controller, {
            visualizePathStyle: { stroke: Color.ORANGE },
          });
        }
        if (creep.store.getUsedCapacity() == 0) {
          creep.memory.stage = "refilling";
        }
        break;
    }
  },
};
