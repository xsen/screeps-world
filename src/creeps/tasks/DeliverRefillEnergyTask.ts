import { TaskStatus } from "../../types.ts";
import { DeliverEnergyTask } from "./DeliverEnergyTask.ts";

export class DeliverRefillEnergyTask implements Task {
  execute(creep: Creep): TaskStatus {
    let target = creep.getCreepTarget<
      StructureSpawn | StructureExtension | StructureTower
    >();

    // Validate existing target
    if (target) {
      const isInvalidType =
        !([
          STRUCTURE_SPAWN,
          STRUCTURE_EXTENSION,
          STRUCTURE_TOWER,
        ] as StructureConstant[]).includes(target.structureType);
      const isFull = target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
      if (isInvalidType || isFull) {
        target = null;
        creep.setCreepTarget(null);
      }
    }

    // Find new target if needed
    if (!target) {
      target = creep.pos.findClosestByPath<
        StructureSpawn | StructureExtension | StructureTower
      >(FIND_STRUCTURES, {
        filter: (s: AnyStructure) => {
          if (
            s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION ||
            s.structureType === STRUCTURE_TOWER
          ) {
            return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
          return false;
        },
      });
      if (target) {
        creep.setCreepTarget(target);
      }
    }

    // Execute delivery task
    if (target) {
      return new DeliverEnergyTask(target).execute(creep);
    }

    return TaskStatus.FAILED;
  }
}
