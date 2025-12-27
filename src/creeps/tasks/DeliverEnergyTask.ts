import {TaskStatus} from "../../types.ts";

export class DeliverEnergyTask implements Task {
  constructor(private target: StructureExtension | StructureSpawn | StructureTower | StructureStorage | StructureLink) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    if (this.target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    const amountToTransfer = Math.min(
      creep.store.getUsedCapacity(RESOURCE_ENERGY),
      this.target.store.getFreeCapacity(RESOURCE_ENERGY)
    );

    const result = creep.transfer(this.target, RESOURCE_ENERGY, amountToTransfer);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
      return TaskStatus.IN_PROGRESS;
    }
    if (result === OK) {
      // Task continues until creep is empty
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.FAILED;
  }
}
