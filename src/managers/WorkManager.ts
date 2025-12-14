export class WorkManager {
  /**
   * Выполняет работу строителя: строит.
   * @param creep Крип-строитель.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static build(creep: Creep): boolean {
    let target: ConstructionSite | null =
      creep.getCreepTarget<ConstructionSite>();

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    }

    if (target) {
      creep.setCreepTarget(target);

      creep.build(target);
      if (creep.pos.getRangeTo(target) > 1) {
        creep.customMoveTo(target);
      }
      return true;
    }
    return false;
  }

  /**
   * Выполняет работу апгрейдера: улучшает контроллер.
   * @param creep Крип-апгрейдер.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static upgrade(creep: Creep): boolean {
    const controller = creep.room.controller;
    if (controller) {
      creep.upgradeController(controller);
      if (creep.pos.getRangeTo(controller) > 1) {
        creep.customMoveTo(controller);
      }
      return true;
    }
    return false;
  }

  /**
   * Основной метод для выполнения работы ремонтника.
   * @param creep Крип-ремонтник.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static repair(creep: Creep): boolean {
    let target: AnyStructure | null = creep.getCreepTarget<AnyStructure>();

    if (!target || target.hits === target.hitsMax) {
      target = null;
      target = this.getRepairTarget(creep);
    }

    if (target) {
      creep.setCreepTarget(target);

      creep.repair(target);
      if (creep.pos.getRangeTo(target) > 1) {
        creep.customMoveTo(target);
      }
      return true;
    }

    creep.setCreepTarget(null);
    return this.repairDefense(creep);
  }

  /**
   * Доставляет энергию в спавны, экстеншены и башни.
   * @param creep Крип-носильщик.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static deliverEnergyToSpawnsExtensionsTowers(creep: Creep): boolean {
    let target = creep.getCreepTarget<
      StructureExtension | StructureSpawn | StructureTower
    >();

    if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      target = null;
      const potentialTargets = this.getFreeStructures(creep.room);
      if (potentialTargets.length > 0) {
        target = creep.pos.findClosestByPath(potentialTargets);
      }
    }

    if (target) {
      creep.setCreepTarget(target);
      const amountToTransfer = Math.min(
        creep.store.getUsedCapacity(RESOURCE_ENERGY),
        target.store.getFreeCapacity(RESOURCE_ENERGY),
      );

      if (
        creep.transfer(target, RESOURCE_ENERGY, amountToTransfer) ===
        ERR_NOT_IN_RANGE
      ) {
        creep.customMoveTo(target);
      }
      return true;
    }
    return false;
  }

  /**
   * Проверяет, есть ли в комнате структуры (спавны, экстеншены, башни), которым нужна энергия.
   * @param room Комната.
   * @returns true, если есть такие структуры.
   */
  public static hasPrimaryDeliveryTargets(room: Room): boolean {
    return this.getFreeStructures(room).length > 0;
  }

  /**
   * Чинит оборонительные сооружения (стены, рампарты).
   * @param creep Крип.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static repairDefense(creep: Creep): boolean {
    let target: AnyStructure | null = creep.getCreepTarget<AnyStructure>();

    if (!target || target.hits === target.hitsMax) {
      target = null;
      const repairThresholds = [
        5000, 10000, 30000, 50000, 100000, 300000, 500000, 700000, 1000000,
        1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 10000000,
        15000000, 20000000, 30000000, 50000000, 75000000, 100000000, 150000000,
        200000000, 250000000, 300000000,
      ];

      for (const h of repairThresholds) {
        const potentialTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) =>
            s.hits < h &&
            (s.structureType === STRUCTURE_WALL ||
              s.structureType === STRUCTURE_RAMPART),
        });
        if (potentialTarget) {
          target = potentialTarget;
          break;
        }
      }
    }

    if (target) {
      creep.setCreepTarget(target);

      creep.repair(target);
      if (creep.pos.getRangeTo(target) > 1) {
        creep.customMoveTo(target);
      }
      return true;
    }
    return false;
  }

  /**
   * Ищет обычные поврежденные структуры для ремонта.
   * @param creep Крип.
   * @returns Поврежденная структура или null.
   */
  private static getRepairTarget(creep: Creep): AnyStructure | null {
    const damagedStructures = creep.room
      .find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType !== STRUCTURE_WALL &&
            structure.structureType !== STRUCTURE_RAMPART &&
            structure.hits < structure.hitsMax * 0.8 // Чиним, если меньше 80%
          );
        },
      })
      .sort((s1, s2) => s1.hits / s1.hitsMax - s2.hits / s2.hitsMax); // Сначала самые поврежденные

    return (damagedStructures[0] as AnyStructure) || null;
  }

  /**
   * Вспомогательный метод: ищет структуры, которым нужна энергия, в порядке приоритета.
   * @param room Комната.
   * @returns Массив структур.
   */
  private static getFreeStructures(
    room: Room,
  ): (StructureExtension | StructureSpawn | StructureTower)[] {
    // Приоритет 1: Спауны и расширения
    const primaryTargets = room.find<StructureSpawn | StructureExtension>(
      FIND_STRUCTURES,
      {
        filter: (s) =>
          (s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      },
    );

    if (primaryTargets.length > 0) {
      return primaryTargets;
    }

    // Приоритет 2: Башни (только если спауны и расширения полные)
    return room.find<StructureTower>(FIND_STRUCTURES, {
      filter: (s) =>
        s.structureType === STRUCTURE_TOWER &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
    });
  }
}
