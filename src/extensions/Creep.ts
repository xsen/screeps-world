import { EnergyManager, EnergyTarget } from "../managers/EnergyManager.ts";
import { DEBUG_MODE } from "../config/config"; // Импортируем DEBUG_MODE

Creep.prototype.getCreepTarget = function <
  T extends AnyStructure | Source | Resource,
>() {
  return this.memory.targetId
    ? (Game.getObjectById(this.memory.targetId) as T)
    : null;
};

Creep.prototype.setCreepTarget = function (
  target: AnyStructure | Source | Resource | null,
) {
  this.memory.targetId = target?.id;
};

Creep.prototype.setStatus = function (status: string) {
  this.memory.status = status;
};

Creep.prototype.getStatus = function () {
  return this.memory.status;
};

Creep.prototype.debugSay = function (message: string) {
  if (DEBUG_MODE) {
    this.say(message);
  }
};

Creep.prototype.customMoveTo = function (
  target: RoomPosition | { pos: RoomPosition },
  opts?: MoveToOpts,
): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
  const avoidPositions = Memory.avoidPositions?.[this.room.name];
  if (avoidPositions) {
    opts = opts || {};

    const originalCostCallback = opts.costCallback;
    opts.costCallback = (
      roomName: string,
      costMatrix: CostMatrix,
    ): CostMatrix => {
      if (originalCostCallback) {
        const result = originalCostCallback(roomName, costMatrix);
        if (result) costMatrix = result;
      }

      avoidPositions.forEach((pos) => costMatrix.set(pos.x, pos.y, 255));
      return costMatrix;
    };
  }

  return this.moveTo(target, opts);
};

Creep.prototype.getEnergy = function () {
  if (this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    this.setCreepTarget(null);
    return;
  }

  let target = this.getCreepTarget<EnergyTarget>();

  if (!EnergyManager.isTargetValid(target, this)) {
    target = EnergyManager.findNewTarget(this);
    this.setCreepTarget(target);
  }

  if (target) {
    EnergyManager.execute(this, target);
  } else {
    this.debugSay("😴");
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
