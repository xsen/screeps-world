import { manualPlan } from "./manualPlan.ts";
import { roles } from "../creeps/roles.ts";

export class ManualSpawnPlanner {
  room: Room;
  creeps: Creep[] | undefined;

  constructor(room: Room) {
    this.room = room;
  }

  spawn() {
    const spawner = this.room.find(FIND_MY_SPAWNS)[0];
    if (!spawner || spawner.spawning != null) {
      return;
    }

    const roomSpawnPlans: ManualSpawnPlan[] =
      manualPlan.get(this.room.name) || [];
    if (!roomSpawnPlans || roomSpawnPlans.length == 0) return;
    for (const spawnPlan of roomSpawnPlans) {
      const handler = roles.get(spawnPlan.handlerId);
      if (handler == null) {
        console.log("Error: no role in the current spawn plan", spawnPlan);
        return;
      }

      const spawnRoomName =
        spawnPlan.targetRoom != null ? spawnPlan.targetRoom : this.room.name;

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
            `Spawning ${handler.name}-${spawnPlan.generation} in ${this.room.name} for target room "${spawnRoomName}"`,
          );
        }
        return;
      }
    }
  }
}
