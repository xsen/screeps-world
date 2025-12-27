import {TaskStatus} from "../../types.ts";

export class PickupResource implements Task {
  constructor(private target: Resource) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }
    if (this.target.amount === 0) {
      return TaskStatus.COMPLETED;
    }

    const result = creep.pickup(this.target);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
      return TaskStatus.IN_PROGRESS;
    }
    if (result === OK && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }
    if (result === OK) {
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.FAILED;
  }
}
