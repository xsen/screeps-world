import profiler from "screeps-profiler";

export const melee: CreepRoleHandler = {
  id: 1,
  name: "melee",

  run: function (creep: Creep) {
    const target =
      creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS) ||
      creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    if (target) {
      if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
      return;
    }

    if (
      creep.room.controller?.my &&
      creep.pos.getRangeTo(creep.room.controller) > 6
    ) {
      creep.customMoveTo(creep.room.controller);
    }
  },
};
profiler.registerObject(melee, "Creep.Role.Melee");
