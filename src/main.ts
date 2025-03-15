import { defense } from "./modules/defense.ts";
import "./extensions/creepExtensions.ts";
import { spawner } from "./modules/spawner.ts";
import { planner } from "./modules/planner.ts";

export const loop = () => {
  spawner.create();
  defense.create();
  planner.create();

  Object.values(Game.rooms).forEach((room) => {
    const data = {
      room: room,
      creeps: room.find(FIND_MY_CREEPS),
    };

    defense.execute(data);
    spawner.execute(data);
    planner.execute(data);
  });
};
