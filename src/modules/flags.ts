export const flags: GlobalModule = {
  create: function () {
    return this;
  },

  execute: function () {
    Memory.avoidPositions = {};

    for (const flagName in Game.flags) {
      const flag = Game.flags[flagName];
      if (flag.color == COLOR_RED && flag.room?.name) {
        if (!Memory.avoidPositions[flag.room.name]) {
          Memory.avoidPositions[flag.room.name] = [];
        }

        Memory.avoidPositions[flag.room.name].push(flag.pos);
      }
    }
  },
};
