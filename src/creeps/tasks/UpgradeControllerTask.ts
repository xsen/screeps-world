import { TaskStatus } from "../../types.ts";

export class UpgradeControllerTask implements Task {
  constructor(private target: StructureController) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    const upgradeResult = creep.upgradeController(this.target);
    creep.customMoveTo(this.target);

    // if (upgradeResult === ERR_NOT_IN_RANGE) {
    //   // If out of range, just move.
    //   creep.customMoveTo(this.target);
    // } else {
    //   // If in range and upgrading, also try to move closer to free up the path.
    //   if (creep.pos.getRangeTo(this.target) > 1) {
    //     creep.customMoveTo(this.target);
    //   }
    // }

    // The task is ongoing as long as the creep has energy.
    if (upgradeResult === OK || upgradeResult === ERR_NOT_IN_RANGE) {
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.FAILED;
  }
}
