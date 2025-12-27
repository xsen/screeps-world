export class CreepBodyBuilder {
  public build(
    bodyConfig: SpawnCreepBody[],
    minBodyConfig: SpawnCreepBody[] | undefined,
    isEmergency: boolean | undefined,
    energyAvailable: number,
  ): BodyPartConstant[] | null {
    const fullBody = this.buildBody(bodyConfig);
    const fullCost = this.calculateCost(fullBody);

    if (energyAvailable >= fullCost) {
      return fullBody;
    }

    if (!isEmergency || !minBodyConfig) {
      return null;
    }

    const minBody = this.buildBody(minBodyConfig);
    const minCost = this.calculateCost(minBody);

    if (energyAvailable < minCost) {
      return null;
    }

    let dynamicBody = [...minBody];
    let currentCost = minCost;

    const additionalParts = this.getAdditionalParts(fullBody, minBody);

    for (const part of additionalParts) {
      const partCost = BODYPART_COST[part];
      if (currentCost + partCost <= energyAvailable) {
        dynamicBody.push(part);
        currentCost += partCost;
      } else {
        break;
      }
    }

    dynamicBody.sort((a, b) => {
      const order: { [key: string]: number } = {
        [TOUGH]: 1,
        [WORK]: 2,
        [CARRY]: 3,
        [MOVE]: 4,
        [ATTACK]: 5,
        [RANGED_ATTACK]: 6,
        [HEAL]: 7,
        [CLAIM]: 8,
      };
      return (order[a] || 99) - (order[b] || 99);
    });

    return dynamicBody;
  }

  private getAdditionalParts(
    fullBody: BodyPartConstant[],
    minBody: BodyPartConstant[],
  ): BodyPartConstant[] {
    const minBodyCounts: { [key: string]: number } = {};
    for (const part of minBody) {
      minBodyCounts[part] = (minBodyCounts[part] || 0) + 1;
    }

    const additionalParts: BodyPartConstant[] = [];
    for (const part of fullBody) {
      if (minBodyCounts[part] && minBodyCounts[part] > 0) {
        minBodyCounts[part]--;
      } else {
        additionalParts.push(part);
      }
    }
    return additionalParts;
  }

  private buildBody(bodyParts: SpawnCreepBody[]): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];
    for (const part of bodyParts) {
      for (let i = 0; i < part.count; i++) {
        body.push(part.body);
      }
    }
    return body;
  }

  private calculateCost(parts: BodyPartConstant[]): number {
    return parts.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }
}
