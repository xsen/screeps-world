import { spawner } from "./modules/spawner.ts";
import { planner } from "./modules/planner.ts";
import { defense } from "./modules/defense.ts";

import "./extensions/creepExtensions.ts";

export const loop = () => {
  //error handling?
  spawner.create();
  defense.create();
  planner.create();

  Object.values(Game.rooms).forEach((room) => {
    const data = {
      room: room,
      creeps: room.find(FIND_MY_CREEPS),
      //get other objects?
    };

    defense.execute(data);
    spawner.execute(data);
    planner.execute(data);
  });
};
