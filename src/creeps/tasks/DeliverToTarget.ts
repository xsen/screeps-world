import { TaskStatus } from "../../types.ts";

type DeliverTarget =
  | StructureStorage
  | StructureTerminal
  | StructureContainer
  | StructureExtension
  | StructureSpawn
  | StructureTower
  | StructureLink;

export class DeliverToTarget implements Task {
  constructor(
    private target: DeliverTarget,
    private resourceType: ResourceConstant,
  ) {}

  execute(creep: Creep): TaskStatus {
    if (creep.store.getUsedCapacity(this.resourceType) === 0) {
      return TaskStatus.COMPLETED;
    }

    if (this.target.store.getFreeCapacity(this.resourceType) === 0) {
      return TaskStatus.COMPLETED;
    }

    const result = creep.transfer(this.target, this.resourceType);
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
