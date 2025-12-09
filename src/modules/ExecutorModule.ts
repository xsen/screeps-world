import { roles } from "../creeps/roles.ts";
import { command } from "../creeps/roles/CommandRole.ts";

class ExecutorModule implements GlobalModule {
  private static instance: ExecutorModule;

  create(): GlobalModule {
    if (!ExecutorModule.instance) {
      ExecutorModule.instance = new ExecutorModule();
    }
    return ExecutorModule.instance;
  }

  execute(): void {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];

      if (creep.spawning) {
        continue;
      }

      if (
        creep.memory.role !== command.name &&
        creep.room.name !== creep.memory.room
      ) {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room), {
          visualizePathStyle: { stroke: "#ffffff" },
        });
        continue;
      }

      const handler = roles.get(creep.memory.role);
      if (handler) {
        handler.run(creep);
      } else {
        console.log(`Error: no handler for role ${creep.memory.role}`);
      }
    }
  }
}

export const executorModule = new ExecutorModule();
