import "./extensions/Creep.ts";

import { defense } from "./modules/defense.ts";
import { executor } from "./modules/executor.ts";
import { flags } from "./modules/flags.ts";
import { spawner } from "./modules/spawner.ts";
import profiler from "screeps-profiler";
import { stats } from "./modules/stats.ts";

profiler.enable();

export const loop = () =>
  profiler.wrap(() => {
    stats.start();

    defense.create();
    spawner.create();

    executor.create().execute();

    const rooms = Game.rooms;
    for (const roomName in rooms) {
      const room = rooms[roomName];
      if (room.controller?.my == false) continue;

      stats.execute(room);
      defense.execute(room);
      spawner.execute(room);
    }

    flags.create().execute();
    stats.finish();
  });
