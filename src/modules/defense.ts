import { melee } from "../creeps/roles/melee.ts";

export const defense: RoomModule = {
  create: function () {
    return this;
  },
  execute: (room) => {
    let hostiles: Creep[] = [];

    if (Game.time % 3 == 0) {
      hostiles = room.find(FIND_HOSTILE_CREEPS);
      room.memory.isSafe = hostiles.length == 0;
    }

    if (room.memory.isSafe) {
      return;
    }

    if (hostiles.length == 0) {
      hostiles = room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length == 0) {
        room.memory.isSafe = true;
        return;
      }
    }

    const center = new RoomPosition(25, 25, room.name);
    hostiles.sort(
      (a, b) => a.pos.getRangeTo(center) - b.pos.getRangeTo(center),
    );

    const towers = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER,
    });
    towers.forEach((tower) => tower.attack(hostiles[0]));

    if (towers.length == 0) {
      const body = generateCreepBody(room.energyCapacityAvailable);
      const spawn = room.find(FIND_MY_SPAWNS)[0];

      if (spawn) {
        spawn.spawnCreep(body, `defense_${Game.time} `, {
          memory: {
            roleId: melee.id,
            generation: 99,
            room: room.name,
            status: "spawned",
          },
        });
      }
    }
  },
};

function generateCreepBody(energy: number): BodyPartConstant[] {
  const unitCost = 190; // 1 ATTACK + 1 TOUGH + 2 MOVE
  const maxUnits = 12;
  const n = Math.min(Math.floor(energy / unitCost), maxUnits);

  const body: BodyPartConstant[] = [];
  body.push(...Array(n).fill(TOUGH));
  body.push(...Array(n).fill(ATTACK));
  body.push(...Array(2 * n).fill(MOVE));

  return body;
}
