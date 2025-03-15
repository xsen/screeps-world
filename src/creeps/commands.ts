import { harvest } from "./commands/harvest.ts";
import { transfer } from "./commands/transfer.ts";
import { withdraw } from "./commands/withdraw.ts";

export const commands: { [id: string]: CreepCommandHandler } = {
  [harvest.id]: harvest,
  [transfer.id]: transfer,
  [withdraw.id]: withdraw,
};
