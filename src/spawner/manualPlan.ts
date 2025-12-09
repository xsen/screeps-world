import { withdraw } from "../creeps/commands/withdraw.ts";
import { transfer } from "../creeps/commands/transfer.ts";
import { carry } from "../creeps/roles/CarryRole.ts";
import { miner } from "../creeps/roles/MinerRole.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";
import { builder } from "../creeps/roles/BuilderRole.ts";
import { command } from "../creeps/roles/CommandRole.ts";
import { repair } from "../creeps/roles/RepairRole.ts";

export const manualPlan: ManualSpawnPlansByRoom = {
  "E1S37": [
    {
      handlerName: carry.name,
      body: [
        { count: 14, body: CARRY },
        { count: 7, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    },
    {
      handlerName: miner.name,
      body: [
        { count: 5, body: WORK },
        { count: 1, body: CARRY },
        { count: 1, body: MOVE },
      ],
      limit: 2,
      generation: 10,
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    },
    {
      handlerName: builder.name,
      body: [
        { count: 3, body: WORK },
        { count: 5, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    },
    {
      handlerName: command.name,
      body: [
        { count: 8, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 0,
      commands: [
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(14, 6, "E1S36"),
          handler: transfer,
        },
      ],
      targetRoom: "",
      generation: 11,
    },
    {
      handlerName: command.name,
      body: [
        { count: 8, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 0,
      commands: [
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(17, 40, "E1S36"),
          handler: transfer,
        },
      ],
      targetRoom: "",
      generation: 12,
    },
    {
      handlerName: builder.name,
      body: [
        { count: 6, body: WORK },
        { count: 6, body: CARRY },
        { count: 12, body: MOVE },
      ],
      limit: 1,
      targetRoom: "E1S36",
      generation: 12,
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 6, body: WORK },
        { count: 6, body: CARRY },
        { count: 12, body: MOVE },
      ],
      limit: 4,
      targetRoom: "E1S36",
      generation: 12,
    },
    {
      handlerName: miner.name,
      body: [
        { count: 5, body: WORK },
        { count: 5, body: MOVE },
      ],
      limit: 0,
      targetRoom: "E1S36",
      generation: 12,
    },
  ],
  "E1S36": [
    {
      handlerName: carry.name,
      body: [
        { count: 3, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    },
    {
      handlerName: miner.name,
      body: [
        { count: 5, body: WORK },
        { count: 1, body: MOVE },
      ],
      generation: 30,
      limit: 2,
    },
    {
      handlerName: repair.name,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    },
    {
      handlerName: builder.name,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 3, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 30,
      limit: 1,
    },
  ],
  "E2S34": [
    {
      handlerName: carry.name,
      body: [
        { count: 4, body: CARRY },
        { count: 2, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    },
    {
      handlerName: miner.name,
      body: [
        { count: 5, body: WORK },
        { count: 0, body: CARRY },
        { count: 1, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    },
    {
      handlerName: carry.name,
      body: [
        { count: 6, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 41,
      limit: 0,
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 1, body: WORK },
        { count: 2, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    },
    {
      handlerName: repair.name,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 6, body: MOVE },
      ],
      generation: 40,
      limit: 1,
    },
    {
      handlerName: builder.name,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 40,
      limit: 2,
    },
  ],
};
