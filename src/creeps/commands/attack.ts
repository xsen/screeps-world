export const attack: CreepCommandHandler = {
  id: "attack",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.customMoveTo(position);
      return false;
    }
    const target = position.lookFor(LOOK_STRUCTURES)[0];
    if (target) {
      const res = creep.attack(target);
      if (res == ERR_NOT_IN_RANGE) {
        creep.customMoveTo(position);
      }
      return false;
    }

    return true;
  },
};
