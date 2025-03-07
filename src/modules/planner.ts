import { harvester } from "../roles/harvester.ts";
import { builder } from "../roles/builder.ts";
import { repair } from "../roles/repair.ts";
import { upgrader } from "../roles/upgrader.ts";
import { miner } from "../roles/miner.ts";
import { carry } from "../roles/carry.ts";

export const planner: BaseModule = {
  config: {
    roles: {
      [harvester.id]: harvester,
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
        harvester.run(creep);
        return;
      }

      role.run(creep);
    });
  },
};
