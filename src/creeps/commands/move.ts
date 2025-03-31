export const move: CreepCommandHandler = {
  id: "move",
  run: function (creep, position) {
    if (!creep.pos.isEqualTo(position)) {
      creep.customMoveTo(position);
      return false;
    }
    return true;
  },
};
