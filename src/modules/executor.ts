import { roles } from "../creeps/roles.ts";

export const executor: GlobalModule = {
  create: function () {
    return this;
  },
  execute: function () {
    const creeps = Game.creeps;
    for (const creepName in creeps) {
      const creep = creeps[creepName];

      if (creep.memory.room && creep.room.name != creep.memory.room) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
        return;
      }

      const handler = roles.get(creep.memory.roleId);
      if (handler == null) {
        console.log("Error: no role in the current creep", creep);
        return;
      }

      handler.run(creep);
    }
  },
};
