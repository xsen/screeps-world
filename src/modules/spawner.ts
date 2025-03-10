import { permanentCreeps } from "../creeps/permanentCreeps.ts";

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

    const pCreeps: PermanentCreeps[] = this.config.creeps[data.room.name];
    if (!pCreeps) return;

    for (const pCr of pCreeps) {
      const spawnRoomName = pCr.room ? pCr.room : data.room.name;
      const count = Object.values(Game.creeps).filter(
        (cr) =>
          cr.memory.room === spawnRoomName &&
          cr.memory.roleId === pCr.handler.id &&
          cr.memory.generation === pCr.generation,
      ).length;

      if (count < pCr.limit) {
        const body: BodyPartConstant[] = [];
        for (const b of pCr.body) {
          for (let i = 0; i < b.count; i++) {
            body.push(b.body);
          }
        }

        const name = `${pCr.handler.name}_${pCr.generation}_${Game.time}`;
        const res = spawner.spawnCreep(body, name, {
          memory: {
            roleId: pCr.handler.id,
            generation: pCr.generation,
            room: pCr.room ? pCr.room : data.room.name,
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
          console.log("Spawned", pCr.handler.name, "in room", data.room.name);
        }

        return;
      }
    }
  },
};
