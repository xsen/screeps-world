import { command } from "../creeps/roles/CommandRole.ts";
import {
  sendFromStorageToTerminal,
  sendFromTerminalToStorage,
} from "./spawnPlanUtils.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";

export const spawnPlan: SpawnPlansByRoom = {
  E1S36: [
    {
      handlerName: command.name,
      body: [
        { count: 10, body: CARRY },
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
  E1S37: [
    {
      handlerName: command.name,
      body: [
        { count: 10, body: CARRY },
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
        { count: 8, body: CARRY },
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
  E2S35: [
    {
      handlerName: upgrader.name,
      body: [
        { count: 10, body: WORK },
        { count: 10, body: CARRY },
        { count: 10, body: MOVE },
      ],
      limit: (room) => (room.controller?.level! < 8 ? 2 : 0),
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
  ],
  E3S35: [
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
};
