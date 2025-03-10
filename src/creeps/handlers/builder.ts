import { Color } from "../../enums.ts";
import { repairStructures } from "./repair.ts";

export const builder: CreepHandler = {
  id: 2,
  name: "builder",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0) {
      creep.memory.status = "refilling";
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.status = "building";
    }

    if (creep.memory.status == "refilling") {
      creep.getEnergy();
      return;
    }

    const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (target != null) {
      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {
          visualizePathStyle: { stroke: Color.PURPLE },
        });
      }
      return;
    }

    repairStructures(creep);
  },
};
