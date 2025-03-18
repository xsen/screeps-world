import { harvest } from "./commands/harvest.ts";
import { transfer } from "./commands/transfer.ts";
import { withdraw } from "./commands/withdraw.ts";
import { idle } from "./commands/idle.ts";
import { upgrade } from "./commands/upgrade.ts";

export const commands: { [id: string]: CreepCommandHandler } = {
  [harvest.id]: harvest,
  [transfer.id]: transfer,
  [withdraw.id]: withdraw,
  [idle.id]: idle,
  [upgrade.id]: upgrade,
};
