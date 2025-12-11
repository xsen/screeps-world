/**
 * Базовый класс для "простых" ролей, которые живут по двухтактному циклу:
 * 1. Добыть энергию, пока трюм не заполнится.
 * 2. Работать, пока трюм не опустеет.
 *
 * Подходит для ролей: Builder, Upgrader, Repair.
 */

export const CREEP_STATUS_GETTING_ENERGY = "gettingEnergy";
export const CREEP_STATUS_WORKING = "working";

export abstract class SimpleWorkRole implements CreepRoleHandler {
  public abstract name: string;

  /**
   * Основной метод выполнения роли. Управляет состоянием крипа.
   */
  public run(creep: Creep): void {
    this.switchState(creep);

    if (creep.getStatus() === CREEP_STATUS_GETTING_ENERGY) {
      this.doGetEnergy(creep);
    } else {
      this.doWork(creep);
    }
  }

  /**
   * Метод для получения энергии. По умолчанию использует EnergyManager.
   */
  protected doGetEnergy(creep: Creep): void {
    creep.getEnergy();
  }

  /**
   * Абстрактный метод для выполнения работы. Должен быть реализован в дочерних классах.
   */
  protected abstract doWork(creep: Creep): void;

  /**
   * Переключает состояние крипа в зависимости от его заполненности.
   */
  private switchState(creep: Creep): void {
    // Если крип НЕ добывает энергию и у него 0 энергии, переключаем его на добычу.
    if (
      creep.getStatus() !== CREEP_STATUS_GETTING_ENERGY &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
    ) {
      creep.setStatus(CREEP_STATUS_GETTING_ENERGY);
      creep.debugSay("⚡");
    }
    // Если крип добывает энергию и его трюм полон, переключаем на работу.
    else if (
      creep.getStatus() === CREEP_STATUS_GETTING_ENERGY &&
      creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
    ) {
      creep.setStatus(CREEP_STATUS_WORKING);
      creep.debugSay("🚧");
    }
    // Если статус не установлен, по умолчанию отправляем за энергией.
    else if (!creep.getStatus()) {
      creep.setStatus(CREEP_STATUS_GETTING_ENERGY);
    }
  }
}
