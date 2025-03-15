import { Color } from "../../enums.ts";

export const harvest: CreepCommandHandler = {
  id: "harvest",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.moveTo(position, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
      return false;
    }

    const target = creep.room.lookForAt(LOOK_SOURCES, position)[0];
    if (!target) {
      console.log("Error: position has no source");
      return true;
    }

    const res = creep.harvest(target);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
      return false;
    }

    return creep.store.getFreeCapacity() == 0;
  },
};
