import {TaskStatus} from "../../types.ts";

export class WithdrawFromTarget implements Task {
  constructor(private target: StructureStorage | StructureContainer | StructureLink | Tombstone | Ruin) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }
    if (this.target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    const result = creep.withdraw(this.target, RESOURCE_ENERGY);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
      return TaskStatus.IN_PROGRESS;
    }
    // If creep is full after withdrawing, task is completed
    if (result === OK && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }
    if (result === OK) {
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.FAILED;
  }
}
