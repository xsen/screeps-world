import { Color } from "../enums.ts";

Creep.prototype.getCreepTarget = function <T extends AnyStructure | Source>() {
  return this.memory.targetId
    ? (Game.getObjectById(this.memory.targetId) as T)
    : null;
};

Creep.prototype.setCreepTarget = function (
  target: AnyStructure | Source | null,
) {
  this.memory.targetId = target?.id;
};

Creep.prototype.setStatus = function (status: string) {
  this.memory.status = status;
};

Creep.prototype.getStatus = function () {
  return this.memory.status;
};

// @todo: refactor
Creep.prototype.getEnergy = function () {
  const containers = this.room
    .find(FIND_STRUCTURES, {
      filter: (structure) => {
        if (
          structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE
        ) {
          return (
            structure.store.getUsedCapacity(RESOURCE_ENERGY) >=
            this.store.getFreeCapacity()
          );
        }
        return false;
      },
    })
    .sort((s1, s2) => s1.pos.getRangeTo(this) - s2.pos.getRangeTo(this));

  const target = containers.length > 0 ? containers[0] : this.room.storage;
  if (target) {
    if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(target, { visualizePathStyle: { stroke: Color.GRAY } });
    }
  } else {
    const source = this.pos.findClosestByPath(FIND_SOURCES);
    if (source && this.harvest(source) == ERR_NOT_IN_RANGE) {
      this.moveTo(source, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
    }
  }
};

Creep.prototype.getEnergyFromTombstone = function () {
  const tombstone = this.pos.findClosestByPath(FIND_TOMBSTONES, {
    filter: (t) => {
      return t.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && t.creep.my;
    },
  });
  if (tombstone && this.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    if (this.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.moveTo(tombstone);
    }
    return true;
  }
  return false;
};
