import { tickCache } from "../../cache/TickCache.ts";
import { DeliverRefillEnergyTask } from "../tasks/DeliverRefillEnergyTask.ts";
import { GatherRefillEnergyTask } from "../tasks/GatherRefillEnergyTask.ts";
import { TaskStatus } from "../../types.ts";

class RefillerRole implements CreepRoleHandler {
  public name = "refiller";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const extensions = tickCache.get(`extensions_${room.name}`, () =>
      room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION },
      }),
    );
    if (extensions.length === 0) {
      return [];
    }

    const refillersInRoom = tickCache.get(`refillers_${room.name}`, () =>
      Object.values(Game.creeps).filter(
        (cr) => cr.memory.role === this.name && cr.memory.room === room.name,
      ),
    );

    const baseLimit = 1;
    let currentLimit = baseLimit;

    if (refillersInRoom.length === baseLimit) {
      // Pre-spawn logic
      const refiller = refillersInRoom[0];
      const preSpawnTicks = 50; // Start spawning 50 ticks before death
      if (
        refiller.ticksToLive !== undefined &&
        refiller.ticksToLive <= preSpawnTicks
      ) {
        currentLimit = baseLimit + 1; // Temporarily increase limit to spawn a replacement
      }
    }

    // Abort if the number of creeps already meets or exceeds the current limit
    if (refillersInRoom.length >= currentLimit) {
      return [];
    }

    const isEmergency = refillersInRoom.length === 0;
    let body: SpawnCreepBody[];

    if (isEmergency) {
      // In an emergency, spawn what we can afford right now.
      const energy = Math.max(room.energyAvailable, 300);
      body = this.calculateBody(energy);
    } else {
      // For a planned replacement, wait for full energy capacity.
      body = this.calculateBody(room.energyCapacityAvailable);
    }

    if (body.length === 0) {
      return [];
    }

    return [
      {
        handlerName: this.name,
        body: body,
        generation: 1,
        limit: currentLimit, // Use the potentially increased limit
        priority: 11,
      },
    ];
  }

  public run(creep: Creep): void {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      const task = new DeliverRefillEnergyTask();
      if (task.execute(creep) !== TaskStatus.FAILED) {
        return;
      }
    } else {
      const task = new GatherRefillEnergyTask();
      if (task.execute(creep) !== TaskStatus.FAILED) {
        return;
      }
    }

    this.executeIdleTask(creep);
  }

  private calculateBody(energyCapacity: number): SpawnCreepBody[] {
    const blockCost = 150; // CARRY, CARRY, MOVE
    const numberOfBlocks = Math.floor(energyCapacity / blockCost);
    const carryCount = Math.min(numberOfBlocks * 2, 32);
    const moveCount = Math.min(numberOfBlocks, 16);
    if (carryCount > 0) {
      return [
        { count: carryCount, body: CARRY },
        { count: moveCount, body: MOVE },
      ];
    }
    return [];
  }

  private executeIdleTask(creep: Creep): void {
    const storage = creep.room.storage;
    if (storage && !creep.pos.inRangeTo(storage, 2)) {
      creep.customMoveTo(storage);
    }
    creep.debugSay("😴");
  }
}

export const refiller = new RefillerRole();
