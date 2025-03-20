export class CreepSpawnPlanner {
  room: Room;
  plan: { [role: string]: CreepRoleDesign };
  creeps: Creep[] | undefined;

  private readonly roleNameByPriority: string[];

  constructor(room: Room, plan: { [roleName: string]: CreepRoleDesign }) {
    this.plan = plan;
    this.room = room;

    this.roleNameByPriority = Object.keys(this.plan).sort(
      (a, b) => this.plan[a].priority - this.plan[b].priority,
    );
  }

  spawnMostImportantCreep() {
    const spawn = this.room.find(FIND_MY_SPAWNS).find((s) => !s.spawning);
    if (!spawn) return;

    for (const roleName of this.roleNameByPriority) {
      // @todo: в shouldSpawn и spawnCreep вызываются одни и те же данные
      if (this.shouldSpawn(roleName, spawn)) {
        this.spawnCreep(roleName, spawn);
        break;
      }
    }
  }

  private shouldSpawn(roleName: string, spawn: StructureSpawn): boolean {
    const design = this.plan[roleName];
    const current = this.countCreeps(roleName);
    const maxCount = this.getMaxCount(design);

    if (current >= maxCount) return false;
    if (current < design.minCount) return true;

    if (!this.roleSpecificChecks(roleName, spawn)) return false;

    const { availableEnergy } = this.calculateEnergyWithReserves(
      roleName,
      spawn,
    );
    const body = this.getOptimalBody(roleName, availableEnergy);
    const cost = this.calculateCost(body);

    return cost <= availableEnergy;
  }

  private spawnCreep(roleName: string, spawn: StructureSpawn) {
    const { availableEnergy } = this.calculateEnergyWithReserves(
      roleName,
      spawn,
    );
    const body = this.getOptimalBody(roleName, availableEnergy);

    const memory: CreepMemory = {
      role: roleName,
      roleId: this.plan[roleName].handler.id,
      generation: 0,
      room: spawn.room.name,
      status: "spawned",
    };

    const result = spawn.spawnCreep(body, `${roleName}_${Game.time}`, {
      memory,
    });

    if (result === OK) {
      console.log(
        `Spawned ${roleName} with ${body.length} parts (${this.calculateCost(body)} energy)`,
      );
    }
    console.log(roleName, spawn.name);
  }

  private countCreeps(roleName: string): number {
    if (this.creeps == undefined) {
      this.creeps = this.room.find(FIND_MY_CREEPS);
    }

    return this.creeps.filter((cr) => cr.memory.role == roleName).length;
  }

  private getOptimalBody(
    roleName: string,
    energyAvailable: number,
  ): BodyPartConstant[] {
    const design = this.plan[roleName];
    let body = [...design.baseBody];
    let cost = this.calculateCost(body);

    while (cost < design.maxCost) {
      const newBody = body.concat(design.scaling);
      const newCost = cost + this.calculateCost(design.scaling);

      if (newCost > energyAvailable || newBody.length > 50) break;

      body = newBody;
      cost = newCost;
    }
    return body;
  }

  private calculateCost(parts: BodyPartConstant[]): number {
    return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }

  private roleSpecificChecks(roleName: string, spawn: StructureSpawn): boolean {
    if (spawn.room.controller?.level! <= 1) {
      const excluded = ["miner", "carry", "repair"];
      if (excluded.includes(roleName)) {
        delete this.plan[roleName];
        return false;
      }
    }
    return true;
  }

  private getMaxCount(design: CreepRoleDesign): number {
    return typeof design.maxCount === "function"
      ? design.maxCount(this.room)
      : design.maxCount;
  }

  private calculateEnergyWithReserves(
    roleName: string,
    spawn: StructureSpawn,
  ): {
    availableEnergy: number;
    totalReserve: number;
  } {
    const currentEnergy = spawn.room.energyAvailable;
    let totalReserve = 0;

    for (const roleNameByPriority of this.roleNameByPriority) {
      const design = this.plan[roleNameByPriority];
      if (!design.energyReserve || roleName == roleNameByPriority) continue;

      const current = this.countCreeps(roleNameByPriority);
      const maxCount = this.getMaxCount(design);
      const needed = Math.max(0, maxCount - current);

      if (needed > 0) {
        const possibleCreeps = Math.min(
          needed,
          Math.floor((currentEnergy - totalReserve) / design.energyReserve),
        );
        totalReserve += design.energyReserve * possibleCreeps;
      }
    }
    return {
      availableEnergy: Math.max(0, currentEnergy - totalReserve),
      totalReserve,
    };
  }
}
