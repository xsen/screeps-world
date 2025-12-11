import { WorkManager } from "../../managers/WorkManager";
import profiler from "screeps-profiler";

const CARRY_STATUS_REFILLING = "refilling";
const CARRY_STATUS_DELIVERING = "delivering";
const CARRY_STATUS_STORING = "storing";
const CARRY_STATUS_PICKUP_DROPPED = "pickupDropped";

class CarryRole implements CreepRoleHandler {
  public name = "carry";
  public defaultMinBody: SpawnCreepBody[] = [
    { count: 1, body: CARRY },
    { count: 1, body: MOVE },
  ];
  public defaultPriority = 10;
  public defaultIsEmergency = true;
  public defaultPreSpawnTicks = 50;

  /**
   * Основной метод выполнения роли носильщика.
   * Управляет сложной логикой состояний.
   */
  public run(creep: Creep): void {
    // 1. Логика переключения состояний
    this.switchState(creep);

    // 2. Выполнение действий в зависимости от состояния
    switch (creep.getStatus()) {
      case CARRY_STATUS_REFILLING:
        refillEnergy(creep);
        break;
      case CARRY_STATUS_DELIVERING:
        WorkManager.deliverEnergyToSpawnsExtensionsTowers(creep);
        break;
      case CARRY_STATUS_STORING:
        WorkManager.deliverEnergyToStorage(creep);
        break;
      case CARRY_STATUS_PICKUP_DROPPED:
        pickupDroppedEnergy(creep);
        break;
      default:
        // Если статус некорректен, switchState() его инициализирует.
        // Здесь мы просто ничего не делаем, так как switchState() уже отработает.
        break;
    }
  }

  /**
   * Управляет переходами между состояниями для носильщика.
   * Этот метод является единственным местом, где меняется статус крипа.
   */
  private switchState(creep: Creep): void {
    const currentStatus = creep.getStatus();
    const energy = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    const hasPrimaryTargetsNeedingEnergy =
      WorkManager.hasPrimaryDeliveryTargets(creep.room);
    const droppedEnergyAvailable =
      creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) =>
          resource.resourceType === RESOURCE_ENERGY && resource.amount > 0,
      }).length > 0;

    if (!currentStatus) {
      creep.setStatus(CARRY_STATUS_REFILLING);
      creep.debugSay("⚡ init refill");
      return;
    }

    // Правило 1: Если крип пуст, он должен получить энергию
    if (energy === 0) {
      if (droppedEnergyAvailable) {
        if (currentStatus !== CARRY_STATUS_PICKUP_DROPPED) {
          creep.setStatus(CARRY_STATUS_PICKUP_DROPPED);
          creep.setCreepTarget(null);
          creep.debugSay("⚡ pickup");
        }
      } else {
        if (currentStatus !== CARRY_STATUS_REFILLING) {
          creep.setStatus(CARRY_STATUS_REFILLING);
          creep.setCreepTarget(null);
          creep.debugSay("⚡ refill");
        }
      }
      return;
    }

    // Правило 2: Если есть первичные цели, которые нуждаются в энергии, доставить им
    if (hasPrimaryTargetsNeedingEnergy) {
      if (currentStatus !== CARRY_STATUS_DELIVERING) {
        creep.setStatus(CARRY_STATUS_DELIVERING);
        creep.setCreepTarget(null);
        creep.debugSay("🚚 deliver");
      }
      return;
    }

    // Правило 3: Если крип не полон и есть брошенная энергия, подобрать ее
    if (freeCapacity > 0 && droppedEnergyAvailable) {
      if (currentStatus !== CARRY_STATUS_PICKUP_DROPPED) {
        creep.setStatus(CARRY_STATUS_PICKUP_DROPPED);
        creep.setCreepTarget(null);
        creep.debugSay("⚡ pickup");
      }
      return;
    }

    // Правило 4: Если ни одно из вышеперечисленных условий не выполнено, хранить энергию
    if (currentStatus !== CARRY_STATUS_STORING) {
      creep.setStatus(CARRY_STATUS_STORING);
      creep.setCreepTarget(null);
      creep.debugSay("📦 store");
    }
  }
}

export const carry = new CarryRole();
profiler.registerObject(carry, "Creep.Role.Carry");

const refillEnergy = (creep: Creep): void => {
  let target = creep.getCreepTarget<StructureContainer | StructureStorage>();

  if (target && target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    target = null;
    creep.setCreepTarget(null);
  }

  if (!target) {
    const hasPrimaryTargets = WorkManager.hasPrimaryDeliveryTargets(creep.room);

    // Если есть первичные цели (spawn, extension, tower), то можно брать энергию из хранилища.
    if (
      hasPrimaryTargets &&
      creep.room.storage &&
      creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    ) {
      target = creep.room.storage;
    }

    // Если цель не хранилище (или его нет), ищем в контейнерах.
    if (!target) {
      const containersWithEnergy = creep.room.find<StructureContainer>(
        FIND_STRUCTURES,
        {
          filter: (s) =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
        },
      );

      if (containersWithEnergy.length > 0) {
        // Ищем самый полный контейнер, чтобы эффективно опустошать его.
        target = containersWithEnergy.sort(
          (a, b) =>
            b.store.getUsedCapacity(RESOURCE_ENERGY) -
            a.store.getUsedCapacity(RESOURCE_ENERGY),
        )[0];
      }
    }
  }

  if (!target) {
    return; // Если источников энергии нет, ничего не делаем.
  }

  creep.setCreepTarget(target);
  if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    creep.customMoveTo(target);
  }
};

const pickupDroppedEnergy = (creep: Creep): void => {
  let target = creep.getCreepTarget<Resource>();

  if (target && target.amount === 0) {
    target = null;
    creep.setCreepTarget(null);
  }

  if (!target) {
    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (resource) =>
        resource.resourceType === RESOURCE_ENERGY && resource.amount > 0,
    });

    if (droppedEnergy.length > 0) {
      droppedEnergy.sort((a, b) => b.amount - a.amount);
      target = droppedEnergy[0];
    }
  }

  if (!target) {
    return;
  }

  creep.setCreepTarget(target);
  if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
    creep.customMoveTo(target);
  }
};
