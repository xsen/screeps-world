import { spawnPlan as manualSpawnPlan } from "../spawner/spawnPlan.ts";
import { roles } from "../creeps/roles.ts";
import { utils } from "../utils.ts";
import { CreepBodyBuilder } from "../spawner/CreepBodyBuilder.ts";

export class SpawnManager {
  private readonly room: Room;
  private readonly spawner: StructureSpawn | undefined;
  private readonly bodyBuilder: CreepBodyBuilder;

  constructor(room: Room) {
    this.room = room;
    this.spawner = room.find(FIND_MY_SPAWNS).find((s) => !s.spawning);
    this.bodyBuilder = new CreepBodyBuilder();
  }

  public run(): void {
    if (!this.spawner) {
      return;
    }

    const plans = this.getPlansForRoom(this.room);
    if (plans.length === 0) return;

    // Sort by priority DESCENDING (highest first)
    plans.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const plan of plans) {
      const handler = roles.get(plan.handlerName);
      if (!handler) {
        utils.log(
          `[${this.room.name}][SpawnManager] Error: no role for spawn plan ${plan.handlerName}`,
        );
        continue;
      }

      const result = this.processSpawnPlan(plan, handler);
      if (result.shouldStop) {
        return; // Stop processing further plans
      }
    }
  }

  private getPlansForRoom(room: Room): SpawnPlan[] {
    // Start with the default plans from roles
    let allPlans: SpawnPlan[] = [];
    for (const handler of roles.values()) {
      try {
        const plansFromRole = handler.getSpawnPlans(room);
        if (plansFromRole) {
          allPlans.push(...plansFromRole);
        }
      } catch (e) {
        utils.log(
          `[${room.name}][SpawnManager] Error getting spawn plans for role ${handler.name}: ${e}`,
        );
      }
    }

    // Add manual plans if they exist for the room
    if (manualSpawnPlan[room.name]) {
      allPlans.push(...manualSpawnPlan[room.name]);
    }

    return allPlans;
  }

  private processSpawnPlan(
    plan: SpawnPlan,
    handler: CreepRoleHandler,
  ): { shouldStop: boolean } {
    const spawnRoomName = plan.targetRoom || this.room.name;
    const liveCreeps = this.getCreepsForPlan(plan, spawnRoomName, handler);
    const limit = this.resolveValue(plan.limit, this.room);

    if (liveCreeps.length < limit) {
      if (this.isAlreadySpawningForPlan(plan, handler)) {
        return { shouldStop: false };
      }

      const bodyConfig = this.resolveValue(plan.body, this.room);
      const body = this.bodyBuilder.build(
        bodyConfig,
        plan.minBody,
        plan.isEmergency,
        this.room.energyAvailable,
      );

      if (!body) {
        // Not enough energy for this high-priority creep.
        // Stop everything and wait for energy to replenish.
        return { shouldStop: true };
      }

      const memory = this.createCreepMemory(plan, handler);
      const spawned = this.trySpawnCreep(body, memory);
      // If we spawned something, stop for this tick.
      return { shouldStop: spawned };
    }
    return { shouldStop: false };
  }

  private resolveValue<T>(value: T | ((room: Room) => T), room: Room): T {
    if (typeof value === "function") {
      return (value as (room: Room) => T)(room);
    }
    return value;
  }

  private getCreepsForPlan(
    plan: SpawnPlan,
    spawnRoomName: string,
    handler: CreepRoleHandler,
  ): Creep[] {
    return Object.values(Game.creeps).filter((cr) => {
      const isSameBase =
        cr.memory.room === spawnRoomName && cr.memory.role === handler.name;
      if (!isSameBase) return false;

      // If plan is for a specific target (like a miner), match by targetId
      if (plan.targetId) {
        return cr.memory.targetId === plan.targetId;
      }

      // Otherwise, match by generation (like for different command roles)
      return cr.memory.generation === plan.generation;
    });
  }

  private isAlreadySpawningForPlan(
    plan: SpawnPlan,
    handler: CreepRoleHandler,
  ): boolean {
    if (!this.spawner || !this.spawner.spawning) {
      return false;
    }
    const spawningMemory = Memory.creeps[this.spawner.spawning.name];

    const isSameBase =
      spawningMemory.role === handler.name &&
      spawningMemory.room === (plan.targetRoom || this.room.name);
    if (!isSameBase) return false;

    if (plan.targetId) {
      return spawningMemory.targetId === plan.targetId;
    }

    return spawningMemory.generation === plan.generation;
  }

  private createCreepMemory(
    plan: SpawnPlan,
    handler: CreepRoleHandler,
  ): CreepMemory {
    return {
      role: handler.name,
      generation: plan.generation,
      room: plan.targetRoom || this.room.name,
      status: "spawned",
      commands: this.resolveValue(plan.commands, this.room),
      targetId: plan.targetId,
    };
  }

  private trySpawnCreep(
    body: BodyPartConstant[],
    memory: CreepMemory,
  ): boolean {
    if (!this.spawner) return false;

    const name = `${memory.role.substring(0, 3)}-${memory.generation}${(Game.time % 46656).toString(36)}`;
    const result = this.spawner.spawnCreep(body, name, { memory });

    if (result === OK) {
      utils.log(
        `[${this.room.name}][SpawnManager] Spawning ${name} for room "${memory.room}"`,
      );
      return true;
    }

    if (result !== ERR_NOT_ENOUGH_ENERGY) {
      utils.log(
        `[${this.room.name}][SpawnManager] Failed to spawn ${name}. Result: ${result}. Body: [${body}]`,
      );
    }
    return false;
  }
}
