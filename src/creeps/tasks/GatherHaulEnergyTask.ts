import { TaskStatus } from "../../types.ts";
import { tickCache } from "../../cache/TickCache.ts";
import { FillUpFromTargetTask } from "./FillUpFromTargetTask.ts";

export class GatherHaulEnergyTask implements Task {
  execute(creep: Creep): TaskStatus {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return TaskStatus.COMPLETED;
    }

    let target = creep.getCreepTarget<StructureLink | StructureContainer>();

    // 1. Validate existing target
    if (target) {
      const isInvalidType =
        !(target instanceof StructureLink) &&
        !(target instanceof StructureContainer);
      const isEmpty = target.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
      if (isInvalidType || isEmpty) {
        target = null;
        creep.setCreepTarget(null); // Clear invalid target from memory
      }
    }

    // 2. Find the BEST new target, only if we don't have a valid one
    if (!target) {
      const centralLink = this.getCentralLink(creep.room);
      if (
        centralLink &&
        centralLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      ) {
        target = centralLink;
      } else {
        const containers = this.getHaulContainers(creep.room);
        if (containers.length > 0) {
          // Find the FULLEST container, not just the closest
          target = containers.sort(
            (a, b) =>
              b.store.getUsedCapacity(RESOURCE_ENERGY) -
              a.store.getUsedCapacity(RESOURCE_ENERGY),
          )[0];
        }
      }
      if (target) {
        creep.setCreepTarget(target); // Lock onto the new best target
      }
    }

    // 3. Execute the stateful "fill up" task on the locked target
    if (target) {
      const fillTask = new FillUpFromTargetTask(target);
      const fillTaskResult = fillTask.execute(creep);

      // If the fill task failed (meaning the target is empty but others exist),
      // we should immediately try to find a new target in the same tick.
      if (fillTaskResult === TaskStatus.FAILED) {
        creep.setCreepTarget(null); // Clear the failed target
        return this.execute(creep); // Re-run the logic to find a new target
      }

      return fillTaskResult;
    }

    // If no target can be found at all, the task has failed for this tick
    return TaskStatus.FAILED;
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
      // Ensure we only consider containers that are not near links (to avoid double-hauling)
      return containers.filter(
        (c) =>
          !links.some((l) => l.pos.inRangeTo(c.pos, 2)) &&
          c.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
      );
    });
  }
}
