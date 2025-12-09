import { commands } from '../commands';
import profiler from 'screeps-profiler';

class CommandRole {
  public name = 'command';

  public run(creep: Creep): void {
    if (
      !creep.memory.commands ||
      creep.memory.commands.length === 0
    ) {
      return;
    }
    if (creep.memory.commandId === undefined) {
      creep.memory.commandId = 0;
    }

    const creepMemoryCommands = creep.memory.commands[creep.memory.commandId];
    if (
      !creepMemoryCommands ||
      !creepMemoryCommands.target
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
  }
}

export const command = new CommandRole();
profiler.registerObject(command, 'Creep.Role.Command');
