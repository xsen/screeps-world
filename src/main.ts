import "./extensions/Creep.ts";

import profiler from "screeps-profiler";
import { defenseModule } from "./modules/DefenseModule.ts";
import { executorModule } from "./modules/ExecutorModule.ts";
import { spawnerModule } from "./modules/SpawnerModule.ts";
import { statsModule } from "./modules/StatsModule.ts";
import { flagsModule } from "./modules/FlagsModule.ts";

profiler.enable();

export const loop = () =>
  profiler.wrap(() => {
    statsModule.start();

    defenseModule.create();
    spawnerModule.create();

    executorModule.create().execute();

    const rooms = Game.rooms;
    for (const roomName in rooms) {
      const room = rooms[roomName];
      if (room.controller?.my == false) continue;

      statsModule.execute(room);
      defenseModule.execute(room);
      spawnerModule.execute(room);
    }

    flagsModule.create().execute();
    statsModule.finish();
  });
