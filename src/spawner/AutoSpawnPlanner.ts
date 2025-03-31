import { utils } from "../utils.ts";
import { autoPlan } from "./autoPlan.ts";

export class AutoSpawnPlanner {
  room: Room;
  plan: Map<string, AutoSpawnPlan>;
  creeps: Creep[] | undefined;

  constructor(room: Room) {
    this.room = room;
    this.plan = this.preparePlan(autoPlan, room);
  }

  spawn() {
    const spawn = this.room.find(FIND_MY_SPAWNS).find((s) => !s.spawning);
    if (!spawn) return;

    for (const [_roleName, roleDesign] of this.plan) {
      if (this.shouldSpawn(roleDesign)) {
        this.spawnCreep(roleDesign, spawn);
        break;
      }
    }
  }

  private preparePlan(
    plan: {
      [roleName: string]: AutoSpawnPlan;
    },
    room: Room,
  ): Map<string, AutoSpawnPlan> {
    const preparedPlan = new Map<string, AutoSpawnPlan>();

    const keysWithPriority = Object.keys(plan).sort(
      (a, b) => plan[a].priority - plan[b].priority,
    );

    for (const roleName of keysWithPriority) {
      const design = plan[roleName];
      preparedPlan.set(roleName, design);
    }

    const lvl = room.controller?.level!;
    if (lvl <= 1) {
      ["miner", "carry", "repair"].forEach((key) => preparedPlan.delete(key));
    }

    if (lvl == 2) {
      const containerCount = room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
      }).length;

      if (containerCount == 0) {
        preparedPlan.delete("carry");
        preparedPlan.delete("miner");
      } else {
        const miner = preparedPlan.get("miner");
        if (miner) {
          miner.minCount = 1;
        }
        const carry = preparedPlan.get("carry");
        if (carry) {
          carry.minCount = 1;
        }
      }

      preparedPlan.delete("repair");
    }

    if (room.memory.stats.constructionSitesCount > 0) {
      const builder = preparedPlan.get("builder");
      if (builder) {
        builder.minCount = 1;
      }
    }

    return preparedPlan;
  }

  private shouldSpawn(design: AutoSpawnPlan): boolean {
    const minCount = this.getMinCount(design);
    if (minCount == 0) return false;

    const maxCount = this.getMaxCount(design);
    const current = this.countCreeps(design);

    if (current >= maxCount) return false;
    if (current < minCount) return true;

    const { availableEnergy } = this.calculateEnergyWithReserves(design);
    const body = this.getOptimalBody(design, availableEnergy);
    const cost = this.calculateCost(body);

    return cost <= availableEnergy;
  }

  private spawnCreep(design: AutoSpawnPlan, spawn: StructureSpawn) {
    const { availableEnergy } = this.calculateEnergyWithReserves(design);
    const body = this.getOptimalBody(design, availableEnergy);

    const roleName = design.handler.name;
    const memory: CreepMemory = {
      role: roleName,
      roleId: design.handler.id,
      generation: 1,
      room: spawn.room.name,
      status: "spawned",
    };

    const result = spawn.spawnCreep(body, `${roleName}_${Game.time}`, {
      memory,
    });

    if (result === OK) {
      utils.log(
        `Spawned ${roleName} with ${body.length} parts (${this.calculateCost(body)} energy)`,
      );
    } else {
      utils.log(
        "Failed to spawn",
        result,
        roleName,
        spawn.name,
        availableEnergy,
        body,
      );
    }
  }

  private countCreeps(design: AutoSpawnPlan): number {
    if (this.creeps == undefined) {
      this.creeps = this.room.find(FIND_MY_CREEPS);
    }

    return this.creeps.filter((cr) => cr.memory.role == design.handler.name)
      .length;
  }

  private getOptimalBody(
    design: AutoSpawnPlan,
    energyAvailable: number,
  ): BodyPartConstant[] {
    let body = [...design.baseBody];
    let cost = this.calculateCost(body);
    const scalingCost = this.calculateCost(design.scaling);

    while (
      cost + scalingCost <= design.maxCost &&
      cost + scalingCost <= energyAvailable &&
      body.length + design.scaling.length <= 50
    ) {
      body = body.concat(design.scaling);
      cost += scalingCost;
    }
    return body;
  }

  private calculateCost(parts: BodyPartConstant[]): number {
    return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }

  private getMaxCount(design: AutoSpawnPlan): number {
    return typeof design.maxCount === "function"
      ? design.maxCount(this.room)
      : design.maxCount;
  }

  private getMinCount(design: AutoSpawnPlan): number {
    return typeof design.minCount === "function"
      ? design.minCount(this.room)
      : design.minCount;
  }

  private calculateEnergyWithReserves(design: AutoSpawnPlan): {
    availableEnergy: number;
    totalReserve: number;
  } {
    let totalReserve = 0;
    const currentEnergy = this.room.energyAvailable;

    for (const [roleName, roleDesign] of this.plan) {
      if (!roleDesign?.energyReserve || roleName == design.handler.name)
        continue;

      const current = this.countCreeps(roleDesign);
      const maxCount = this.getMaxCount(roleDesign);

      const needed = Math.max(0, maxCount - current);
      if (needed > 0) {
        const possibleCreeps = Math.min(
          needed,
          Math.floor((currentEnergy - totalReserve) / roleDesign.energyReserve),
        );
        totalReserve += roleDesign.energyReserve * possibleCreeps;
      }
    }

    return {
      availableEnergy: Math.max(0, currentEnergy - totalReserve),
      totalReserve,
    };
  }
}
