import { DEBUG_MODE } from "../config/config";

Creep.prototype.getCreepTarget = function <T extends AnyTarget>() {
  if (!this.memory.targetId) {
    return null;
  }
  return Game.getObjectById(this.memory.targetId) as T | null;
};

Creep.prototype.setCreepTarget = function (target: AnyTarget | null) {
  if (target) {
    this.memory.targetId = target.id;
  } else {
    delete this.memory.targetId;
  }
};

Creep.prototype.getStatus = function () {
  return this.memory.status;
};

Creep.prototype.setStatus = function (status: string) {
  this.memory.status = status;
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
    ): CostMatrix | void => {
      let newMatrix = costMatrix;
      if (originalCostCallback) {
        const result = originalCostCallback(roomName, newMatrix);
        // Check if the callback returned a new CostMatrix object
        if (result) {
          newMatrix = result;
        }
      }

      avoidPositions.forEach((pos) => newMatrix.set(pos.x, pos.y, 255));
      return newMatrix;
    };
  }

  return this.moveTo(target, opts);
};
