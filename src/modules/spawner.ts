import { harvester } from "../roles/harvester.ts";
import { upgrader } from "../roles/upgrader.ts";
import { builder } from "../roles/builder.ts";
import { repair } from "../roles/repair.ts";

// const _ = require("lodash");
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
    const spawner = data.room.find(FIND_MY_SPAWNS)[0];
    if (spawner == undefined) {
      console.log("Error: no spawn in the current room", data.room);
      return;
    }

    if (spawner.spawning != null) {
      console.log("Spawn is busy: ", spawner.spawning.name);
      return;
    }

    const spawnCreeps: SpawnCreeps[] = [
      {
        role: harvester,
        body: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        limit: 2,
      },
      {
        role: repair,
        body: [WORK, WORK, CARRY, MOVE],
        limit: 1,
      },
      {
        role: upgrader,
        body: [WORK, WORK, WORK, CARRY, MOVE],
        limit: 2,
      },
      {
        role: builder,
        body: [WORK, WORK, WORK, CARRY, MOVE],
        limit: 2,
      },
    ];

    spawnCreeps.forEach((spawnItem, spawnItemIndex) => {
      let count = 0;
      data.creeps.forEach((cr) => {
        if (
          cr.memory.roleId == spawnItem.role.id &&
          cr.memory.generation == spawnItemIndex
        ) {
          count++;
        }
      });
      if (count < spawnItem.limit) {
        const name = `${spawnItem.role.name}_${count}_${Game.time}`;

        console.log("Spawning creep: ", name);
        spawner.spawnCreep(spawnItem.body, name, {
          memory: {
            roleId: spawnItem.role.id,
            targetId: spawnItem.target,
            generation: spawnItemIndex,
          },
        });
      }
    });
  },
};
