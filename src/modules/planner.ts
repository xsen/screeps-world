import { builder } from "../creeps/builder.ts";
import { repair } from "../creeps/repair.ts";
import { upgrader } from "../creeps/upgrader.ts";
import { miner } from "../creeps/miner.ts";
import { carry } from "../creeps/carry.ts";

export const planner: BaseModule = {
  config: {
    roles: {
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
      const role = this.config.roles[creep.memory.roleId];
      if (role == null) {
        console.log("Error: no role in the current creep", creep);
        return;
      }

      role.run(creep);
    });
  },
};
