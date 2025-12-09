import { SpawnManager } from "../managers/SpawnManager.ts";

class SpawnerModule implements RoomModule {
  private static instance: SpawnerModule;

  create(): RoomModule {
    if (!SpawnerModule.instance) {
      SpawnerModule.instance = new SpawnerModule();
    }
    return SpawnerModule.instance;
  }

  execute(room: Room): void {
    const spawnManager = new SpawnManager(room);
    spawnManager.run();
  }
}

export const spawnerModule = new SpawnerModule();
