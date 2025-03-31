import { harvest } from "./commands/harvest.ts";
import { transfer } from "./commands/transfer.ts";
import { withdraw } from "./commands/withdraw.ts";
import { idle } from "./commands/idle.ts";
import { upgrade } from "./commands/upgrade.ts";
import { move } from "./commands/move.ts";
import { dismantle } from "./commands/dismantle.ts";
import { attack } from "./commands/attack.ts";
import { claim } from "./commands/claim.ts";

export const commands: { [id: string]: CreepCommandHandler } = {
  [harvest.id]: harvest,
  [transfer.id]: transfer,
  [withdraw.id]: withdraw,
  [idle.id]: idle,
  [upgrade.id]: upgrade,
  [move.id]: move,
  [dismantle.id]: dismantle,
  [attack.id]: attack,
  [claim.id]: claim,
};
