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

    const command = creep.memory.commands[creep.memory.commandId];
    if (command == undefined || command.target == undefined) {
      return;
    }

    if (command.handler.run(creep, command.target)) {
      creep.memory.commandId =
        (creep.memory.commandId + 1) % creep.memory.commands.length;
    }
  },
};
