import { WorkManager } from "../../managers/WorkManager";
import profiler from "screeps-profiler";

const STATUS_GET_ENERGY_FOR_REFILL = "get_energy_for_refill";
const STATUS_DELIVER_ENERGY_TO_STRUCTURES = "deliver_energy_to_structures";
const STATUS_GET_ENERGY_FROM_LINK = "get_energy_from_link";
const STATUS_DELIVER_ENERGY_TO_STORAGE = "deliver_energy_to_storage";
const STATUS_IDLE = "idle";

class RefillerRole implements CreepRoleHandler {
  public name = "refiller";
  public defaultMinBody: SpawnCreepBody[] = [
    { count: 2, body: CARRY },
    { count: 1, body: MOVE },
  ];
  public defaultPriority = 10;
  public defaultIsEmergency = true;
  public defaultPreSpawnTicks = 50;

  public run(creep: Creep): void {
    this.decideState(creep);

    switch (creep.getStatus()) {
      case STATUS_GET_ENERGY_FOR_REFILL:
        this.executeGetEnergyForRefill(creep);
        break;
      case STATUS_DELIVER_ENERGY_TO_STRUCTURES:
        this.executeDeliverEnergyToStructures(creep);
        break;
      case STATUS_GET_ENERGY_FROM_LINK:
        this.executeGetEnergyFromLink(creep);
        break;
      case STATUS_DELIVER_ENERGY_TO_STORAGE:
        this.executeDeliverEnergyToStorage(creep);
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
    const hasEnergy = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    const isFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

    // --- Главный приоритет: Заправка структур ---
    const needsPrimaryRefill = WorkManager.hasPrimaryDeliveryTargets(
      creep.room,
    );
    if (needsPrimaryRefill) {
      if (hasEnergy) {
        if (currentStatus !== STATUS_DELIVER_ENERGY_TO_STRUCTURES) {
          creep.setStatus(STATUS_DELIVER_ENERGY_TO_STRUCTURES);
          creep.setCreepTarget(null);
        }
      } else {
        if (currentStatus !== STATUS_GET_ENERGY_FOR_REFILL) {
          creep.setStatus(STATUS_GET_ENERGY_FOR_REFILL);
          creep.setCreepTarget(null);
        }
      }
      return;
    }

    // --- Второй приоритет: Перевозка из центрального линка в хранилище ---
    const storage = creep.room.storage;
    const cache = creep.room.memory.linkCache;
    const centralLink = cache?.centralLinkId
      ? Game.getObjectById(cache.centralLinkId)
      : null;
    const centralLinkHasEnergy =
      storage &&
      centralLink &&
      centralLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0;

    if (centralLinkHasEnergy) {
      if (isFull) {
        if (currentStatus !== STATUS_DELIVER_ENERGY_TO_STORAGE) {
          creep.setStatus(STATUS_DELIVER_ENERGY_TO_STORAGE);
          creep.setCreepTarget(null);
        }
      } else {
        if (currentStatus !== STATUS_GET_ENERGY_FROM_LINK) {
          creep.setStatus(STATUS_GET_ENERGY_FROM_LINK);
          creep.setCreepTarget(null);
        }
      }
      return;
    }

    // --- Если задач нет - ожидание ---
    if (currentStatus !== STATUS_IDLE) {
      creep.setStatus(STATUS_IDLE);
      creep.setCreepTarget(null);
    }
  }

  /**
   * Состояние: Ищем энергию для заправки структур.
   */
  private executeGetEnergyForRefill(creep: Creep): void {
    // Используем creep.getEnergy() для поиска ближайшего источника
    creep.getEnergy();
  }

  /**
   * Состояние: Доставляем энергию в структуры.
   */
  private executeDeliverEnergyToStructures(creep: Creep): void {
    WorkManager.deliverEnergyToSpawnsExtensionsTowers(creep);
  }

  /**
   * Состояние: Берем энергию из центрального линка.
   */
  private executeGetEnergyFromLink(creep: Creep): void {
    let target = creep.getCreepTarget<StructureLink>();

    // Если закэшированная цель невалидна, ищем новую
    if (!target || target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      target = null; // Обнуляем, чтобы найти новую
      const cache = creep.room.memory.linkCache;
      if (cache?.centralLinkId) {
        const centralLink = Game.getObjectById(cache.centralLinkId);
        if (
          centralLink &&
          centralLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        ) {
          target = centralLink;
        }
      }
    }

    if (target) {
      creep.setCreepTarget(target);
      if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    }
  }

  /**
   * Состояние: Доставляем энергию в хранилище.
   */
  private executeDeliverEnergyToStorage(creep: Creep): void {
    let target = creep.getCreepTarget<StructureStorage>();

    // Если закэшированная цель невалидна, ищем новую
    if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      target = null;
      if (
        creep.room.storage &&
        creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      ) {
        target = creep.room.storage;
      }
    }

    if (target) {
      creep.setCreepTarget(target);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.customMoveTo(target);
      }
    }
  }

  /**
   * Состояние: Ожидание.
   */
  private executeIdleTask(creep: Creep): void {
    const storage = creep.room.storage;
    if (storage && !creep.pos.inRangeTo(storage, 3)) {
      creep.customMoveTo(storage);
    }
    creep.debugSay("😴");
  }
}

export const refiller = new RefillerRole();
profiler.registerObject(refiller, "Creep.Role.Refiller");
