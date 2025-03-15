import { melee } from "./roles/melee.ts";
import { builder } from "./roles/builder.ts";
import { upgrader } from "./roles/upgrader.ts";
import { repair } from "./roles/repair.ts";
import { miner } from "./roles/miner.ts";
import { carry } from "./roles/carry.ts";
import { command } from "./roles/command.ts";

export const roles: { [id: string]: CreepRoleHandler } = {
  [melee.id]: melee,
  [builder.id]: builder,
  [upgrader.id]: upgrader,
  [repair.id]: repair,
  [miner.id]: miner,
  [carry.id]: carry,
  [command.id]: command,
};
