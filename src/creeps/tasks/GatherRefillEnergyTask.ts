import { TaskStatus } from "../../types.ts";
import { WithdrawFromTarget } from "./WithdrawFromTarget.ts";
import { PickupResource } from "./PickupResource.ts";

export class GatherRefillEnergyTask implements Task {
  execute(creep: Creep): TaskStatus {
    let target = creep.getCreepTarget<
      StructureStorage | StructureContainer | Resource
    >();

    // Validate existing target
    if (target) {
      const isInvalidType =
        !(target instanceof StructureStorage) &&
        !(target instanceof StructureContainer) &&
        !(target instanceof Resource);
      const isEmpty =
        ("store" in target &&
          target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
        ("amount" in target && target.amount === 0);
      if (isInvalidType || isEmpty) {
        target = null;
        creep.setCreepTarget(null);
      }
    }

    // Find new target if needed
    if (!target) {
      if (
        creep.room.storage &&
        creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      ) {
        target = creep.room.storage;
      } else {
        const container = creep.pos.findClosestByPath<StructureContainer>(
          FIND_STRUCTURES,
          {
            filter: (s) =>
              s.structureType === STRUCTURE_CONTAINER &&
              s.store.getUsedCapacity(RESOURCE_ENERGY) > 100,
          },
        );
        if (container) {
          target = container;
        } else {
          const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 50,
          });
          if (dropped) target = dropped;
        }
      }
      if (target) {
        creep.setCreepTarget(target);
      }
    }

    // Execute withdrawal/pickup task
    if (target) {
      if (target instanceof Resource) {
        return new PickupResource(target).execute(creep);
      } else {
        return new WithdrawFromTarget(target).execute(creep);
      }
    }

    return TaskStatus.FAILED;
  }
}
