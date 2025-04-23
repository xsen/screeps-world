export const upgrade: CreepCommandHandler = {
  id: "upgrade",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.customMoveTo(position);
      return false;
    }

    const controller = creep.room.controller;

    if (!controller) {
      console.log("Error: position has no container");
      return true;
    }

    creep.upgradeController(controller);
    creep.customMoveTo(controller);

    return creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
  },
};
