import { Color } from "../../enums.ts";

export const withdraw: CreepCommandHandler = {
  id: "withdraw",
  run: function (creep, position) {
    if (creep.room.name != position.roomName) {
      creep.moveTo(position, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
      return false;
    }

    const target = creep.room
      .lookForAt(LOOK_STRUCTURES, position)
      .find((structure) => {
        return (
          structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_STORAGE
        );
      });

    if (!target) {
      console.log("Error: position has no container or storage");
      return true;
    }

    const res = creep.withdraw(target, RESOURCE_ENERGY);
    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
    }
    return res == OK;
  },
};
