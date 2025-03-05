import {Utils} from "./utils";
import {harvester} from "./roles/harvester.ts";
import {builder} from "./roles/builder.ts";
import {upgrader} from "./roles/upgrader.ts";


const _ = require('lodash');
const permanentSafeMode = true;

export const loop = () => {
  console.log(`Current game tick is ${Game.time}`);

  _.forEach(Game.rooms, (room: Room) => {
    console.log(`Current room is ${room.name}`);

    if (permanentSafeMode) {
      Utils.updateSafeMode(room)
    }
  })


  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const creepLimits = [
    {role: 'harvester', body: [WORK, CARRY, MOVE], limit: 2},
    {role: 'upgrader', body: [WORK, CARRY, MOVE], limit: 1},
    {role: 'builder', body: [WORK, CARRY, MOVE], limit: 1}
  ];

  creepLimits.forEach(it => {
    const alives = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == it.role);

    if (alives.length < it.limit) {
      const newName = it.role + Game.time;

      Game.spawns['Spawn1'].spawnCreep(it.body, newName, {
        memory: {
          role: it.role,
        }
      });
    }
  })

  for (let name in Game.creeps) {
    const creep = Game.creeps[name];

    if (creep.memory.role == 'harvester') {
      harvester.run(creep);
    }

    if (creep.memory.role == 'builder') {
      builder.run(creep);
    }

    if (creep.memory.role == 'upgrader') {
      upgrader.run(creep);
    }
  }
};
