import { SimpleWorkRole } from "./SimpleWorkRole";
import { memoryCache } from "../../cache/MemoryCache.ts";
import { ExecuteComprehensiveRepairTask } from "../tasks/ExecuteComprehensiveRepairTask.ts";

export class RepairRole extends SimpleWorkRole {
  public name = "repair";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const cacheKey = `needs_repair_${room.name}`;
    let needsRepair = memoryCache.get<boolean>(cacheKey);

    if (needsRepair === null) {
      const damagedStructure = room.find(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax,
      });
      needsRepair = damagedStructure.length > 0;
      memoryCache.set(cacheKey, needsRepair, 100); // Cache the result for 100 ticks
    }

    if (!needsRepair) {
      return [];
    }

    return [
      {
        handlerName: this.name,
        body: this.calculateBody(
          Math.floor(room.energyCapacityAvailable * 0.6),
        ),
        generation: 1,
        limit: 1,
        priority: 7,
      },
    ];
  }

  private calculateBody(energy: number): SpawnCreepBody[] {
    const body: BodyPartConstant[] = [];
    let cost = 0;
    // 1:1:2 ratio (WORK, CARRY, MOVE, MOVE)
    while (cost < energy && body.length < 48) {
      if (cost + 250 <= energy) {
        body.unshift(WORK);
        body.push(CARRY);
        body.push(MOVE);
        body.push(MOVE);
        cost += 250;
      } else {
        break;
      }
    }
    const bodyParts: { [key: string]: number } = body.reduce(
      (acc, part) => {
        acc[part] = (acc[part] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    return Object.keys(bodyParts).map((part) => ({
      count: bodyParts[part],
      body: part as BodyPartConstant,
    }));
  }

  protected findAndExecuteWorkTask(creep: Creep): void {
    new ExecuteComprehensiveRepairTask().execute(creep);
  }
}

export const repair = new RepairRole();
