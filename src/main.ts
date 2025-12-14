import "./extensions/Creep.ts";

import profiler from "screeps-profiler";
import { defenseModule } from "./modules/DefenseModule.ts";
import { executorModule } from "./modules/ExecutorModule.ts";
import { spawnerModule } from "./modules/SpawnerModule.ts";
import { statsModule } from "./modules/StatsModule.ts";
import { flagsModule } from "./modules/FlagsModule.ts";
import { linkModule } from "./modules/LinkModule.ts";

profiler.enable();

export const loop = () =>
  profiler.wrap(() => {
    statsModule.start();

    if (Game.time % 100 === 0 && Game.cpu.bucket === 10000) {
      console.log("generate pixel");
      Game.cpu.generatePixel();
    }

    defenseModule.create();
    spawnerModule.create();
    linkModule.create();

    executorModule.create().execute();

    const rooms = Game.rooms;
    for (const roomName in rooms) {
      const room = rooms[roomName];
      if (room.controller?.my == false) continue;

      statsModule.execute(room);
      defenseModule.execute(room);
      spawnerModule.execute(room);
      linkModule.execute(room);
    }

    flagsModule.create().execute();
    statsModule.finish();
  });
