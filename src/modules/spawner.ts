import { repair } from "../roles/repair.ts";
import { upgrader } from "../roles/upgrader.ts";
import { builder } from "../roles/builder.ts";
import { miner } from "../roles/miner.ts";
import { carry } from "../roles/carry.ts";

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
      return;
    }

    const spawnCreeps: SpawnCreeps[] = [
      {
        generation: 2,
        role: repair,
        body: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        limit: 1,
      },
      {
        generation: 3,
        role: upgrader,
        body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        limit: 2,
      },
      {
        generation: 4,
        role: builder,
        body: [
          WORK,
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
        ],
        limit: 1,
      },
      {
        generation: 5,
        role: miner,
        body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE],
        limit: 4,
      },

      {
        generation: 5,
        role: carry,
        body: [
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
        ],
        limit: 2,
      },
    ];

    spawnCreeps.forEach((spawnItem) => {
      let count = 0;
      data.creeps.forEach((cr) => {
        if (
          cr.memory.roleId === spawnItem.role.id &&
          cr.memory.generation === spawnItem.generation
        ) {
          count++;
        }
      });
      if (count < spawnItem.limit) {
        const name = `${spawnItem.role.name}_${spawnItem.generation}_${Game.time}`;

        const res = spawner.spawnCreep(spawnItem.body, name, {
          memory: {
            stage: "spawned",
            roleId: spawnItem.role.id,
            targetId: spawnItem.target,
            generation: spawnItem.generation,
          },
        });

        if (res == ERR_NOT_ENOUGH_ENERGY) {
          console.log(
            "Error: not enough energy for spawn",
            spawnItem.role.name,
          );
        }
      }
    });

    if (data.creeps.find((cr) => cr.memory.roleId == carry.id) == undefined) {
      const name = `${carry.name}_ERROR_${Game.time}`;
      spawner.spawnCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], name, {
        memory: {
          generation: -1,
          stage: "spawned",
          roleId: carry.id,
        },
      });
    }
  },
};
