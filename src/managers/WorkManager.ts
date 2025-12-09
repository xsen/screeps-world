export type WorkTarget = ConstructionSite | Structure | StructureController;

export class WorkManager {
  /**
   * Выполняет работу строителя: строит.
   * @param creep Крип-строитель.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static build(creep: Creep): boolean {
    const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (target) {
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
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
      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
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
    let target: AnyStructure | null = null;

    if (creep.memory.targetId) {
      const storedTarget = creep.getCreepTarget<AnyStructure>();
      if (storedTarget && storedTarget.hits < storedTarget.hitsMax) {
        target = storedTarget;
      } else {
        creep.setCreepTarget(null);
      }
    }

    if (!target) {
      target = this.getRepairTarget(creep);
    }

    if (target && target.hits < target.hitsMax) {
      creep.setCreepTarget(target);
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
      return true;
    } else {
      creep.setCreepTarget(null);

      return this.repairDefense(creep);
    }
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

    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      target =
        this.getFreeStructures(creep.room).sort(
          (s1, s2) => s1.pos.getRangeTo(creep) - s2.pos.getRangeTo(creep),
        )[0] || null;
    }

    if (target) {
      creep.setCreepTarget(target);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
   * Доставляет энергию в хранилище или контейнеры.
   * @param creep Крип-носильщик.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  public static deliverEnergyToStorage(creep: Creep): boolean {
    let target: StructureStorage | StructureContainer | null =
      creep.getCreepTarget<StructureStorage | StructureContainer>();

    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      // Приоритет: Storage
      if (
        creep.room.storage &&
        creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      ) {
        target = creep.room.storage;
      } else {
        // Если storage нет или он полон, ищем ближайший контейнер с свободным местом
        target = creep.pos.findClosestByPath<StructureContainer>(
          FIND_STRUCTURES,
          {
            filter: (structure) =>
              structure.structureType === STRUCTURE_CONTAINER &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
          },
        );
      }
    }

    if (target) {
      creep.setCreepTarget(target);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
   * Чинит оборонительные сооружения (стены, рампарты).
   * @param creep Крип.
   * @returns true, если работа была найдена и начата/продолжена.
   */
  private static repairDefense(creep: Creep): boolean {
    const repairThresholds = [
      5000, 10000, 30000, 50000, 100000, 300000, 500000, 700000, 1000000,
      1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 10000000,
      15000000, 20000000, 30000000, 50000000, 75000000, 100000000, 150000000,
      200000000, 250000000, 300000000,
    ];

    for (const h of repairThresholds) {
      const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.hits < h &&
          (s.structureType === STRUCTURE_WALL ||
            s.structureType === STRUCTURE_RAMPART),
      });

      if (target) {
        creep.setCreepTarget(target); // Сохраняем цель
        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.customMoveTo(target);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Вспомогательный метод: ищет структуры, которым нужна энергия.
   * @param room Комната.
   * @returns Массив структур.
   */
  private static getFreeStructures(
    room: Room,
  ): (StructureExtension | StructureSpawn | StructureTower)[] {
    const types: StructureConstant[] = [
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN,
      STRUCTURE_TOWER,
    ];

    return room.find(FIND_STRUCTURES, {
      filter: (
        structure: StructureExtension | StructureSpawn | StructureTower,
      ) => {
        return (
          types.includes(structure.structureType) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });
  }
}
