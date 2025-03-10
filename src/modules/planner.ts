import { repair } from "../creeps/handlers/repair.ts";
import { upgrader } from "../creeps/handlers/upgrader.ts";
import { miner } from "../creeps/handlers/miner.ts";
import { carry } from "../creeps/handlers/carry.ts";
import { builder } from "../creeps/handlers/builder.ts";

export const planner: BaseModule = {
  config: {
    roleHandlers: {
      [builder.id]: builder,
      [repair.id]: repair,
      [upgrader.id]: upgrader,
      [miner.id]: miner,
      [carry.id]: carry,
    } as const,
  },
  create: function () {
    return this;
  },
  execute: function (data: ModuleData) {
    data.creeps.forEach((creep) => {
      if (creep.memory.room && creep.room.name != creep.memory.room) {
        creep.say("bb,loh");
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
        return;
      }

      const handler = this.config.roleHandlers[creep.memory.roleId];
      if (handler == null) {
        console.log("Error: no role in the current creep", creep);
        return;
      }

      handler.run(creep);
    });
  },
};
