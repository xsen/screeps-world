import { command } from "../creeps/roles/CommandRole.ts";
import {
  sendFromStorageToTerminal,
  sendFromTerminalToStorage,
} from "./spawnPlanUtils.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";
import { melee } from "../creeps/roles/MeleeRole.ts";
import { claim } from "../creeps/commands/claim.ts";
import { builder } from "../creeps/roles/BuilderRole.ts";
import { miner } from "../creeps/roles/MinerRole.ts";

export const spawnPlan: SpawnPlansByRoom = {
  E1S37: [
    {
      handlerName: command.name,
      body: [
        { count: 8, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: sendFromStorageToTerminal,
      limit: (room) => {
        return room.storage!.store.getFreeCapacity() < 500000 &&
          room.terminal!.store.getFreeCapacity() > 50000
          ? 1
          : 0;
      },
      generation: 1,
    },
  ],
  E1S36: [
    {
      handlerName: command.name,
      body: [
        { count: 8, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: sendFromStorageToTerminal,
      limit: (room) => {
        return room.storage!.store.getFreeCapacity() < 500000 &&
          room.terminal!.store.getFreeCapacity() > 50000
          ? 1
          : 0;
      },
      generation: 1,
    },
  ],
  E1S34: [
    {
      handlerName: upgrader.name,
      body: [
        { count: 10, body: WORK },
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
      commands: sendFromTerminalToStorage,
      limit: 2,
      generation: 1,
      targetRoom: "",
    },
    {
      handlerName: command.name,
      body: [
        { count: 10, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: sendFromTerminalToStorage,
      limit: (room) => {
        return room.terminal!.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          ? 1
          : 0;
      },
      generation: 1,
    },
  ],
  E2S34: [
    {
      handlerName: command.name,
      body: [
        { count: 10, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: sendFromTerminalToStorage,
      limit: (room) => {
        return room.terminal!.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          ? 1
          : 0;
      },
      generation: 1,
      targetRoom: "",
    },
  ],
  E2S35: [
    {
      handlerName: upgrader.name,
      body: [
        { count: 10, body: WORK },
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
      commands: sendFromTerminalToStorage,
      limit: 2,
      generation: 1,
      targetRoom: "",
    },
    {
      handlerName: command.name,
      body: [
        { count: 10, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: sendFromTerminalToStorage,
      limit: (room) => {
        return room.terminal!.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          ? 1
          : 0;
      },
      generation: 1,
      targetRoom: "",
    },
    {
      handlerName: melee.name,
      body: [
        { count: 5, body: TOUGH },
        { count: 10, body: MOVE },
        { count: 5, body: ATTACK },
      ],
      limit: 1,
      preSpawnTicks: 300,
      generation: 1,
      targetRoom: "E3S35",
    },
    {
      handlerName: command.name,
      body: [
        { count: 2, body: CLAIM },
        { count: 2, body: MOVE },
      ],
      commands: [
        {
          target: new RoomPosition(25, 25, "E3S35"),
          handler: claim,
        },
      ],
      limit: 0,
      preSpawnTicks: 300,
      generation: 2,
      targetRoom: "",
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 8, body: WORK },
        { count: 8, body: CARRY },
        { count: 16, body: MOVE },
      ],
      limit: 1,
      generation: 2,
      preSpawnTicks: 300,
      targetRoom: "E3S35",
    },
    {
      handlerName: miner.name,
      body: [
        { count: 5, body: WORK },
        { count: 1, body: CARRY },
        { count: 6, body: MOVE },
      ],
      limit: 1,
      generation: 2,
      targetRoom: "E3S35",
      preSpawnTicks: 300,
    },
    {
      handlerName: builder.name,
      body: [
        { count: 8, body: WORK },
        { count: 8, body: CARRY },
        { count: 16, body: MOVE },
      ],
      limit: 1,
      generation: 2,
      preSpawnTicks: 300,
      targetRoom: "E3S35",
    },
  ],
};
