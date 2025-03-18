import { Color } from "../../enums.ts";

export const upgrade: CreepCommandHandler = {
  id: "transfer",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.moveTo(position, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
      return false;
    }

    const controller = creep.room.controller;

    if (!controller) {
      console.log("Error: position has no container");
      return true;
    }

    creep.upgradeController(controller);
    creep.moveTo(controller);

    return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
  },
};
