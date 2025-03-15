import { repair } from "./roles/repair.ts";
import { builder } from "./roles/builder.ts";
import { upgrader } from "./roles/upgrader.ts";
import { carry } from "./roles/carry.ts";
import { miner } from "./roles/miner.ts";
import { withdraw } from "./commands/withdraw.ts";
import { transfer } from "./commands/transfer.ts";
import { command } from "./roles/command.ts";
import { harvest } from "./commands/harvest.ts";

export const spawnPlans: { [name: string]: RoomSpawnPlan[] } = {
  E1S37: [
    {
      handler: carry,
      body: [
        { count: 4, body: CARRY },
        { count: 2, body: MOVE },
      ],
      limit: 1,
      generation: 1,
    },
    {
      handler: carry,
      body: [
        { count: 14, body: CARRY },
        { count: 7, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    },
    {
      handler: miner,
      body: [
        { count: 4, body: WORK },
        { count: 3, body: CARRY },
        { count: 1, body: MOVE },
      ],
      limit: 4,
      generation: 10,
    },
    {
      handler: upgrader,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      limit: 4,
      generation: 10,
    },
    {
      handler: repair,
      body: [
        { count: 3, body: WORK },
        { count: 5, body: CARRY },
        { count: 4, body: MOVE },
      ],
      limit: 1,
      generation: 10,
    },
    {
      handler: builder,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      generation: 10,
      limit: 0,
    },
    {
      handler: upgrader,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      generation: 11,
      limit: 1,
      targetRoom: "E2S37",
    },
    {
      handler: builder,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      generation: 11,
      limit: 1,
      targetRoom: "E2S37",
    },
    {
      targetRoom: "",
      handler: command,
      body: [
        { count: 2, body: CARRY },
        { count: 2, body: MOVE },
      ],
      limit: 0,
      generation: 1,
      commands: [
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(28, 24, "E2S37"),
          handler: transfer,
        },
      ],
    },
    {
      targetRoom: "",
      handler: command,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 2,
      generation: 2,
      commands: [
        {
          target: new RoomPosition(15, 38, "E1S36"),
          handler: harvest,
        },
        {
          target: new RoomPosition(43, 20, "E1S37"),
          handler: transfer,
        },
      ],
    },
  ],

  E2S37: [
    {
      handler: miner,
      body: [
        { count: 3, body: WORK },
        { count: 1, body: CARRY },
        { count: 1, body: MOVE },
      ],
      generation: 20,
      limit: 3,
    },
    {
      handler: carry,
      body: [
        { count: 4, body: CARRY },
        { count: 2, body: MOVE },
      ],
      generation: 19,
      limit: 1,
    },
    {
      handler: carry,
      body: [
        { count: 8, body: CARRY },
        { count: 4, body: MOVE },
      ],
      generation: 20,
      limit: 1,
    },
    {
      handler: upgrader,
      body: [
        { count: 3, body: WORK },
        { count: 4, body: CARRY },
        { count: 2, body: MOVE },
      ],
      generation: 20,
      limit: 1,
    },
    {
      handler: builder,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 20,
      limit: 0,
    },
    {
      handler: repair,
      body: [
        { count: 1, body: WORK },
        { count: 4, body: CARRY },
        { count: 5, body: MOVE },
      ],
      generation: 20,
      limit: 0,
    },
    {
      targetRoom: "",
      handler: command,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 2,
      generation: 3,
      commands: [
        {
          target: new RoomPosition(15, 24, "E2S36"),
          handler: harvest,
        },
        {
          target: new RoomPosition(28, 24, "E2S37"),
          handler: transfer,
        },
      ],
    },
  ],
  sim: [
    {
      handler: command,
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
};
