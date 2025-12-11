import { withdraw } from "../creeps/commands/withdraw.ts";
import { transfer } from "../creeps/commands/transfer.ts";
import { carry } from "../creeps/roles/CarryRole.ts";
import { miner } from "../creeps/roles/MinerRole.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";
import { builder } from "../creeps/roles/BuilderRole.ts";
import { command } from "../creeps/roles/CommandRole.ts";
import { repair } from "../creeps/roles/RepairRole.ts";
import { createSpawnPlanForRole } from "./spawnPlanUtils.ts";

export const spawnPlan: SpawnPlansByRoom = {
  E1S37: [
    createSpawnPlanForRole(carry, {
      body: [
        { count: 14, body: CARRY },
        { count: 7, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    }),
    createSpawnPlanForRole(miner, {
      body: [
        { count: 5, body: WORK },
        { count: 1, body: CARRY },
        { count: 1, body: MOVE },
      ],
      limit: 2,
      generation: 10,
    }),
    createSpawnPlanForRole(repair, {
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    }),
    createSpawnPlanForRole(builder, {
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 0,
      generation: 10,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    }),
    createSpawnPlanForRole(command, {
      body: [
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
      limit: 0,
      commands: [
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(20, 18, "E1S36"),
          handler: transfer,
        },
      ],
      targetRoom: "",
      generation: 11,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 6, body: WORK },
        { count: 6, body: CARRY },
        { count: 12, body: MOVE },
      ],
      limit: 5,
      targetRoom: "E1S36",
      generation: 12,
    }),
  ],
  E1S36: [
    createSpawnPlanForRole(carry, {
      body: [
        { count: 12, body: CARRY },
        { count: 6, body: MOVE },
      ],
      generation: 31,
      limit: 2,
    }),
    createSpawnPlanForRole(miner, {
      body: [
        { count: 5, body: WORK },
        { count: 1, body: CARRY },
        { count: 1, body: MOVE },
      ],
      generation: 30,
      limit: 2,
    }),
    createSpawnPlanForRole(repair, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    }),
    createSpawnPlanForRole(builder, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 3, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    }),
  ],
  E2S34: [
    createSpawnPlanForRole(carry, {
      body: [
        { count: 10, body: CARRY },
        { count: 5, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    }),
    createSpawnPlanForRole(miner, {
      body: [
        { count: 5, body: WORK },
        { count: 1, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    }),
    createSpawnPlanForRole(carry, {
      body: [
        { count: 6, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 41,
      limit: 0,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    }),
    createSpawnPlanForRole(repair, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 6, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    }),
    createSpawnPlanForRole(builder, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    }),
    createSpawnPlanForRole(command, {
      body: [
        { count: 2, body: CARRY },
        { count: 2, body: MOVE },
      ],
      limit: 0,
      commands: [
        {
          target: new RoomPosition(30, 30, "E2S34"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(27, 31, "E2S34"),
          handler: transfer,
        },
      ],
      targetRoom: "",
      generation: 41,
    }),
  ],
};
