import { spawnPlan } from "../spawner/spawnPlan.ts";
import { roles } from "../creeps/roles.ts";
import { utils } from "../utils.ts";

export class SpawnManager {
  private readonly room: Room;
  private readonly spawner: StructureSpawn | undefined;

  constructor(room: Room) {
    this.room = room;
    this.spawner = room.find(FIND_MY_SPAWNS).find((s) => !s.spawning);
  }

  public run(): void {
    if (!this.spawner) {
      return;
    }

    let roomSpawnPlans: SpawnPlan[] = spawnPlan[this.room.name] || [];
    if (roomSpawnPlans.length === 0) return;

    roomSpawnPlans.sort((a: SpawnPlan, b: SpawnPlan) => {
      const handlerA = roles.get(a.handlerName);
      const handlerB = roles.get(b.handlerName);

      const priorityA =
        a.priority !== undefined && a.priority !== null
          ? a.priority
          : handlerA?.defaultPriority !== undefined &&
              handlerA?.defaultPriority !== null
            ? handlerA.defaultPriority
            : 0;
      const priorityB =
        b.priority !== undefined && b.priority !== null
          ? b.priority
          : handlerB?.defaultPriority !== undefined &&
              handlerB?.defaultPriority !== null
            ? handlerB.defaultPriority
            : 0;

      return priorityB - priorityA;
    });

    for (const currentSpawnPlan of roomSpawnPlans) {
      const handler = roles.get(currentSpawnPlan.handlerName);
      if (!handler) {
        console.log("Error: no role for spawn plan", currentSpawnPlan);
        continue;
      }

      const spawnRoomName = currentSpawnPlan.targetRoom || this.room.name;

      const liveCreeps = this._getLiveCreepsForPlan(
        currentSpawnPlan,
        spawnRoomName,
        handler,
      );
      const spawningCreepMemory = this._getSpawningCreepMemoryForPlan(
        currentSpawnPlan,
        spawnRoomName,
        handler,
      );

      const currentCreepCount =
        liveCreeps.length + (spawningCreepMemory ? 1 : 0);

      // --- Логика спавна ---
      // 1. Обычный спавн: если крипов меньше лимита и никто не спавнится
      if (currentCreepCount < currentSpawnPlan.limit) {
        if (!spawningCreepMemory) {
          const body = this.buildDynamicBody(currentSpawnPlan, handler);
          if (!body) {
            utils.log(
              `[SpawnManager] Failed to build body for normal spawn of ${currentSpawnPlan.handlerName}.`,
            );
            continue;
          }

          const memory = this._getCreepMemory(currentSpawnPlan, handler);

          if (this._trySpawnCreep(body, memory)) {
            return; // Спавним только одного крипа за тик
          } else {
            utils.log(
              `[SpawnManager] Failed to initiate normal spawn for ${currentSpawnPlan.handlerName}.`,
            );
          }
        }
      }
      // 2. Предварительный спавн: если крипов ровно лимит, есть умирающий крип и никто не спавнится
      else if (currentCreepCount === currentSpawnPlan.limit) {
        const preSpawnTicks =
          currentSpawnPlan.preSpawnTicks || handler.defaultPreSpawnTicks;

        if (preSpawnTicks) {
          const dyingCreep = liveCreeps.find(
            (creep) => creep.ticksToLive && creep.ticksToLive <= preSpawnTicks,
          );

          if (dyingCreep && !spawningCreepMemory) {
            const body = this.buildDynamicBody(currentSpawnPlan, handler);
            if (!body) {
              utils.log(
                `[SpawnManager] Failed to build body for pre-spawn of ${currentSpawnPlan.handlerName}.`,
              );
              continue;
            }

            const memory = this._getCreepMemory(
              currentSpawnPlan,
              handler,
              dyingCreep.memory.targetId,
            );

            if (this._trySpawnCreep(body, memory)) {
              return; // Спавним только одного крипа за тик
            } else {
              utils.log(
                `[SpawnManager] Failed to initiate pre-spawn for ${currentSpawnPlan.handlerName}.`,
              );
            }
          }
        }
      }
      // 3. Если крипов больше лимита, ничего не делаем (позволяем избыточным умереть)
      // Логика здесь не нужна, так как это ожидаемое поведение.
    }
  }

  private _getLiveCreepsForPlan(
    spawnPlan: SpawnPlan,
    spawnRoomName: string,
    handler: CreepRoleHandler,
  ): Creep[] {
    const creeps = Object.values(Game.creeps).filter(
      (cr) =>
        cr.memory.room === spawnRoomName &&
        cr.memory.role === handler.name &&
        cr.memory.generation === spawnPlan.generation,
    );
    return creeps;
  }

  private _getSpawningCreepMemoryForPlan(
    spawnPlan: SpawnPlan,
    spawnRoomName: string,
    handler: CreepRoleHandler,
  ): CreepMemory | null {
    if (!this.spawner || !this.spawner.spawning) {
      return null;
    }
    const spawningCreepName = this.spawner.spawning.name;
    const spawningCreep = Game.creeps[spawningCreepName];

    if (
      spawningCreep &&
      spawningCreep.memory.room === spawnRoomName &&
      spawningCreep.memory.role === handler.name &&
      spawningCreep.memory.generation === spawnPlan.generation
    ) {
      return spawningCreep.memory;
    }
    return null;
  }

  private _getCreepMemory(
    spawnPlan: SpawnPlan,
    handler: CreepRoleHandler,
    targetId?: Id<AnyStructure | Source | Resource>,
  ): CreepMemory {
    return {
      role: handler.name,
      generation: spawnPlan.generation,
      room: spawnPlan.targetRoom || this.room.name,
      status: "spawned",
      commands: spawnPlan.commands,
      targetId: targetId,
    };
  }

  private _trySpawnCreep(
    body: BodyPartConstant[],
    memory: CreepMemory,
  ): boolean {
    if (!this.spawner) return false;

    const name = `${memory.role}-${memory.generation}-${Game.time}`;
    const result = this.spawner.spawnCreep(body, name, { memory });

    if (result === OK) {
      console.log(
        `[SpawnManager] Spawning ${name} in ${this.room.name} for room "${memory.room}" with body [${body}]`,
      );
      return true;
    } else if (result === ERR_NOT_ENOUGH_ENERGY) {
      console.log(
        `[SpawnManager] Not enough energy to spawn ${name} in ${this.room.name}. Required: ${this.calculateCost(body)}, Available: ${this.room.energyAvailable}.`,
      );
    } else {
      utils.log(
        `[SpawnManager] Failed to spawn ${name} in ${this.room.name}. Result: ${result}. Body: [${body}]`,
      );
    }
    return false;
  }

  private buildDynamicBody(
    spawnPlan: SpawnPlan,
    handler: CreepRoleHandler,
  ): BodyPartConstant[] | null {
    const fullBody = this.buildBody(spawnPlan.body);
    const fullCost = this.calculateCost(fullBody);
    const energyAvailable = this.room.energyAvailable;

    if (energyAvailable >= fullCost) {
      return fullBody;
    }

    const isEmergency = spawnPlan.isEmergency || handler.defaultIsEmergency;
    const minBodyConfig = spawnPlan.minBody || handler.defaultMinBody;

    if (!isEmergency || !minBodyConfig) {
      return null;
    }

    const minBody = this.buildBody(minBodyConfig);
    const minCost = this.calculateCost(minBody);

    if (energyAvailable < minCost) {
      return null;
    }

    let dynamicBody = [...minBody];
    let currentCost = minCost;

    const additionalParts = this.getAdditionalParts(fullBody, minBody);

    for (const part of additionalParts) {
      const partCost = BODYPART_COST[part];
      if (currentCost + partCost <= energyAvailable) {
        dynamicBody.push(part);
        currentCost += partCost;
      } else {
        break;
      }
    }

    dynamicBody.sort((a, b) => {
      const order: { [key in BodyPartConstant]: number } = {
        [TOUGH]: 1,
        [WORK]: 2,
        [CARRY]: 3,
        [MOVE]: 4,
        [ATTACK]: 5,
        [RANGED_ATTACK]: 6,
        [HEAL]: 7,
        [CLAIM]: 8,
      };
      return (order[a] || 99) - (order[b] || 99);
    });

    return dynamicBody;
  }

  private getAdditionalParts(
    fullBody: BodyPartConstant[],
    minBody: BodyPartConstant[],
  ): BodyPartConstant[] {
    const minBodyCounts: { [key: string]: number } = {};
    for (const part of minBody) {
      minBodyCounts[part] = (minBodyCounts[part] || 0) + 1;
    }

    const additionalParts: BodyPartConstant[] = [];
    for (const part of fullBody) {
      if (minBodyCounts[part] && minBodyCounts[part] > 0) {
        minBodyCounts[part]--;
      } else {
        additionalParts.push(part);
      }
    }
    return additionalParts;
  }

  private buildBody(bodyParts: SpawnCreepBody[]): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];
    for (const part of bodyParts) {
      for (let i = 0; i < part.count; i++) {
        body.push(part.body);
      }
    }
    return body;
  }

  private calculateCost(parts: BodyPartConstant[]): number {
    return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }
}
