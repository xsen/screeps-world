export type EnergyTarget =
  | Resource
  | StructureContainer
  | StructureStorage
  | Source;
type TargetFinder = (creep: Creep) => EnergyTarget | null;

/**
 * Массив функций для поиска источников энергии в порядке приоритета.
 * 1. Брошенные ресурсы.
 * 2. Контейнеры и хранилища.
 * 3. Активные источники.
 */
const targetFinders: TargetFinder[] = [
  // Приоритет 1: Брошенные ресурсы
  (creep: Creep): Resource | null => {
    return creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount > 20,
    });
  },

  // Приоритет 2: Контейнеры и хранилища с достаточным количеством энергии
  (creep: Creep): StructureContainer | StructureStorage | null => {
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: (s) =>
        (s.structureType === STRUCTURE_CONTAINER ||
          s.structureType === STRUCTURE_STORAGE) &&
        s.store.getUsedCapacity(RESOURCE_ENERGY) >= freeCapacity,
    }) as (StructureContainer | StructureStorage)[]; // Приводим к общему типу для сортировки

    if (targets.length === 0) {
      return null;
    }

    // Сортируем: сначала по количеству энергии (убывание), затем по расстоянию (возрастание)
    targets.sort((a, b) => {
      const energyA = a.store.getUsedCapacity(RESOURCE_ENERGY);
      const energyB = b.store.getUsedCapacity(RESOURCE_ENERGY);

      if (energyA !== energyB) {
        return energyB - energyA; // Больше энергии - выше приоритет
      }

      // Если энергии одинаково, выбираем ближайший
      return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
    });

    return targets[0];
  },

  // Приоритет 3: Активные источники
  (creep: Creep): Source | null => {
    return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  },
];

export class EnergyManager {
  /**
   * Проверяет, является ли текущая цель все еще валидной.
   * @param target Цель для проверки.
   * @param creep Крип, для которого проверяется цель.
   */
  public static isTargetValid(
    target: EnergyTarget | null,
    creep: Creep,
  ): boolean {
    if (!target) {
      return false;
    }
    if (target instanceof Resource) {
      return target.amount > 0;
    }
    if (target instanceof Source) {
      return target.energy > 0;
    }
    if (
      target instanceof StructureContainer ||
      target instanceof StructureStorage
    ) {
      return (
        target.store.getUsedCapacity(RESOURCE_ENERGY) >=
        creep.store.getFreeCapacity(RESOURCE_ENERGY)
      );
    }
    return false;
  }

  /**
   * Находит новую цель для сбора энергии, перебирая все доступные стратегии.
   * @param creep Крип, для которого ищется цель.
   */
  public static findNewTarget(creep: Creep): EnergyTarget | null {
    for (const find of targetFinders) {
      const target = find(creep);
      if (target) {
        return target;
      }
    }
    return null;
  }

  /**
   * Выполняет действие сбора энергии в зависимости от типа цели.
   * @param creep Крип, который выполняет действие.
   * @param target Цель, с которой взаимодействует крип.
   */
  public static execute(creep: Creep, target: EnergyTarget): void {
    if (target instanceof Resource) {
      if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    } else if (target instanceof Source) {
      if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    } else {
      if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    }
  }
}
