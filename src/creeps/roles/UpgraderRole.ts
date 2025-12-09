import { SimpleWorkRole } from "./SimpleWorkRole";
import profiler from "screeps-profiler";
import { WorkManager } from "../../managers/WorkManager.ts";

class UpgraderRole extends SimpleWorkRole {
  public name = "upgrader";

  /**
   * Выполняет работу апгрейдера: улучшает контроллер комнаты.
   * @param creep Крип-апгрейдер.
   */
  protected doWork(creep: Creep): void {
    WorkManager.upgrade(creep);
  }
}

export const upgrader = new UpgraderRole();
profiler.registerObject(upgrader, "Creep.Role.Upgrader");
