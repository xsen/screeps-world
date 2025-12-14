import profiler from "screeps-profiler";

const STATUS_TASK_COLLECT_DROPPED = "task_collect_dropped";
const STATUS_TASK_HAUL_CONTAINER = "task_haul_container";
const STATUS_TASK_STORE = "task_store";
const STATUS_IDLE = "idle";

class CarryRole implements CreepRoleHandler {
  public name = "carry";
  public defaultMinBody: SpawnCreepBody[] = [
    { count: 1, body: CARRY },
    { count: 1, body: MOVE },
  ];
  public defaultPriority = 8;
  public defaultIsEmergency = false;
  public defaultPreSpawnTicks = 50;

  public run(creep: Creep): void {
    this.decideState(creep);

    switch (creep.getStatus()) {
      case STATUS_TASK_COLLECT_DROPPED:
        this.executeCollectDroppedTask(creep);
        break;
      case STATUS_TASK_HAUL_CONTAINER:
        this.executeHaulContainerTask(creep);
        break;
      case STATUS_TASK_STORE:
        this.executeStoreTask(creep);
        break;
      case STATUS_IDLE:
        this.executeIdleTask(creep);
        break;
      default:
        creep.setStatus(STATUS_IDLE);
        break;
    }
  }

  /**
   * Определяет, в каком состоянии должен быть крип.
   */
  private decideState(creep: Creep): void {
    const currentStatus = creep.getStatus();
    const isFull = creep.store.getFreeCapacity() === 0;
    const hasResources = creep.store.getUsedCapacity() > 0;

    // Приоритет 1: Если крип полон, он должен выгрузить ресурсы.
    if (isFull) {
      if (currentStatus !== STATUS_TASK_STORE) {
        creep.setStatus(STATUS_TASK_STORE);
        creep.setCreepTarget(null);
      }
      return;
    }

    // Если крип не полон, но у него есть ресурсы, и больше нечего собирать, он тоже должен выгрузить.
    if (
      hasResources &&
      !this.hasMoreResourcesToCollect(creep.room, currentStatus)
    ) {
      if (currentStatus !== STATUS_TASK_STORE) {
        creep.setStatus(STATUS_TASK_STORE);
        creep.setCreepTarget(null);
      }
      return;
    }

    // Приоритет 2: Сбор брошенных ресурсов, руин, надгробий.
    if (this.hasDroppedResources(creep.room)) {
      if (currentStatus !== STATUS_TASK_COLLECT_DROPPED) {
        creep.setStatus(STATUS_TASK_COLLECT_DROPPED);
        creep.setCreepTarget(null);
      }
      return;
    }

    // Приоритет 3: Перевозка из контейнеров в хранилище (если хранилище есть).
    if (creep.room.storage && this.hasHaulableContainers(creep.room)) {
      if (currentStatus !== STATUS_TASK_HAUL_CONTAINER) {
        creep.setStatus(STATUS_TASK_HAUL_CONTAINER);
        creep.setCreepTarget(null);
      }
      return;
    }

    // Если ничего из вышеперечисленного, то ожидание.
    if (currentStatus !== STATUS_IDLE) {
      creep.setStatus(STATUS_IDLE);
      creep.setCreepTarget(null);
    }
  }

  /**
   * Проверяет наличие брошенных ресурсов, руин или надгробий.
   */
  private hasDroppedResources(room: Room): boolean {
    if (
      room.find(FIND_DROPPED_RESOURCES, { filter: (r) => r.amount > 0 })
        .length > 0
    )
      return true;
    if (
      room.find(FIND_RUINS, { filter: (r) => r.store.getUsedCapacity() > 0 })
        .length > 0
    )
      return true;

    return (
      room.find(FIND_TOMBSTONES, {
        filter: (t) => t.store.getUsedCapacity() > 0,
      }).length > 0
    );
  }

  /**
   * Проверяет наличие непустых контейнеров (для перевозки в storage).
   */
  private hasHaulableContainers(room: Room): boolean {
    return (
      room.find(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType === STRUCTURE_CONTAINER &&
          s.store.getUsedCapacity() > 0,
      }).length > 0
    );
  }

  /**
   * Проверяет, есть ли еще ресурсы для сбора в текущем или следующем приоритете.
   */
  private hasMoreResourcesToCollect(
    room: Room,
    currentStatus: string,
  ): boolean {
    // Если текущий статус - сбор брошенных, и есть еще брошенные ресурсы
    if (
      currentStatus === STATUS_TASK_COLLECT_DROPPED &&
      this.hasDroppedResources(room)
    )
      return true;
    // Если есть брошенные ресурсы (даже если текущий статус не сбор брошенных)
    if (this.hasDroppedResources(room)) return true;

    // Если текущий статус - перевозка из контейнеров, и есть еще контейнеры
    if (
      currentStatus === STATUS_TASK_HAUL_CONTAINER &&
      room.storage &&
      this.hasHaulableContainers(room)
    )
      return true;
    // Если есть контейнеры для перевозки (даже если текущий статус не перевозка из контейнеров)
    return !!(room.storage && this.hasHaulableContainers(room));
  }

  /**
   * ЗАДАЧА 1: Сбор брошенных ресурсов, руин, надгробий.
   */
  private executeCollectDroppedTask(creep: Creep): void {
    let target = creep.getCreepTarget<Resource | Ruin | Tombstone>();

    if (
      target &&
      (("store" in target && target.store.getUsedCapacity() === 0) ||
        ("amount" in target && target.amount === 0))
    ) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      const droppedResource = creep.pos.findClosestByPath(
        FIND_DROPPED_RESOURCES,
      );
      if (droppedResource) {
        target = droppedResource;
      } else {
        const ruin = creep.pos.findClosestByPath(FIND_RUINS, {
          filter: (r) => r.store.getUsedCapacity() > 0,
        });
        if (ruin) {
          target = ruin;
        } else {
          const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (t) => t.store.getUsedCapacity() > 0,
          });
          if (tombstone) {
            target = tombstone;
          }
        }
      }
    }

    if (target) {
      creep.setCreepTarget(target);
      if (target instanceof Resource) {
        if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
          creep.customMoveTo(target);
        }
      } else {
        for (const resourceType in target.store) {
          if (
            creep.withdraw(target, resourceType as ResourceConstant) ===
            ERR_NOT_IN_RANGE
          ) {
            creep.customMoveTo(target);
            break;
          }
        }
      }
    } else {
      creep.debugSay("🤷‍♂️");
    }
  }

  /**
   * ЗАДАЧА 2: Перевозка из контейнеров в хранилище.
   */
  private executeHaulContainerTask(creep: Creep): void {
    let target = creep.getCreepTarget<StructureContainer>();

    if (target && target.store.getUsedCapacity() === 0) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      target = creep.pos.findClosestByPath<StructureContainer>(
        FIND_STRUCTURES,
        {
          filter: (s) =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getUsedCapacity() > 0,
        },
      );
    }

    if (target) {
      creep.setCreepTarget(target);
      for (const resourceType in target.store) {
        if (
          creep.withdraw(target, resourceType as ResourceConstant) ===
          ERR_NOT_IN_RANGE
        ) {
          creep.customMoveTo(target);
          break;
        }
      }
    } else {
      creep.debugSay("🤷‍♀️");
    }
  }

  /**
   * ЗАДАЧА 3: Складирование ресурсов.
   */
  private executeStoreTask(creep: Creep): void {
    let target: StructureStorage | StructureContainer | null;

    // Приоритет 1: Storage
    if (creep.room.storage && creep.room.storage.store.getFreeCapacity() > 0) {
      target = creep.room.storage;
    } else {
      // Приоритет 2: Ближайший контейнер
      target = creep.pos.findClosestByPath<StructureContainer>(
        FIND_STRUCTURES,
        {
          filter: (s) =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity() > 0,
        },
      );
    }

    if (target) {
      creep.setCreepTarget(target);
      for (const resourceType in creep.store) {
        if (
          creep.transfer(target, resourceType as ResourceConstant) ===
          ERR_NOT_IN_RANGE
        ) {
          creep.customMoveTo(target);
          break;
        }
      }
    } else {
      creep.debugSay("📦?");
    }
  }

  /**
   * ЗАДАЧА 4: Ожидание.
   */
  private executeIdleTask(creep: Creep): void {
    creep.debugSay("💤");
  }
}

export const carry = new CarryRole();
profiler.registerObject(carry, "Creep.Role.Carry");
