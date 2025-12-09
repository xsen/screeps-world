import { manualPlan } from "../spawner/manualPlan.ts";
import { autoPlan } from "../spawner/autoPlan.ts";
import { roles } from "../creeps/roles.ts";
import { utils } from "../utils.ts";

export class SpawnManager {
  private readonly room: Room;
  private readonly spawner: StructureSpawn | undefined;

  constructor(room: Room) {
    this.room = room;
    this.spawner = room.find(FIND_MY_SPAWNS).find((s) => !s.spawning);
  }

  public run(): void {
    if (!this.spawner) {
      return;
    }

    const manualSpawnSuccess = this.runManualSpawn();
    if (manualSpawnSuccess) {
      return;
    }
    // this._runAutoSpawn();
  }

  /**
   * Пытается создать крипа по ручному плану.
   * @returns true, если крип был успешно поставлен в очередь на спавн.
   */
  private runManualSpawn(): boolean {
    const roomSpawnPlans = manualPlan[this.room.name] || [];
    if (roomSpawnPlans.length === 0) return false;

    for (const spawnPlan of roomSpawnPlans) {
      const handler = roles.get(spawnPlan.handlerName);
      if (!handler) {
        console.log("Error: no role for manual spawn plan", spawnPlan);
        continue;
      }

      const spawnRoomName = spawnPlan.targetRoom || this.room.name;
      const currentCreeps = Object.values(Game.creeps).filter(
        (cr) =>
          cr.memory.room === spawnRoomName &&
          cr.memory.role === handler.name &&
          cr.memory.generation === spawnPlan.generation,
      ).length;

      if (currentCreeps < spawnPlan.limit) {
        const body = this.buildBody(spawnPlan.body);
        const memory: CreepMemory = {
          role: handler.name,
          generation: spawnPlan.generation,
          room: spawnRoomName,
          status: "spawned",
          commands: spawnPlan.commands,
        };
        return this.spawnCreep(
          handler.name,
          spawnPlan.generation,
          body,
          memory,
        );
      }
    }
    return false;
  }

  /**
   * Собирает тело крипа из описания.
   */
  private buildBody(bodyParts: SpawnCreepBody[]): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];
    for (const part of bodyParts) {
      for (let i = 0; i < part.count; i++) {
        body.push(part.body);
      }
    }
    return body;
  }

  /**
   * Непосредственно выполняет спавн крипа.
   */
  private spawnCreep(
    roleName: string,
    generation: number,
    body: BodyPartConstant[],
    memory: CreepMemory,
  ): boolean {
    if (!this.spawner) return false;

    const name = `${roleName}-${generation}-${Game.time}`;
    const result = this.spawner.spawnCreep(body, name, { memory });

    if (result === OK) {
      console.log(
        `Spawning ${name} in ${this.room.name} for room "${memory.room}"`,
      );
      return true;
    } else if (result !== ERR_NOT_ENOUGH_ENERGY) {
      utils.log("Failed to spawn", result, name, this.spawner.name, body);
    }
    return false;
  }

  /**
   * Пытается создать крипа по автоматическому плану.
   */
  // @ts-ignore
  private _runAutoSpawn(): void {
    const preparedPlan = this._prepareAutoPlan(autoPlan, this.room);

    for (const [_roleName, roleDesign] of preparedPlan) {
      if (this._shouldSpawn(roleDesign)) {
        const { availableEnergy } = this._calculateEnergyWithReserves(
          roleDesign,
          preparedPlan,
        );
        const body = this._getOptimalBody(roleDesign, availableEnergy);
        const memory: CreepMemory = {
          role: roleDesign.handler.name,
          generation: 1,
          room: this.room.name,
          status: "spawned",
        };
        this.spawnCreep(roleDesign.handler.name, 1, body, memory);
        return;
      }
    }
  }

  private _prepareAutoPlan(
    plan: { [roleName: string]: AutoSpawnPlan },
    room: Room,
  ): Map<string, AutoSpawnPlan> {
    const preparedPlan = new Map<string, AutoSpawnPlan>();
    const keysWithPriority = Object.keys(plan).sort(
      (a, b) => plan[a].priority - plan[b].priority,
    );

    for (const roleName of keysWithPriority) {
      preparedPlan.set(roleName, plan[roleName]);
    }

    const lvl = room.controller?.level!;
    if (lvl <= 1) {
      ["miner", "carry", "repair"].forEach((key) => preparedPlan.delete(key));
    }

    return preparedPlan;
  }

  private _shouldSpawn(design: AutoSpawnPlan): boolean {
    const minCount =
      typeof design.minCount === "function"
        ? design.minCount(this.room)
        : design.minCount;
    if (minCount === 0) return false;

    const currentCount = this._countCreeps(design.handler.name);
    if (
      currentCount >=
      (typeof design.maxCount === "function"
        ? design.maxCount(this.room)
        : design.maxCount)
    )
      return false;

    return currentCount < minCount;
  }

  private _countCreeps(roleName: string): number {
    return Object.values(Game.creeps).filter(
      (cr) => cr.memory.role === roleName && cr.memory.room === this.room.name,
    ).length;
  }

  private _getOptimalBody(
    design: AutoSpawnPlan,
    energyAvailable: number,
  ): BodyPartConstant[] {
    let body = [...design.baseBody];
    let cost = this._calculateCost(body);
    const scalingCost = this._calculateCost(design.scaling);

    if (scalingCost > 0) {
      while (
        cost + scalingCost <= design.maxCost &&
        cost + scalingCost <= energyAvailable &&
        body.length + design.scaling.length <= 50
      ) {
        body = body.concat(design.scaling);
        cost += scalingCost;
      }
    }
    return body;
  }

  private _calculateCost(parts: BodyPartConstant[]): number {
    return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }

  private _calculateEnergyWithReserves(
    design: AutoSpawnPlan,
    plan: Map<string, AutoSpawnPlan>,
  ): {
    availableEnergy: number;
    totalReserve: number;
  } {
    let totalReserve = 0;
    const currentEnergy = this.room.energyAvailable;

    for (const [roleName, roleDesign] of plan) {
      if (!roleDesign?.energyReserve || roleName === design.handler.name)
        continue;

      const current = this._countCreeps(roleDesign.handler.name);
      const maxCount =
        typeof roleDesign.maxCount === "function"
          ? roleDesign.maxCount(this.room)
          : roleDesign.maxCount;

      if (current < maxCount) {
        totalReserve += roleDesign.energyReserve;
      }
    }

    return {
      availableEnergy: Math.max(0, currentEnergy - totalReserve),
      totalReserve,
    };
  }
}
