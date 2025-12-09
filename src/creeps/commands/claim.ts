export const claim: CreepCommandHandler = {
  id: "claim",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.customMoveTo(position);
      return false;
    }

    const controller = creep.room.controller;

    if (!controller) {
      console.log("Error: position has no controller");
      return true;
    }

    creep.claimController(controller);
    creep.attackController(controller);
    // creep.signController(controller, "");
    creep.customMoveTo(controller);

    return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
  },
};
