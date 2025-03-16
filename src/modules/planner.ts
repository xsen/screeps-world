import { Color } from "../enums.ts";
import { roles } from "../creeps/roles.ts";

export const planner: BaseModule = {
  create: function () {
    return this;
  },
  execute: function (data: ModuleData) {
    data.creeps.forEach((creep) => {
      if (creep.memory.room && creep.room.name != creep.memory.room) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room), {
          visualizePathStyle: { stroke: Color.GREEN },
        });
        return;
      }

      const handler = roles.get(creep.memory.roleId);
      if (handler == null) {
        console.log("Error: no role in the current creep", creep);
        return;
      }

      handler.run(creep);
    });
  },
};
