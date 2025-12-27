import { tickCache } from "../../cache/TickCache.ts";
import { memoryCache } from "../../cache/MemoryCache.ts";
import { DeliverEnergyTask } from "../tasks/DeliverEnergyTask.ts";
import { GatherHaulEnergyTask } from "../tasks/GatherHaulEnergyTask.ts";
import { TaskStatus } from "../../types.ts";

class HaulerRole implements CreepRoleHandler {
  public name = "hauler";

  public getSpawnPlans(room: Room): SpawnPlan[] {
    const storage = room.storage;
    if (!storage) return [];

    const sourcesToHaulFrom = this.getSourcesToHaulFrom(room);
    const centralLink = this.getCentralLink(room);

    // Spawn condition: we need a hauler if there are unlinked sources OR a central link to empty.
    if (sourcesToHaulFrom.length === 0 && !centralLink) {
      return [];
    }

    // If we only have a central link to service, spawn one medium-sized hauler.
    if (sourcesToHaulFrom.length === 0 && centralLink) {
      const body = this.calculateBody(
        room.energyCapacityAvailable,
        16,
        8,
      ); // 16 CARRY, 8 MOVE
      if (body.length === 0) return [];
      return [
        {
          handlerName: this.name,
          body: body,
          generation: 1,
          limit: 1,
          priority: 9,
        },
      ];
    }

    // If we have sources to haul from, use the dynamic calculation.
    const requiredThroughput = sourcesToHaulFrom.length * 10;
    let totalRoundTripTime = 0;
    for (const source of sourcesToHaulFrom) {
      const pathKey = `path_${storage.id}_${source.id}`;
      let travelTime = memoryCache.get<number>(pathKey);
      if (travelTime === null) {
        travelTime = storage.pos.findPathTo(source.pos, {
          ignoreCreeps: true,
        }).length;
        memoryCache.set(pathKey, travelTime, 5000);
      }
      totalRoundTripTime += travelTime * 2;
    }
    const avgRoundTripTime = totalRoundTripTime / sourcesToHaulFrom.length;
    const totalCarryCapacity = requiredThroughput * avgRoundTripTime;
    const totalCarryParts = Math.ceil(totalCarryCapacity / 50);

    if (totalCarryParts === 0) return [];

    const idealCarryPerCreep = 16;
    const limit = Math.ceil(totalCarryParts / idealCarryPerCreep) || 1;
    const carryPerCreep = Math.ceil(totalCarryParts / limit);
    const movePerCreep = Math.ceil(carryPerCreep / 2);

    const body = this.calculateBody(
      room.energyCapacityAvailable,
      carryPerCreep,
      movePerCreep,
    );
    if (body.length === 0) return [];

    return [
      {
        handlerName: this.name,
        body: body,
        generation: 1,
        limit: limit,
        priority: 9,
      },
    ];
  }

  private calculateBody(
    energyCapacity: number,
    carry: number,
    move: number,
  ): SpawnCreepBody[] {
    const bodyCost = carry * 50 + move * 50;
    if (bodyCost > energyCapacity) {
      const ratio = carry / move;
      const blockCost = ratio * 50 + 50;
      const numBlocks = Math.floor(energyCapacity / blockCost);
      const carryCount = Math.floor(numBlocks * ratio);
      const moveCount = numBlocks;
      if (carryCount > 0)
        return [
          { count: carryCount, body: CARRY },
          { count: moveCount, body: MOVE },
        ];
    } else {
      if (carry > 0)
        return [
          { count: carry, body: CARRY },
          { count: move, body: MOVE },
        ];
    }
    return [];
  }

  public run(creep: Creep): void {
    this.updateState(creep);

    if (creep.memory.working) {
      if (!this.executeDelivering(creep)) {
        this.executeIdleTask(creep);
      }
    } else {
      const task = new GatherHaulEnergyTask();
      if (task.execute(creep) === TaskStatus.FAILED) {
        this.executeIdleTask(creep);
      }
    }
  }

  private updateState(creep: Creep): void {
    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false;
      creep.setCreepTarget(null);
      creep.debugSay("🔄 gather");
    } else if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      creep.setCreepTarget(null);
      creep.debugSay("🚚 deliver");
    } else if (creep.memory.working === undefined) {
      creep.memory.working = false;
    }
  }

  private executeDelivering(creep: Creep): boolean {
    const storage = creep.room.storage;
    if (!storage) return false;

    let target = creep.getCreepTarget<AnyStructure>();
    if (target && target.id !== storage.id) {
      target = null;
      creep.setCreepTarget(null);
    }

    if (!target) {
      target = storage;
      creep.setCreepTarget(target);
    }

    new DeliverEnergyTask(storage).execute(creep);
    return true;
  }

  private getSourcesToHaulFrom(room: Room): Source[] {
    return tickCache.get(`haul_sources_${room.name}`, () => {
      const sources = room.find(FIND_SOURCES);
      const links = room.find<StructureLink>(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LINK,
      });
      return sources.filter((s) => !links.some((l) => l.pos.inRangeTo(s.pos, 2)));
    });
  }

  private getCentralLink(room: Room): StructureLink | null {
    const cache = room.memory.linkCache;
    return (cache && cache.centralLinkId)
      ? Game.getObjectById(cache.centralLinkId)
      : null;
  }

  private executeIdleTask(creep: Creep): void {
    const storage = creep.room.storage;
    if (storage && !creep.pos.inRangeTo(storage, 2)) {
      creep.customMoveTo(storage);
    }
    creep.debugSay("😴");
  }
}

export const hauler = new HaulerRole();
