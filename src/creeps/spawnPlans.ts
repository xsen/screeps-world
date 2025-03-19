import { repair } from "./roles/repair.ts";
import { builder } from "./roles/builder.ts";
import { upgrader } from "./roles/upgrader.ts";
import { carry } from "./roles/carry.ts";
import { miner } from "./roles/miner.ts";
import { withdraw } from "./commands/withdraw.ts";
import { transfer } from "./commands/transfer.ts";
import { command } from "./roles/command.ts";
import { harvest } from "./commands/harvest.ts";

export const spawnPlans = new Map<string, RoomSpawnPlan[]>([
  [
    "E1S37",
    [
      {
        handlerId: carry.id,
        body: [
          { count: 2, body: MOVE },
          { count: 4, body: CARRY },
        ],
        limit: 1,
        generation: 10,
      },
      {
        handlerId: carry.id,
        body: [
          { count: 14, body: CARRY },
          { count: 7, body: MOVE },
        ],
        limit: 1,
        generation: 11,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 3, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        limit: 4,
        generation: 10,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 10, body: WORK },
          { count: 6, body: CARRY },
          { count: 4, body: MOVE },
        ],
        limit: 2,
        generation: 10,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 3, body: WORK },
          { count: 5, body: CARRY },
          { count: 8, body: MOVE },
        ],
        limit: 1,
        generation: 10,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 3, body: WORK },
          { count: 5, body: CARRY },
          { count: 4, body: MOVE },
        ],
        limit: 0,
        generation: 10,
      },
      {
        targetRoom: "",
        handlerId: command.id,
        body: [
          { count: 8, body: CARRY },
          { count: 8, body: MOVE },
        ],
        limit: 1,
        generation: 10,

        commands: [
          {
            target: new RoomPosition(17, 40, "E1S36"),
            handler: withdraw,
          },
          {
            target: new RoomPosition(43, 20, "E1S37"),
            handler: transfer,
          },
        ],
      },
      {
        targetRoom: "E1S36",
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 1, body: CARRY },
          { count: 3, body: MOVE },
        ],
        limit: 2,
        generation: 11,
      },
      {
        targetRoom: "E1S36",
        handlerId: builder.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        limit: 0,
        generation: 11,
      },
      {
        targetRoom: "E1S36",
        handlerId: upgrader.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        limit: 2,
        generation: 11,
      },
    ],
  ],
  [
    "E2S37",
    [
      {
        handlerId: carry.id,
        body: [
          { count: 4, body: CARRY },
          { count: 2, body: MOVE },
        ],
        generation: 20,
        limit: 1,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 3, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        generation: 20,
        limit: 2,
      },
      {
        handlerId: carry.id,
        body: [
          { count: 8, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 21,
        limit: 1,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 4, body: WORK },
          { count: 4, body: CARRY },
          { count: 2, body: MOVE },
        ],
        generation: 20,
        limit: 3,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 3, body: MOVE },
        ],
        generation: 20,
        limit: 0,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        generation: 20,
        limit: 1,
      },
      {
        targetRoom: "",
        handlerId: command.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        limit: 2,
        generation: 20,
        commands: [
          {
            target: new RoomPosition(15, 24, "E2S36"),
            handler: harvest,
          },
          {
            target: new RoomPosition(31, 16, "E2S37"),
            handler: transfer,
          },
        ],
      },
    ],
  ],
  [
    "E1S36",
    [
      {
        handlerId: carry.id,
        body: [
          { count: 3, body: CARRY },
          { count: 3, body: MOVE },
        ],
        generation: 30,
        limit: 1,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 1, body: WORK },
          { count: 3, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 30,
        limit: 1,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 1, body: WORK },
          { count: 3, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 30,
        limit: 0,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 4, body: WORK },
          { count: 2, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 30,
        limit: 4,
      },
    ],
  ],
  [
    "sim",
    [
      {
        handlerId: command.id,
        body: [
          { count: 1, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        limit: 1,
        generation: 1,
        commands: [
          {
            target: new RoomPosition(25, 25, "sim"),
            handler: withdraw,
          },
          {
            target: new RoomPosition(25, 25, "sim"),
            handler: transfer,
          },
        ],
      },
    ],
  ],
]);
