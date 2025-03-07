import { spawner } from "./modules/spawner.ts";
import { planner } from "./modules/planner.ts";
import { defense } from "./modules/defense.ts";

export const loop = () => {
  //@todo: error handling
  spawner.create();
  defense.create();
  planner.create();

  Object.values(Game.rooms).forEach((room) => {
    const data = {
      room: room,
      creeps: room.find(FIND_MY_CREEPS),
      //get other objects
    };

    spawner.execute(data);
    defense.execute(data);
    planner.execute(data);
  });
};
