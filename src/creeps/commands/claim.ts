import { Color } from "../../enums.ts";

export const claim: CreepCommandHandler = {
  id: "claim",
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

    creep.claimController(controller);
    creep.attackController(controller);
    creep.moveTo(controller);

    return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
  },
};
