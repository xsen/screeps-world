import { repair } from "../creeps/roles/RepairRole.ts";
import { miner } from "../creeps/roles/MinerRole.ts";
import { carry } from "../creeps/roles/CarryRole.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";
import { builder } from "../creeps/roles/BuilderRole.ts";

export const autoPlan: { [role: string]: AutoSpawnPlan } = {
  [miner.name]: {
    handler: miner,
    baseBody: [WORK, WORK, MOVE, CARRY],
    scaling: [WORK],
    minCount: 1,
    maxCount: 2,
    priority: 0,
    maxCost: 600,
    energyReserve: 500,
  },
  [carry.name]: {
    handler: carry,
    baseBody: [CARRY, CARRY, MOVE],
    scaling: [CARRY, CARRY, MOVE],
    minCount: 1,
    maxCount: 2,
    priority: 1,
    maxCost: 1200,
    energyReserve: 300,
  },
  [upgrader.name]: {
    handler: upgrader,
    baseBody: [WORK, CARRY, CARRY, MOVE],
    scaling: [WORK, CARRY, CARRY, MOVE],
    minCount: 1,
    maxCount: 3,
    priority: 2,
    maxCost: 2500,
  },
  [builder.name]: {
    handler: builder,
    baseBody: [WORK, WORK, CARRY, MOVE],
    scaling: [WORK, WORK, CARRY, MOVE],
    minCount: 0,
    maxCount: 2,
    priority: 3,
    maxCost: 1500,
  },
  [repair.name]: {
    handler: repair,
    baseBody: [WORK, CARRY, MOVE, MOVE],
    scaling: [WORK, CARRY, MOVE, MOVE],
    minCount: 1,
    maxCount: 1,
    priority: 4,
    maxCost: 2500,
  },
};
