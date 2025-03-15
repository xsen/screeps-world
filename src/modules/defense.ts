export const defense: BaseModule = {
  create: function () {
    return this;
  },
  execute: (data: ModuleData) => {
    const towers = data.room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER,
    });

    towers.forEach((tower) => {
      const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile != null) {
        tower.attack(closestHostile);
      }
    });
  },
};
