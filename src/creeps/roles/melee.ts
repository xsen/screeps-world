import { Color } from "../../enums.ts";

export const melee: CreepRoleHandler = {
  id: 1,
  name: "melee",

  run: function (creep: Creep) {
    const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (target) {
      if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: Color.RED } });
      }
    }
  },
};
