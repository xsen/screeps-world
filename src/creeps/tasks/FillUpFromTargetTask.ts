import { TaskStatus } from "../../types.ts";
import { tickCache } from "../../cache/TickCache.ts";

type FillableTarget =
  | StructureContainer
  | StructureStorage
  | StructureLink
  | Tombstone
  | Ruin;

export class FillUpFromTargetTask implements Task {
  constructor(private target: FillableTarget) {}

  execute(creep: Creep): TaskStatus {
    // 1. Completion Condition: Creep is full.
    if (creep.store.getFreeCapacity() === 0) {
      return TaskStatus.COMPLETED;
    }

    // 2. Completion Condition: Target is empty.
    if (this.target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      // Check if there are any other sources to haul from.
      const otherHaulTargets = this.getHaulTargets(creep.room);
      if (otherHaulTargets.length === 0) {
        // No other targets, so we are done as much as we can be.
        return TaskStatus.COMPLETED;
      } else {
        // There are other targets, so this specific task has failed, and we need a new one.
        return TaskStatus.FAILED;
      }
    }

    // 3. Action: Move to target or withdraw.
    const result = creep.withdraw(this.target, RESOURCE_ENERGY);
    if (result === ERR_NOT_IN_RANGE) {
      creep.customMoveTo(this.target);
    }

    // Task is still in progress, whether we moved or withdrew.
    return TaskStatus.IN_PROGRESS;
  }

  private getHaulTargets(room: Room): (StructureLink | StructureContainer)[] {
    const centralLink = this.getCentralLink(room);
    const containers = this.getHaulContainers(room);
    const targets: (StructureLink | StructureContainer)[] = [];

    if (centralLink && centralLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      targets.push(centralLink);
    }
    targets.push(...containers);

    return targets;
  }

  private getCentralLink(room: Room): StructureLink | null {
    const cache = room.memory.linkCache;
    return (cache && cache.centralLinkId)
      ? Game.getObjectById(cache.centralLinkId)
      : null;
  }

  private getHaulContainers(room: Room): StructureContainer[] {
    return tickCache.get(`haul_containers_${room.name}`, () => {
      const containers = room.find<StructureContainer>(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
      });
      const links = room.find<StructureLink>(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LINK,
      });
      return containers.filter(
        (c) =>
          !links.some((l) => l.pos.inRangeTo(c.pos, 2)) &&
          c.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
      );
    });
  }
}
