import { utils } from "../utils.ts";
import { Color } from "../enums.ts";

export const builder: CreepRole = {
  id: 2,
  name: "builder",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.stage = "refilling";
    }

    switch (creep.memory.stage) {
      case "refilling":
        if (creep.store.getFreeCapacity() > 0) {
          utils.getEnergy(creep);
          break;
        }
        creep.memory.stage = "building";
        break;

      case "building":
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target != null) {
          if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
              visualizePathStyle: { stroke: Color.GRAY },
            });
          }
          break;
        }

        utils.goRepair(creep);
        break;
    }
  },
};
