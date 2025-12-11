import { commands } from "../commands";
import profiler from "screeps-profiler";

class CommandRole implements CreepRoleHandler {
  public name = "command";

  public run(creep: Creep): void {
    if (!creep.memory.commands || creep.memory.commands.length === 0) {
      return;
    }
    if (creep.memory.commandId === undefined) {
      creep.memory.commandId = 0;
    }

    const commandIndex: number = creep.memory.commandId;
    const creepMemoryCommand = creep.memory.commands[commandIndex];

    if (!creepMemoryCommand || !creepMemoryCommand.target) {
      console.log(
        `[${creep.name}] Error: Command with id ${commandIndex} has no valid target.`,
      );
      return;
    }

    const handler = commands[creepMemoryCommand.handler.id];
    const position = new RoomPosition(
      creepMemoryCommand.target.x,
      creepMemoryCommand.target.y,
      creepMemoryCommand.target.roomName,
    );

    if (creep.room.name !== position.roomName) {
      creep.customMoveTo(position);
      return;
    }

    if (handler.run(creep, position)) {
      creep.memory.commandId =
        (commandIndex + 1) % creep.memory.commands.length;
    }
  }
}

export const command = new CommandRole();
profiler.registerObject(command, "Creep.Role.Command");
