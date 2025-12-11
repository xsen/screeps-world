export const transfer: CreepCommandHandler = {
  id: "transfer",
  run: function (creep, position) {
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      return true;
    }

    const target = creep.room
      .lookForAt(LOOK_STRUCTURES, position)
      .find((structure) => {
        return (
          structure.structureType == STRUCTURE_CONTAINER ||
          structure.structureType == STRUCTURE_TERMINAL ||
          structure.structureType == STRUCTURE_STORAGE
        );
      }) as
      | StructureStorage
      | StructureContainer
      | StructureTerminal
      | undefined;

    if (!target) {
      console.log(
        "Error: target not found for creep",
        creep.name,
        "position",
        position,
      );
    }

    if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      return false;
    }

    const res = creep.transfer(target, RESOURCE_ENERGY);
    if (res == ERR_NOT_IN_RANGE) {
      creep.customMoveTo(target);
    }

    return false;
  },
};
