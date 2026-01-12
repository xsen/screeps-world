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

    if (!controller.my) {
      if (controller.reservation?.ticksToEnd) {
        creep.attackController(controller);
      } else {
        creep.claimController(controller);
      }
    }
    creep.customMoveTo(controller);
    return false;
  },
};
