import {TaskStatus} from "../../types.ts";

export class BuildTask implements Task {
  constructor(private target: ConstructionSite) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    const result = creep.build(this.target);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
      return TaskStatus.IN_PROGRESS;
    }
    if (result === OK) {
      return TaskStatus.IN_PROGRESS;
    }

    // If target is finished, task is also completed
    if (result === ERR_INVALID_TARGET) {
      return TaskStatus.COMPLETED;
    }

    return TaskStatus.FAILED;
  }
}
