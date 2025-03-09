import { repair } from "../creeps/repair.ts";
import { upgrader } from "../creeps/upgrader.ts";
import { builder } from "../creeps/builder.ts";
import { miner } from "../creeps/miner.ts";
import { carry } from "../creeps/carry.ts";

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

    const permanentCreeps: SpawnCreeps[] = [
      {
        generation: 2,
        handler: repair,
        body: [
          WORK,
          WORK,
          WORK,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
        ],
        limit: 1,
      },
      {
        generation: 3,
        handler: upgrader,
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
        ],
        limit: 4,
      },
      {
        generation: 4,
        handler: builder,
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
        handler: miner,
        body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE],
        limit: 4,
      },

      {
        generation: 5,
        handler: carry,
        body: [
          CARRY,
          CARRY,
          CARRY,
          CARRY,
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
        limit: 1,
      },
    ];

    permanentCreeps.forEach((spawnItem) => {
      let count = 0;
      data.creeps.forEach((cr) => {
        if (
          cr.memory.roleId === spawnItem.handler.id &&
          cr.memory.generation === spawnItem.generation
        ) {
          count++;
        }
      });
      if (count < spawnItem.limit) {
        const name = `${spawnItem.handler.name}_${spawnItem.generation}_${Game.time}`;

        const res = spawner.spawnCreep(spawnItem.body, name, {
          memory: {
            status: "spawned", // @todo
            roleId: spawnItem.handler.id,
            generation: spawnItem.generation,
          },
        });

        if (res == ERR_NOT_ENOUGH_ENERGY) {
          console.log(
            "Error: not enough energy for spawn",
            spawnItem.handler.name,
          );
        }
      }
    });

    // @todo: method find not working
    //   const name = `${carry.name}_ERROR_${Game.time}`;
    //   spawner.spawnCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], name, {
    //     memory: {
    //       generation: -1,
    //       stage: "spawned",
    //       roleId: carry.id,
    //     },
    //   });
    // }
  },
};
