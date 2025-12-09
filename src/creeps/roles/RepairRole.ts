import { SimpleWorkRole } from "./SimpleWorkRole";
import profiler from "screeps-profiler";
import { WorkManager } from "../../managers/WorkManager.ts";

class RepairRole extends SimpleWorkRole {
  public name = "repair";

  /**
   * Выполняет работу ремонтника: чинит структуры.
   * @param creep Крип-ремонтник.
   */
  protected doWork(creep: Creep): void {
    WorkManager.repair(creep);
  }
}

export const repair = new RepairRole();
profiler.registerObject(repair, "Creep.Role.Repair");
