import { permanentCreeps } from "../creeps/permanentCreeps";

export const spawner: BaseModule = {
  create: function () {
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }
    this.config = { creeps: permanentCreeps };
    return this;
  },
  execute: function (data: ModuleData) {
    const spawner = data.room.find(FIND_MY_SPAWNS)[0];
    if (!spawner || spawner.spawning != null) {
      return;
    }

    let spawnCreepPlan: SpawnCreepPlan[] = this.config.creeps[data.room.name];
    if (!spawnCreepPlan || spawnCreepPlan.length == 0) return;

    spawnCreepPlan = dynamicSpawnCreeps(data.room, spawnCreepPlan);
    for (const spawnCreep of spawnCreepPlan) {
      const spawnRoomName = spawnCreep.room ? spawnCreep.room : data.room.name;
      const count = Object.values(Game.creeps).filter(
        (cr) =>
          cr.memory.room === spawnRoomName &&
          cr.memory.roleId === spawnCreep.handler.id &&
          cr.memory.generation === spawnCreep.generation,
      ).length;

      if (count < spawnCreep.limit) {
        const body: BodyPartConstant[] = [];
        for (const b of spawnCreep.body) {
          for (let i = 0; i < b.count; i++) {
            body.push(b.body);
          }
        }

        const name = `${spawnCreep.handler.name}_${spawnCreep.generation}_${Game.time}`;
        const res = spawner.spawnCreep(body, name, {
          memory: {
            roleId: spawnCreep.handler.id,
            generation: spawnCreep.generation,
            room: spawnCreep.room ? spawnCreep.room : data.room.name,
            status: "spawned",
          },
        });

        // if (res == ERR_NOT_ENOUGH_ENERGY) {
        //   console.log(
        //     "Error: not enough energy for spawn",
        //     pCr.handler.name,
        //     "in room",
        //     data.room.name,
        //   );
        // }

        if (res == OK) {
          console.log(
            "Spawned",
            spawnCreep.handler.name,
            "in room",
            data.room.name,
          );
        }

        return;
      }
    }
  },
};

export const dynamicSpawnCreeps = function (
  _room: Room,
  permanentCreeps: SpawnCreepPlan[],
) {
  return permanentCreeps;
};
