import { TaskStatus } from "../../types.ts";
import { RepairTask } from "./RepairTask.ts";

export class ExecuteComprehensiveRepairTask implements Task {
  execute(creep: Creep): TaskStatus {
    let target = creep.getCreepTarget<AnyStructure>();

    if (target && target.hits === target.hitsMax) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      target = this.findNewRepairTarget(creep);
      if (target) {
        creep.setCreepTarget(target);
      }
    }

    if (target) {
      const taskResult = new RepairTask(target).execute(creep);
      if (
        taskResult === TaskStatus.COMPLETED ||
        taskResult === TaskStatus.FAILED
      ) {
        creep.setCreepTarget(null);
        // We might want to find a new target immediately
        return this.execute(creep);
      }
      return taskResult;
    }

    creep.debugSay("🧱✅");
    return TaskStatus.COMPLETED;
  }

  private findNewRepairTarget(creep: Creep): AnyStructure | null {
    // Priority 1: Decaying structures (roads, containers)
    const decayingStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        (s.structureType === STRUCTURE_ROAD ||
          s.structureType === STRUCTURE_CONTAINER) &&
        s.hits < s.hitsMax * 0.75,
    });
    if (decayingStructure) return decayingStructure;

    // Priority 2: Other damaged non-defensive structures
    const damagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        s.hits < s.hitsMax &&
        s.structureType !== STRUCTURE_WALL &&
        s.structureType !== STRUCTURE_RAMPART,
    });
    if (damagedStructure) return damagedStructure;

    // Priority 3: Fortify walls and ramparts to the next threshold
    const repairThresholds = [
      5000, 10000, 25000, 50000, 100000, 300000, 500000, 1000000, 2000000,
      5000000, 10000000, 30000000, 100000000, 300000000,
    ];
    for (const threshold of repairThresholds) {
      const defensiveStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.hits < threshold &&
          (s.structureType === STRUCTURE_WALL ||
            s.structureType === STRUCTURE_RAMPART),
      });
      if (defensiveStructure) return defensiveStructure;
    }

    return null;
  }
}
