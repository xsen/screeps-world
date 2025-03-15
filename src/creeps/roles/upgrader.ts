import { Color } from "../../enums.ts";

export const upgrader: CreepRoleHandler = {
  id: 3,
  name: "upgrader",

  run: function (creep: Creep) {
    if (creep.room.controller == undefined) {
      console.log("Error: no controller in the current room", creep.room.name);
      return;
    }

    if (creep.getStatus() === "spawned") {
      if (creep.getEnergyFromTombstone()) {
        return;
      }
      creep.setStatus("upgrading");
    }

    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.status = "refilling";
    }
    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.status = "upgrading";
    }

    if (creep.memory.status == "refilling") {
      creep.getEnergy();
      return;
    }

    creep.upgradeController(creep.room.controller);
    creep.moveTo(creep.room.controller, {
      visualizePathStyle: { stroke: Color.YELLOW },
    });
  },
};
