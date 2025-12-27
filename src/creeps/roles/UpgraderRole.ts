import { SimpleWorkRole } from "./SimpleWorkRole";
import { UpgradeControllerTask } from "../tasks/UpgradeControllerTask.ts";
import { tickCache } from "../../cache/TickCache.ts";

class UpgraderRole extends SimpleWorkRole {
  public name = "upgrader";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const controller = room.controller;
    if (!controller) return [];

    // Stage 1: RCL 8 Maintenance
    if (controller.level === 8) {
      if (controller.ticksToDowngrade < 175000) {
        return [
          {
            handlerName: this.name,
            body: [
              { count: 1, body: WORK },
              { count: 1, body: CARRY },
              { count: 2, body: MOVE },
            ],
            generation: 8,
            limit: 1,
            priority: 8,
          },
        ];
      }
      return [];
    }

    // Stage 2: Early Game (No Storage)
    if (!room.storage) {
      const sources = tickCache.get(`sources_${room.name}`, () =>
        room.find(FIND_SOURCES),
      );
      return [
        {
          handlerName: this.name,
          body: this.calculateBody(room.energyCapacityAvailable, 15),
          generation: 1,
          limit: sources.length * 2,
          priority: 8,
        },
      ];
    }

    // Stage 3: Main Game (Storage exists)
    const energy = room.storage.store.energy;
    let limit = 0;
    let body: SpawnCreepBody[] = [];

    if (energy > 200000) {
      // "Wealth" mode
      limit = 2;
      body = this.calculateBody(room.energyCapacityAvailable, 15); // Max 15 WORK parts
    } else if (energy > 100000) {
      // "Prosperity" mode
      limit = 1;
      body = this.calculateBody(room.energyCapacityAvailable, 15);
    } else if (energy > 10000) {
      // "Economy" mode
      limit = 1;
      body = this.calculateBody(
        Math.floor(room.energyCapacityAvailable / 2),
        15,
      );
    } else {
      // "Survival" mode
      limit = 1;
      body = [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ]; // 300 energy body
    }

    if (limit > 0 && body.length > 0) {
      return [
        {
          handlerName: this.name,
          body: body,
          generation: 1,
          limit: limit,
          priority: 8,
        },
      ];
    }

    return [];
  }

  protected findAndExecuteWorkTask(creep: Creep): void {
    if (creep.room.controller) {
      new UpgradeControllerTask(creep.room.controller).execute(creep);
    } else {
      creep.debugSay("🤔 No controller!");
    }
  }

  private calculateBody(
    energy: number,
    maxWork: number = 50,
  ): SpawnCreepBody[] {
    const body: BodyPartConstant[] = [];
    let cost = 0;

    // Base block for small energy levels
    if (energy >= 200) {
      body.push(WORK, CARRY, MOVE);
      cost += 200;
    } else {
      return []; // Not enough energy for a minimal upgrader
    }

    // Define the repeating block for balance
    const block = [WORK, WORK, CARRY, MOVE];
    const blockCost = 300;

    while (true) {
      const workParts = body.filter((p) => p === WORK).length;
      if (
        cost + blockCost <= energy &&
        body.length + block.length <= 50 &&
        workParts < maxWork
      ) {
        body.push(...block);
        cost += blockCost;
      } else {
        break;
      }
    }

    // Fill remaining energy with WORK and MOVE parts for efficiency
    while (cost < energy && body.length < 50) {
      const workParts = body.filter((p) => p === WORK).length;
      if (cost + 150 <= energy && workParts < maxWork) {
        body.push(WORK, MOVE);
        cost += 150;
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
}

export const upgrader = new UpgraderRole();
