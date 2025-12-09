import { melee } from "../creeps/roles/MeleeRole.ts";

class DefenseModule implements RoomModule {
  private static instance: DefenseModule;

  create(): RoomModule {
    if (!DefenseModule.instance) {
      DefenseModule.instance = new DefenseModule();
    }
    return DefenseModule.instance;
  }

  execute(room: Room): void {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    if (hostiles.length > 0) {
      const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER },
      });

      towers.forEach((tower) => tower.attack(hostiles[0]));
    }

    const meleeCreeps = room.find(FIND_MY_CREEPS, {
      filter: (creep) => creep.memory.role === melee.name,
    });

    if (hostiles.length > 0 && meleeCreeps.length < 2) {
      const spawner = room.find(FIND_MY_SPAWNS)[0];
      if (spawner && !spawner.spawning) {
        const name = `${melee.name}-${Game.time}`;
        spawner.spawnCreep([TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK], name, {
          memory: {
            role: melee.name,
            generation: 0,
            room: room.name,
            status: "spawned",
          },
        });
      }
    }
  }
}

export const defenseModule = new DefenseModule();
