export const flags: GlobalModule = {
  create: function () {
    return this;
  },

  execute: function () {
    Memory.avoidPositions = {};

    const flags = Game.flags;
    for (const flagName in flags) {
      const flag = flags[flagName];
      if (flag.color == COLOR_BROWN && flag.room?.name) {
        if (!Memory.avoidPositions[flag.room.name]) {
          Memory.avoidPositions[flag.room.name] = [];
        }

        Memory.avoidPositions[flag.room.name].push(flag.pos);
      }
    }
  },
};
