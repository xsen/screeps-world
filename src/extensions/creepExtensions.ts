import { Color } from "../enums.ts";

declare global {
  interface Creep {
    getEnergy(range?: number): void;

    getCreepTarget<T extends AnyStructure | Source>(): T | null;

    setCreepTarget(target: AnyStructure | Source): void;
  }
}

Creep.prototype.getCreepTarget = function <T extends AnyStructure | Source>() {
  return this.memory.targetId
    ? (Game.getObjectById(this.memory.targetId) as T)
    : null;
};

Creep.prototype.setCreepTarget = function (target: AnyStructure | Source) {
  this.memory.targetId = target.id;
};

// refactor?
Creep.prototype.getEnergy = function (range: number = 6) {
  const containers = this.pos
    .findInRange(FIND_STRUCTURES, range, {
      filter: (structure) => {
        if (structure.structureType === STRUCTURE_CONTAINER) {
          return (
            structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
            this.store.getCapacity()
          );
        }
        return false;
      },
    })
    .sort((s1, s2) => s1.pos.getRangeTo(this) - s2.pos.getRangeTo(this));

  const target = containers.length > 0 ? containers[0] : this.room.storage;

  if (!target) {
    console.log("Error: container for refill not found");
    return;
  }

  if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    this.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
  }
};
