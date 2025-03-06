import { utils } from "./utils";
import { spawner } from "./modules/spawner.ts";
import { planner } from "./modules/planner.ts";

const permanentSafeMode = true;

export const loop = () => {
  const currentRoom = Game.spawns["Spawn1"].room;

  if (permanentSafeMode) {
    utils.updateSafeMode(currentRoom);
  }

  //@todo: error handling
  spawner.create();
  planner.create();

  Object.values(Game.rooms).forEach((room) => {
    const data = {
      room: room,
      creeps: room.find(FIND_MY_CREEPS),
    };

    spawner.execute(data);
    planner.execute(data);
  });
};
