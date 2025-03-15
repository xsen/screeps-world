import { Color } from "../enums.ts";
import { melee } from "../creeps/roles/melee.ts";
import { builder } from "../creeps/roles/builder.ts";
import { upgrader } from "../creeps/roles/upgrader.ts";
import { repair } from "../creeps/roles/repair.ts";
import { miner } from "../creeps/roles/miner.ts";
import { carry } from "../creeps/roles/carry.ts";
import { specialist } from "../creeps/roles/specialist.ts";
import { command } from "../creeps/roles/command.ts";

export const planner: BaseModule = {
  create: function () {
    return this;
  },
  execute: function (data: ModuleData) {
    const roles = {
      [melee.id]: melee,
      [builder.id]: builder,
      [upgrader.id]: upgrader,
      [repair.id]: repair,
      [miner.id]: miner,
      [carry.id]: carry,
      [specialist.id]: specialist,
      [command.id]: command,
    };

    data.creeps.forEach((creep) => {
      if (creep.memory.room && creep.room.name != creep.memory.room) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room), {
          visualizePathStyle: { stroke: Color.GREEN },
        });
        return;
      }

      const handler = roles[creep.memory.roleId];
      if (handler == null) {
        console.log("Error: no role in the current creep", creep);
        return;
      }

      handler.run(creep);
    });
  },
};
