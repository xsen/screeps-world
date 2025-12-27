import { withdraw } from "../creeps/commands/withdraw.ts";
import { transfer } from "../creeps/commands/transfer.ts";
import { command } from "../creeps/roles/CommandRole.ts";
import { upgrader } from "../creeps/roles/UpgraderRole.ts";

export const spawnPlan: SpawnPlansByRoom = {
  E1S37: [
    // storage to terminal
    {
      handlerName: command.name,
      body: [
        { count: 8, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: (room) => {
        return [
          {
            target: room.storage!.pos,
            handler: withdraw,
          },
          {
            target: room.terminal!.pos,
            handler: transfer,
          },
        ];
      },
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
        { count: 10, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: (room) => {
        return [
          {
            target: room.terminal!.pos,
            handler: withdraw,
          },
          {
            target: room.storage!.pos,
            handler: transfer,
          },
        ];
      },
      limit: (room) => {
        return room.terminal!.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          ? 1
          : 0;
      },
      generation: 1,
    },
    {
      handlerName: upgrader.name,
      body: [
        { count: 16, body: MOVE },
        { count: 24, body: CARRY },
        { count: 10, body: WORK },
      ],
      limit: 1,
      generation: 2,
    },
  ],
  E2S34: [
    {
      handlerName: upgrader.name,
      body: [
        { count: 25, body: MOVE },
        { count: 15, body: CARRY },
        { count: 10, body: WORK },
      ],
      limit: 2,
      generation: 2,
      targetRoom: "E2S35",
    },
    // Terminal to Storage
    {
      handlerName: command.name,
      body: [
        { count: 6, body: CARRY },
        { count: 2, body: MOVE },
      ],
      commands: [
        {
          target: new RoomPosition(27, 31, "E2S34"),
          handler: withdraw,
        },
        {
          target: new RoomPosition(30, 30, "E2S34"),
          handler: transfer,
        },
      ],
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
