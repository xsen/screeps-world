import { SimpleWorkRole } from "./SimpleWorkRole";
import profiler from "screeps-profiler";
import { WorkManager } from "../../managers/WorkManager.ts";

class BuilderRole extends SimpleWorkRole {
  public name = "builder";

  /**
   * Выполняет работу строителя: строит или ремонтирует.
   * @param creep Крип-строитель.
   */
  protected doWork(creep: Creep): void {
    const isBuilding = WorkManager.build(creep);

    if (!isBuilding) {
      WorkManager.repair(creep);
    }
  }
}

export const builder = new BuilderRole();
profiler.registerObject(builder, "Creep.Role.builder");
