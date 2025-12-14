import { melee } from "./roles/MeleeRole.ts";
import { builder } from "./roles/BuilderRole.ts";
import { upgrader } from "./roles/UpgraderRole.ts";
import { repair } from "./roles/RepairRole.ts";
import { miner } from "./roles/MinerRole.ts";
import { carry } from "./roles/CarryRole.ts";
import { command } from "./roles/CommandRole.ts";
import { refiller } from "./roles/RefillerRole.ts";

export const roles = new Map<string, CreepRoleHandler>([
  [melee.name, melee],
  [builder.name, builder],
  [upgrader.name, upgrader],
  [repair.name, repair],
  [miner.name, miner],
  [carry.name, carry],
  [command.name, command],
  [refiller.name, refiller],
]);
