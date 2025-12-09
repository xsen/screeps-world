class FlagsModule implements GlobalModule {
  private static instance: FlagsModule;

  create(): GlobalModule {
    if (!FlagsModule.instance) {
      FlagsModule.instance = new FlagsModule();
    }
    return FlagsModule.instance;
  }

  execute(): void {
    if (Game.time % 99 === 0) {
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
    }
  }
}

export const flagsModule = new FlagsModule();
