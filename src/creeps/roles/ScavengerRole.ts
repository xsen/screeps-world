import { tickCache } from "../../cache/TickCache.ts";
import { PickupResource } from "../tasks/PickupResource.ts";
import { WithdrawFromTarget } from "../tasks/WithdrawFromTarget.ts";
import { DeliverToTarget } from "../tasks/DeliverToTarget.ts";
import { GatherHaulEnergyTask } from "../tasks/GatherHaulEnergyTask.ts";
import { TaskStatus } from "../../types.ts";

// Define a specific memory interface for this role
interface ScavengerMemory extends CreepMemory {
  isAssisting?: boolean;
}

class ScavengerRole implements CreepRoleHandler {
  public name = "scavenger";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const valuableDropped = tickCache.get(`valuable_dropped_${room.name}`, () =>
      room.find(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.amount > 200 || r.resourceType !== RESOURCE_ENERGY,
      }),
    );
    const tombsWithResources = tickCache.get(`tombs_${room.name}`, () =>
      room.find(FIND_TOMBSTONES, {
        filter: (t) => t.store.getUsedCapacity() > 0,
      }),
    );
    const ruinsWithResources = tickCache.get(`ruins_${room.name}`, () =>
      room.find(FIND_RUINS, { filter: (r) => r.store.getUsedCapacity() > 0 }),
    );

    if (
      valuableDropped.length === 0 &&
      tombsWithResources.length === 0 &&
      ruinsWithResources.length === 0
    ) {
      return [];
    }

    return [
      {
        handlerName: this.name,
        body: [
          { count: 4, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 1,
        limit: 1,
        priority: 9,
      },
    ];
  }

  public run(creep: Creep): void {
    const memory = creep.memory as ScavengerMemory;
    if (memory.isAssisting === undefined) {
      memory.isAssisting = false;
    }

    const store = creep.store;

    // State transition: If we were assisting and are now empty, stop assisting.
    if (memory.isAssisting && store.getUsedCapacity() === 0) {
      memory.isAssisting = false;
      creep.setCreepTarget(null);
    }

    // --- Execute logic based on current state ---

    if (memory.isAssisting) {
      // Try to gather if we have space
      if (store.getFreeCapacity() > 0) {
        const gatherResult = new GatherHaulEnergyTask().execute(creep);
        if (gatherResult !== TaskStatus.FAILED) {
          // If we just became full, immediately clear the target for next tick
          if (store.getFreeCapacity() === 0) {
            creep.setCreepTarget(null);
          }
          return;
        }
      }

      // If we are here, it means we are full OR gathering failed.
      // If we have any energy, deliver it.
      if (store.getUsedCapacity() > 0) {
        const storage = creep.room.storage;
        if (storage) {
          new DeliverToTarget(storage, RESOURCE_ENERGY).execute(creep);
        }
      }
      return;
    } else {
      // --- If we are NOT assisting, do scavenger work ---

      // Priority 1: Gather if there's space
      if (store.getFreeCapacity() > 0) {
        if (this.executeGathering(creep)) {
          // If we just became full, immediately clear the target for next tick
          if (store.getFreeCapacity() === 0) {
            creep.setCreepTarget(null);
          }
          return;
        }
      }

      // Priority 2: Deliver if we have anything
      if (store.getUsedCapacity() > 0) {
        if (this.executeDelivering(creep)) {
          return;
        }
        // If delivering fails, just stop to prevent wrong state changes.
        return;
      }

      // Priority 3: If we are empty and found no work, switch to assisting
      if (store.getUsedCapacity() === 0) {
        memory.isAssisting = true;
        creep.setCreepTarget(null); // Important to clear old scavenge target
        new GatherHaulEnergyTask().execute(creep);
        return;
      }
    }

    // Fallback idle state
    this.executeIdleTask(creep);
  }

  private executeDelivering(creep: Creep): boolean {
    let target = creep.getCreepTarget<
      StructureStorage | StructureTerminal | StructureContainer
    >();

    if (
      target &&
      (!("store" in target) || target.store.getFreeCapacity() === 0)
    ) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      target =
        creep.room.storage ||
        creep.room.terminal ||
        creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
          filter: (s: AnyStructure) =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity() > 0,
        });
      if (target) creep.setCreepTarget(target);
    }

    if (target) {
      for (const resourceType in creep.store) {
        if (creep.store[resourceType as ResourceConstant] > 0) {
          new DeliverToTarget(target, resourceType as ResourceConstant).execute(
            creep,
          );
          return true;
        }
      }
    }
    return false;
  }

  private executeGathering(creep: Creep): boolean {
    let target = creep.getCreepTarget<Resource | Tombstone | Ruin>();

    if (target) {
      const isInvalidType =
        !(target instanceof Resource) &&
        !(target instanceof Tombstone) &&
        !(target instanceof Ruin);
      const isEmpty =
        ("store" in target && target.store.getUsedCapacity() === 0) ||
        ("amount" in target && target.amount === 0);

      if (isInvalidType || isEmpty) {
        target = null;
        creep.setCreepTarget(null);
      }
    }

    if (!target) {
      const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.amount > 200 || r.resourceType !== RESOURCE_ENERGY,
      });
      if (dropped) {
        target = dropped;
      } else {
        const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
          filter: (t) => t.store.getUsedCapacity() > 0,
        });
        if (tombstone) {
          target = tombstone;
        } else {
          const ruin = creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (r) => r.store.getUsedCapacity() > 0,
          });
          if (ruin) target = ruin;
        }
      }
      if (target) creep.setCreepTarget(target);
    }

    if (target) {
      let task: Task;
      if (target instanceof Resource) {
        task = new PickupResource(target);
      } else {
        task = new WithdrawFromTarget(target);
      }
      task.execute(creep);
      return true;
    }
    return false;
  }

  private executeIdleTask(creep: Creep): void {
    const storage = creep.room.storage;
    if (storage && !creep.pos.inRangeTo(storage, 2)) {
      creep.customMoveTo(storage);
    }
    creep.debugSay("😴");
  }
}

export const scavenger = new ScavengerRole();
