import {TaskStatus} from "../../types.ts";

export class RepairTask implements Task {
  constructor(private target: AnyStructure) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    if (this.target.hits === this.target.hitsMax) {
      return TaskStatus.COMPLETED;
    }

    const result = creep.repair(this.target);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
      return TaskStatus.IN_PROGRESS;
    }
    if (result === OK) {
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.FAILED;
  }
}
