import { DeliverEnergyTask } from "../tasks/DeliverEnergyTask.ts";
import { WithdrawFromTarget } from "../tasks/WithdrawFromTarget.ts";
import { PickupResource } from "../tasks/PickupResource.ts";
import { TaskStatus } from "../../types.ts";

// enum CarryState {
//   GATHERING,
//   DELIVERING,
//   IDLE,
// }

class CarryRole implements CreepRoleHandler {
  public name = "carry";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    room.name;
    // This is a legacy role, spawn plans are defined manually in spawnPlan.ts
    return [];
  }

  public run(creep: Creep): void {
    // Simple state update
    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false;
      creep.setCreepTarget(null);
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      creep.setCreepTarget(null);
    }

    if (creep.memory.working) {
      this.executeDelivering(creep);
    } else {
      this.executeGathering(creep);
    }
  }

  private executeDelivering(creep: Creep): void {
    const target = creep.room.storage; // The ONLY delivery target for a Carry/Hauler

    if (target) {
      // No need to cache this target, it's always the same.
      const taskResult = new DeliverEnergyTask(target).execute(creep);
      if (taskResult === TaskStatus.COMPLETED) {
        // Creep is empty, will switch to gathering on next tick.
      }
    } else {
      creep.debugSay("NO STRG?");
    }
  }

  private executeGathering(creep: Creep): void {
    let target = creep.getCreepTarget<
      Resource | Ruin | Tombstone | StructureContainer
    >();

    if (target) {
      const isDepleted =
        ("store" in target && target.store.getUsedCapacity() === 0) ||
        ("amount" in target && target.amount === 0);
      if (isDepleted) {
        target = null;
        creep.setCreepTarget(null);
      }
    }

    if (!target) {
      target = this.findNewGatherTarget(creep);
      if (target) {
        creep.setCreepTarget(target);
      }
    }

    if (target) {
      const task =
        target instanceof Resource
          ? new PickupResource(target)
          : new WithdrawFromTarget(target);
      const taskResult = task.execute(creep);
      if (taskResult === TaskStatus.COMPLETED) {
        creep.setCreepTarget(null);
      }
    } else {
      if (creep.store.getUsedCapacity() > 0) {
        creep.memory.working = true;
      } else {
        creep.debugSay("🤷‍♂️");
      }
    }
  }

  private findNewGatherTarget(
    creep: Creep,
  ): Resource | Ruin | Tombstone | StructureContainer | null {
    const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.amount > 50,
    });
    if (dropped) return dropped;

    const ruin = creep.pos.findClosestByPath(FIND_RUINS, {
      filter: (r) => r.store.getUsedCapacity() > 0,
    });
    if (ruin) return ruin;

    const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
      filter: (t) => t.store.getUsedCapacity() > 0,
    });
    if (tombstone) return tombstone;

    if (creep.room.storage) {
      const container = creep.pos.findClosestByPath<StructureContainer>(
        FIND_STRUCTURES,
        {
          filter: (s) =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getUsedCapacity() > 200,
        },
      );
      if (container) return container;
    }
    return null;
  }
}

export const carry = new CarryRole();
