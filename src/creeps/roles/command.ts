import { commands } from "../commands.ts";
import profiler from "screeps-profiler";

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

    const handler = commands[creepMemoryCommands.handler.id];
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

profiler.registerObject(command, "Creep.Role.Command");
