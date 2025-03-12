import { repair } from "../creeps/handlers/repair.ts";
import { upgrader } from "../creeps/handlers/upgrader.ts";
import { miner } from "../creeps/handlers/miner.ts";
import { carry } from "../creeps/handlers/carry.ts";
import { builder } from "../creeps/handlers/builder.ts";
import { Color } from "../enums.ts";
import { melee } from "../creeps/handlers/melee.ts";

export const planner: BaseModule = {
  config: {
    roleHandlers: {
      [melee.id]: melee,
      [builder.id]: builder,
      [upgrader.id]: upgrader,
      [repair.id]: repair,
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
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room), {
          visualizePathStyle: { stroke: Color.GREEN },
        });
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
