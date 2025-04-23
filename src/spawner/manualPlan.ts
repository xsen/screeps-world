import { repair } from "../creeps/roles/repair.ts";
import { builder } from "../creeps/roles/builder.ts";
import { upgrader } from "../creeps/roles/upgrader.ts";
import { carry } from "../creeps/roles/carry.ts";
import { miner } from "../creeps/roles/miner.ts";
import { transfer } from "../creeps/commands/transfer.ts";
import { command } from "../creeps/roles/command.ts";
import { harvest } from "../creeps/commands/harvest.ts";

export const manualPlan = new Map<string, ManualSpawnPlan[]>([
  [
    "E1S37",
    [
      {
        handlerId: carry.id,
        body: [
          { count: 14, body: CARRY },
          { count: 7, body: MOVE },
        ],
        limit: 1,
        generation: 10,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        limit: 2,
        generation: 10,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 8, body: WORK },
          { count: 8, body: CARRY },
          { count: 8, body: MOVE },
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
          { count: 8, body: MOVE },
        ],
        limit: 0,
        generation: 10,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 1, body: CARRY },
          { count: 6, body: MOVE },
        ],
        limit: 0,
        targetRoom: "E2S37",
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
          { count: 3, body: CARRY },
          { count: 3, body: MOVE },
        ],
        generation: 21,
        limit: 1,
      },
      {
        handlerId: carry.id,
        body: [
          { count: 8, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 20,
        limit: 1,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        generation: 20,
        limit: 1,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 4, body: WORK },
          { count: 8, body: CARRY },
          { count: 2, body: MOVE },
        ],
        generation: 20,
        limit: 2,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        generation: 20,
        limit: 1,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        generation: 20,
        limit: 0,
      },
      {
        targetRoom: "",
        handlerId: command.id,
        body: [
          { count: 3, body: WORK },
          { count: 6, body: CARRY },
          { count: 9, body: MOVE },
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
          { count: 14, body: CARRY },
          { count: 7, body: MOVE },
        ],
        generation: 30,
        limit: 2,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 1, body: CARRY },
          { count: 1, body: MOVE },
        ],
        generation: 30,
        limit: 2,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 2, body: WORK },
          { count: 6, body: CARRY },
          { count: 8, body: MOVE },
        ],
        generation: 30,
        limit: 0,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 2, body: WORK },
          { count: 6, body: CARRY },
          { count: 8, body: MOVE },
        ],
        generation: 30,
        limit: 1,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 6, body: WORK },
          { count: 8, body: CARRY },
          { count: 7, body: MOVE },
        ],
        generation: 30,
        limit: 3,
      },
    ],
  ],
  [
    "E2S34",
    [
      {
        handlerId: carry.id,
        body: [
          { count: 4, body: CARRY },
          { count: 2, body: MOVE },
        ],
        generation: 40,
        limit: 1,
      },
      {
        handlerId: miner.id,
        body: [
          { count: 5, body: WORK },
          { count: 0, body: CARRY },
          { count: 1, body: MOVE },
        ],
        generation: 40,
        limit: 1,
      },
      {
        handlerId: carry.id,
        body: [
          { count: 6, body: CARRY },
          { count: 3, body: MOVE },
        ],
        generation: 41,
        limit: 0,
      },
      {
        handlerId: upgrader.id,
        body: [
          { count: 3, body: WORK },
          { count: 5, body: CARRY },
          { count: 4, body: MOVE },
        ],
        generation: 40,
        limit: 2,
      },
      {
        handlerId: repair.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 6, body: MOVE },
        ],
        generation: 40,
        limit: 0,
      },
      {
        handlerId: builder.id,
        body: [
          { count: 2, body: WORK },
          { count: 4, body: CARRY },
          { count: 3, body: MOVE },
        ],
        generation: 40,
        limit: 1,
      },
      // {
      //   handlerId: command.id,
      //   body: [
      //     { count: 4, body: CARRY },
      //     { count: 4, body: MOVE },
      //   ],
      //   limit: 1,
      //   generation: 40,
      //   targetRoom: "",
      //   commands: [
      //     {
      //       target: new RoomPosition(14, 20, "E2S35"),
      //       handler: withdraw,
      //     },
      //     {
      //       target: new RoomPosition(30, 30, "E2S34"),
      //       handler: transfer,
      //     },
      //   ],
      // },
    ],
  ],
]);
