import { withdraw } from "../creeps/commands/withdraw.ts";
import { transfer } from "../creeps/commands/transfer.ts";
import { carry } from "../creeps/roles/CarryRole.ts";
import { miner } from "../creeps/roles/MinerRole.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";
import { builder } from "../creeps/roles/BuilderRole.ts";
import { command } from "../creeps/roles/CommandRole.ts";
import { repair } from "../creeps/roles/RepairRole.ts";
import { createSpawnPlanForRole } from "./spawnPlanUtils.ts";
import { refiller } from "../creeps/roles/RefillerRole.ts";

export const spawnPlan: SpawnPlansByRoom = {
  E1S37: [
    createSpawnPlanForRole(refiller, {
      body: [
        { count: 14, body: CARRY },
        { count: 7, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    }),
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
      preSpawnTicks: 100,
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
      limit: 1,
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
        { count: 2, body: MOVE },
      ],
      commands: [
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(45, 18, "E1S37"),
          handler: transfer,
        },
      ],
      limit: 0,
      generation: 10,
      targetRoom: "",
    }),
    createSpawnPlanForRole(command, {
      body: [
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
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
      limit: 0,
      generation: 11,
      targetRoom: "",
    }),
  ],
  E1S36: [
    createSpawnPlanForRole(refiller, {
      body: [
        { count: 30, body: CARRY },
        { count: 15, body: MOVE },
      ],
      limit: 1,
      generation: 30,
    }),
    createSpawnPlanForRole(carry, {
      body: [
        { count: 30, body: CARRY },
        { count: 15, body: MOVE },
      ],
      limit: 1,
      generation: 30,
    }),
    createSpawnPlanForRole(miner, {
      body: [
        { count: 5, body: WORK },
        { count: 1, body: CARRY },
        { count: 1, body: MOVE },
      ],
      limit: 2,
      generation: 30,
      preSpawnTicks: 200,
    }),
    createSpawnPlanForRole(repair, {
      body: [
        { count: 3, body: WORK },
        { count: 6, body: CARRY },
        { count: 9, body: MOVE },
      ],
      limit: 1,
      generation: 30,
    }),
    createSpawnPlanForRole(builder, {
      body: [
        { count: 3, body: WORK },
        { count: 6, body: CARRY },
        { count: 9, body: MOVE },
      ],
      limit: 1,
      generation: 30,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 10, body: WORK },
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
      limit: 3,
      generation: 30,
    }),
    createSpawnPlanForRole(command, {
      body: [
        { count: 20, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: [
        {
          target: new RoomPosition(21, 19, "E1S36"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(20, 18, "E1S36"),
          handler: transfer,
        },
      ],
      limit: 0,
      generation: 30,
      targetRoom: "",
    }),
  ],
  E2S34: [
    createSpawnPlanForRole(refiller, {
      body: [
        { count: 12, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 1,
      generation: 40,
    }),
    createSpawnPlanForRole(carry, {
      body: [
        { count: 12, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 1,
      generation: 40,
    }),
    createSpawnPlanForRole(miner, {
      body: [
        { count: 5, body: WORK },
        { count: 1, body: MOVE },
      ],
      limit: 1,
      generation: 40,
      preSpawnTicks: 50,
    }),
    createSpawnPlanForRole(upgrader, {
      body: [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      limit: 1,
      generation: 40,
    }),
    createSpawnPlanForRole(repair, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 1,
      generation: 40,
    }),
    createSpawnPlanForRole(builder, {
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      limit: 0,
      generation: 40,
    }),
    createSpawnPlanForRole(command, {
      body: [
        { count: 6, body: CARRY },
        { count: 2, body: MOVE },
      ],
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
      limit: 0,
      generation: 41,
      targetRoom: "",
    }),
  ],
};
