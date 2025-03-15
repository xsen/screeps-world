import { withdraw } from "../commands/withdraw.ts";
import { transfer } from "../commands/transfer.ts";

export const command: CreepRoleHandler = {
  id: 8,
  name: "command",

  run: function (creep: Creep) {
    if (
      creep.memory.commands == undefined ||
      creep.memory.commands.length == 0
    ) {
      return;
    }
    if (creep.memory.commandId == undefined) {
      creep.memory.commandId = 0;
    }

    const creepMemoryCommands = creep.memory.commands[creep.memory.commandId];
    if (
      creepMemoryCommands == undefined ||
      creepMemoryCommands.target == undefined
    ) {
      return;
    }

    const allCommands: { [id: string]: CreepCommandHandler } = {
      [withdraw.id]: withdraw,
      [transfer.id]: transfer,
    };

    const handler = allCommands[creepMemoryCommands.handler.id];
    const position = new RoomPosition(
      creepMemoryCommands.target.x,
      creepMemoryCommands.target.y,
      creepMemoryCommands.target.roomName,
    );

    if (handler.run(creep, position)) {
      creep.memory.commandId =
        (creep.memory.commandId + 1) % creep.memory.commands.length;
    }
  },
};
