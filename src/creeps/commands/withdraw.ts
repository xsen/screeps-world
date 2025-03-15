export const withdraw: CreepCommandHandler = {
  id: "withdraw",
  run: function (creep, position) {
    console.log(creep.name, position.roomName, "withdraw");
    return false;

    // const target = position.lookFor(LOOK_STRUCTURES).find((structure) => {
    //   return (
    //     structure.structureType == STRUCTURE_CONTAINER ||
    //     structure.structureType == STRUCTURE_STORAGE
    //   );
    // });
    //
    // if (!target) {
    //   console.log("Error: position has no container or storage");
    //   return true;
    // }
    //
    // const res = creep.withdraw(target, RESOURCE_ENERGY);
    // if (res == ERR_NOT_IN_RANGE) {
    //   creep.moveTo(target, {
    //     visualizePathStyle: { stroke: Color.GRAY },
    //   });
    // }
    // return res == OK;
  },
};
