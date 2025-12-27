import { melee } from "./roles/MeleeRole.ts";
import { builder } from "./roles/BuilderRole.ts";
import { upgrader } from "./roles/UpgraderRole.ts";
import { repair } from "./roles/RepairRole.ts";
import { miner } from "./roles/MinerRole.ts";
import { carry } from "./roles/CarryRole.ts";
import { command } from "./roles/CommandRole.ts";
import { refiller } from "./roles/RefillerRole.ts";
import { hauler } from "./roles/HaulerRole.ts";
import { scavenger } from "./roles/ScavengerRole.ts";

export const roles = new Map<string, CreepRoleHandler>([
  [melee.name, melee],
  [builder.name, builder],
  [upgrader.name, upgrader],
  [repair.name, repair],
  [miner.name, miner],
  [carry.name, carry], // Legacy role
  [command.name, command],
  [refiller.name, refiller],
  [hauler.name, hauler], // New role
  [scavenger.name, scavenger], // New role
]);
