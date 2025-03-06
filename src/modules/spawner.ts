import { harvester } from "../roles/harvester.ts";
import { repair } from "../roles/repair.ts";
import { upgrader } from "../roles/upgrader.ts";
import { builder } from "../roles/builder.ts";

export const spawner: BaseModule = {
  create: function () {
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }

    return this;
  },
  execute: function (data: ModuleData) {
    const spawn = data.room.find(FIND_MY_SPAWNS)[0];
    if (spawn == undefined) {
      console.log("Error: no spawn in the current room", data.room);
      return;
    }

    const creepSpawns: CreepSpawn[] = [
      {
        role: harvester,
        body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        limit: 2,
      },
      {
        role: repair,
        body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        limit: 1,
      },
      {
        role: upgrader,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE],
        limit: 2,
      },
      {
        role: builder,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE],
        limit: 1,
      },
    ];

    creepSpawns.forEach((it) => {
      let count = 0;
      data.creeps.every((cr) => {
        if (cr.memory.roleId == it.role.id) {
          count++;
        }
      });

      if (count < it.limit) {
        const name = `${it.role.name}_${++count}_${Game.time}`;
        spawn.spawnCreep(it.body, name, {
          memory: {
            roleId: it.role.id,
            targetId: it.target,
          },
        });
      }
    });
  },
};
