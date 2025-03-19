import { spawnPlans } from "../creeps/spawnPlans.ts";
import { roles } from "../creeps/roles.ts";

export const spawner: RoomModule = {
  create: function () {
    if (Game.time % 10 == 0) {
      for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
          delete Memory.creeps[name];
        }
      }
    }

    return this;
  },
  execute: function (room) {
    const spawner = room.find(FIND_MY_SPAWNS)[0];
    if (!spawner || spawner.spawning != null) {
      return;
    }

    let roomSpawnPlans: RoomSpawnPlan[] = spawnPlans.get(room.name) || [];
    if (!roomSpawnPlans || roomSpawnPlans.length == 0) return;

    roomSpawnPlans = dynamicSpawnCreepPlan(room, roomSpawnPlans);
    for (const spawnPlan of roomSpawnPlans) {
      const handler = roles.get(spawnPlan.handlerId);
      if (handler == null) {
        console.log("Error: no role in the current spawn plan", spawnPlan);
        return;
      }

      const spawnRoomName =
        spawnPlan.targetRoom != null ? spawnPlan.targetRoom : room.name;

      const count = Object.values(Game.creeps).filter(
        (cr) =>
          cr.memory.room === spawnRoomName &&
          cr.memory.roleId === handler.id &&
          cr.memory.generation === spawnPlan.generation,
      ).length;

      if (count < spawnPlan.limit) {
        const body: BodyPartConstant[] = [];
        for (const b of spawnPlan.body) {
          for (let i = 0; i < b.count; i++) {
            body.push(b.body);
          }
        }

        const name = `${handler.name}-${spawnPlan.generation}-${Game.time}`;
        const res = spawner.spawnCreep(body, name, {
          memory: {
            roleId: handler.id,
            generation: spawnPlan.generation,
            room: spawnRoomName,
            status: "spawned",
            commands: spawnPlan.commands,
          },
        });

        if (res == OK) {
          console.log(
            `Spawning ${handler.name}-${spawnPlan.generation} in ${room.name} for target room "${spawnRoomName}"`,
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
