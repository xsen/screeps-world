import {HarvestFromSource} from "../tasks/HarvestFromSource.ts";
import {WithdrawFromTarget} from "../tasks/WithdrawFromTarget.ts";
import {PickupResource} from "../tasks/PickupResource.ts";
import {TaskStatus} from "../../types.ts";

export abstract class SimpleWorkRole implements CreepRoleHandler {
  public abstract name: string;

  public run(creep: Creep): void {
    this.updateState(creep);

    if (creep.memory.working) {
      this.findAndExecuteWorkTask(creep);
    } else {
      this.findAndExecuteEnergyTask(creep);
    }
  }

  public abstract getSpawnPlans(room: Room): SpawnPlan[];

  protected findAndExecuteEnergyTask(creep: Creep): void {
    let target = creep.getCreepTarget<StructureContainer | StructureStorage | Source | Resource>();

    if (target) {
      const isDepleted =
        ("store" in target && target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
        ("amount" in target && target.amount === 0) ||
        ("energy" in target && target.energy === 0);
      if (isDepleted) {
        target = null;
        creep.setCreepTarget(null);
      }
    }

    if (!target) {
      const newTarget = this.findNewEnergySource(creep);
      if (newTarget) {
        target = newTarget;
        creep.setCreepTarget(newTarget);
      }
    }

    if (target) {
      let task: Task;
      if ("amount" in target) {
        task = new PickupResource(target as Resource);
      } else if ("energy" in target) {
        task = new HarvestFromSource(target as Source);
      } else if ("store" in target) {
        task = new WithdrawFromTarget(target as StructureContainer | StructureStorage);
      } else {
        creep.setCreepTarget(null);
        creep.debugSay("❓TGT");
        return;
      }

      const taskResult = task.execute(creep);
      if (taskResult === TaskStatus.COMPLETED || taskResult === TaskStatus.FAILED) {
        creep.setCreepTarget(null);
      }
    } else {
      creep.debugSay("😴");
    }
  }

  private findNewEnergySource(creep: Creep): StructureContainer | StructureStorage | Source | Resource | null {
    const energySources: (StructureContainer | StructureStorage | Resource)[] = [];

    // Storage
    if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      energySources.push(creep.room.storage);
    }

    // Containers
    const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 100,
    });
    energySources.push(...containers);

    // Dropped Resources
    const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 50,
    });
    energySources.push(...droppedResources);

    if (energySources.length > 0) {
      return creep.pos.findClosestByPath(energySources);
    }

    // Last Resort: Active Sources
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source) return source;

    return null;
  }

  protected abstract findAndExecuteWorkTask(creep: Creep): void;

  private updateState(creep: Creep): void {
    if (creep.memory.working && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.working = false;
      creep.setCreepTarget(null);
      creep.debugSay("⚡");
    } else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.working = true;
      creep.setCreepTarget(null);
      creep.debugSay("🚧");
    } else if (creep.memory.working === undefined) {
      creep.memory.working = false;
    }
  }
}
