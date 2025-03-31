import { ManualSpawnPlanner } from "../spawner/ManualSpawnPlanner.ts";
import { AutoSpawnPlanner } from "../spawner/AutoSpawnPlanner.ts";

export const spawner: RoomModule = {
  create: function () {
    return this;
  },
  execute: function (room) {
    const planner =
      room.name === "sim"
        ? new AutoSpawnPlanner(room)
        : new ManualSpawnPlanner(room);
    planner.spawn();
  },
};
