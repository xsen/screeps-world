export const harvester:any =  {
  /** @param {Creep} creep **/

  run: function (creep: Creep) {
    console.log('running harvester func')

    const sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }
};
