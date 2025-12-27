import {melee} from "../creeps/roles/MeleeRole.ts";

class DefenseModule implements RoomModule {
  private static instance: DefenseModule;

  public create(): RoomModule {
    if (!DefenseModule.instance) {
      DefenseModule.instance = new DefenseModule();
    }
    return DefenseModule.instance;
  }

  public execute(room: Room): void {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    if (hostiles.length > 0) {
      this.handleHostiles(room, hostiles);
    } else {
      this.clearTargetFromMemory(room);
    }
  }

  private handleHostiles(room: Room, hostiles: Creep[]): void {
    const target = this.findBestTarget(room, hostiles);
    if (target) {
      this.attackWithTowers(room, target);
    }
    this.spawnMeleeDefenders(room, hostiles);
  }

  private findBestTarget(room: Room, hostiles: Creep[]): Creep | null {
    if (room.memory.targetId) {
      const potentialTarget = Game.getObjectById(room.memory.targetId);
      if (potentialTarget && hostiles.some(h => h.id === potentialTarget.id)) {
        return potentialTarget;
      }
      delete room.memory.targetId;
    }

    const sortedHostiles = [...hostiles].sort((a, b) => {
      const aHasHeal = a.body.some(part => part.type === HEAL);
      const bHasHeal = b.body.some(part => part.type === HEAL);
      if (aHasHeal && !bHasHeal) return -1;
      if (!aHasHeal && bHasHeal) return 1;
      return 0;
    });

    const newTarget = sortedHostiles[0];
    if (newTarget) {
      room.memory.targetId = newTarget.id;
      return newTarget;
    }

    return null;
  }

  private attackWithTowers(room: Room, target: Creep): void {
    const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
      filter: {structureType: STRUCTURE_TOWER},
    });
    for (const tower of towers) {
      tower.attack(target);
    }
  }

  private spawnMeleeDefenders(room: Room, hostiles: Creep[]): void {
    const meleeCreeps = room.find(FIND_MY_CREEPS, {
      filter: (creep) => creep.memory.role === melee.name,
    });

    if (hostiles.length > 1 && meleeCreeps.length < 2) {
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

  private clearTargetFromMemory(room: Room): void {
    if (room.memory.targetId) {
      delete room.memory.targetId;
    }
  }
}

export const defenseModule = new DefenseModule();
