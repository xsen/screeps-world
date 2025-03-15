import { spawnPlans } from "../creeps/spawnPlans.ts";

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
    if (!spawner || spawner.spawning != null) {
      return;
    }

    let roomSpawnPlans: RoomSpawnPlan[] = spawnPlans[data.room.name];
    if (!roomSpawnPlans || roomSpawnPlans.length == 0) return;

    roomSpawnPlans = dynamicSpawnCreepPlan(data.room, roomSpawnPlans);
    for (const spawnPlan of roomSpawnPlans) {
      const spawnRoomName =
        spawnPlan.targetRoom != null ? spawnPlan.targetRoom : data.room.name;
      const count = Object.values(Game.creeps).filter(
        (cr) =>
          cr.memory.room === spawnRoomName &&
          cr.memory.roleId === spawnPlan.handler.id &&
          cr.memory.generation === spawnPlan.generation,
      ).length;

      if (count < spawnPlan.limit) {
        const body: BodyPartConstant[] = [];
        for (const b of spawnPlan.body) {
          for (let i = 0; i < b.count; i++) {
            body.push(b.body);
          }
        }

        const name = `${spawnPlan.handler.name}-${spawnPlan.generation}_${Game.time}`;
        const res = spawner.spawnCreep(body, name, {
          memory: {
            roleId: spawnPlan.handler.id,
            generation: spawnPlan.generation,
            room:
              spawnPlan.targetRoom != null
                ? spawnPlan.targetRoom
                : data.room.name,
            status: "spawned",
            commands: spawnPlan.commands,
          },
        });

        if (res == OK) {
          console.log(
            "Spawned",
            spawnPlan.handler.name,
            "in room",
            data.room.name,
          );
        }
        return;
      }
    }
  },
};

export const dynamicSpawnCreepPlan = function (
  _room: Room,
  permanentCreeps: RoomSpawnPlan[],
) {
  return permanentCreeps;
};
