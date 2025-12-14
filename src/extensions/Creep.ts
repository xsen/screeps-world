import { DEBUG_MODE } from "../config/config"; // Импортируем DEBUG_MODE

Creep.prototype.getCreepTarget = function <T extends AnyTarget>() {
  return this.memory.targetId
    ? (Game.getObjectById(this.memory.targetId) as T)
    : null;
};

Creep.prototype.setCreepTarget = function (target: AnyTarget | null) {
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

  let target = this.getCreepTarget<
    StructureLink | StructureContainer | StructureStorage | Resource
  >();

  // Проверяем валидность закэшированной цели
  if (
    target &&
    (("store" in target &&
      target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
      ("amount" in target && target.amount === 0))
  ) {
    target = null;
    this.setCreepTarget(null);
  }

  // Если цели нет или она невалидна, ищем новую
  if (!target) {
    const sources: (
      | StructureLink
      | StructureContainer
      | StructureStorage
      | Resource
    )[] = [];

    // 1. Links
    const links = this.room.find<StructureLink>(FIND_STRUCTURES, {
      filter: (s) =>
        s.structureType === STRUCTURE_LINK &&
        s.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    });
    sources.push(...links);

    // 2. Containers
    const containers = this.room.find<StructureContainer>(FIND_STRUCTURES, {
      filter: (s) =>
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getUsedCapacity(RESOURCE_ENERGY) > 50,
    });
    sources.push(...containers);

    // 3. Storage
    if (
      this.room.storage &&
      this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    ) {
      sources.push(this.room.storage);
    }

    // 4. Dropped energy
    const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 100,
    });
    sources.push(...droppedEnergy);

    if (sources.length > 0) {
      const newTarget = this.pos.findClosestByPath(sources);
      if (newTarget) {
        target = newTarget;
        this.setCreepTarget(newTarget); // Кэшируем новую цель
      }
    }
  }

  if (target) {
    let moveResult:
      | CreepMoveReturnCode
      | ERR_NO_PATH
      | ERR_INVALID_TARGET
      | ERR_NOT_FOUND
      | undefined;
    if (target instanceof Resource) {
      if (this.pickup(target) === ERR_NOT_IN_RANGE) {
        moveResult = this.customMoveTo(target);
      }
    } else {
      if (this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        moveResult = this.customMoveTo(target);
      }
    }

    if (moveResult === ERR_NO_PATH) {
      this.setCreepTarget(null);
    }
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
