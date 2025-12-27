import { SimpleWorkRole } from "./SimpleWorkRole";
import { BuildTask } from "../tasks/BuildTask.ts";
import { TaskStatus } from "../../types.ts";
import { tickCache } from "../../cache/TickCache.ts";
import { ExecuteComprehensiveRepairTask } from "../tasks/ExecuteComprehensiveRepairTask.ts";

class BuilderRole extends SimpleWorkRole {
  public name = "builder";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const sites = tickCache.get(`sites_${room.name}`, () =>
      room.find(FIND_CONSTRUCTION_SITES),
    );
    if (sites.length === 0) {
      return [];
    }

    const totalProgressNeeded = sites.reduce(
      (sum, s) => sum + s.progressTotal - s.progress,
      0,
    );
    let limit = 1;
    let body: SpawnCreepBody[];

    if (totalProgressNeeded > 20000) {
      // Large project
      limit = 2;
      body = this.calculateBody(room.energyCapacityAvailable);
    } else {
      // Standard project
      limit = 1;
      body = this.calculateBody(Math.floor(room.energyCapacityAvailable * 0.6));
    }

    if (body.length === 0) return [];

    return [
      {
        handlerName: this.name,
        body: body,
        generation: 1,
        limit: limit,
        priority: 7,
      },
    ];
  }

  private calculateBody(energy: number): SpawnCreepBody[] {
    const body: BodyPartConstant[] = [];
    let cost = 0;
    // 1:1:1 ratio
    while (cost < energy && body.length < 48) {
      if (cost + 200 <= energy) {
        body.unshift(WORK);
        body.push(CARRY);
        body.push(MOVE);
        cost += 200;
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
    // Priority 1: Build
    const constructionSite = creep.pos.findClosestByPath(
      FIND_CONSTRUCTION_SITES,
    );
    if (constructionSite) {
      const taskResult = new BuildTask(constructionSite).execute(creep);
      if (
        taskResult === TaskStatus.COMPLETED ||
        taskResult === TaskStatus.FAILED
      ) {
        creep.setCreepTarget(null);
      }
      return;
    }

    // Priority 2: Repair (delegate to comprehensive repair task)
    new ExecuteComprehensiveRepairTask().execute(creep);
  }
}

export const builder = new BuilderRole();
