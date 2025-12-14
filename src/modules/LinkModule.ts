import { LinkManager } from "../managers/LinkManager";
import profiler from "screeps-profiler";

class LinkModule implements RoomModule {
  private linkManager: LinkManager | undefined;

  public create(): RoomModule {
    return new LinkModule();
  }

  public execute(room: Room): void {
    this.linkManager = new LinkManager(room);
    this.linkManager.run();
  }
}

export const linkModule = new LinkModule();
profiler.registerObject(linkModule, "LinkModule");
