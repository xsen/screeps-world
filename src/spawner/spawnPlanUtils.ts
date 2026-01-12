import { transfer } from "../creeps/commands/transfer.ts";
import { withdraw } from "../creeps/commands/withdraw.ts";

export function sendFromTerminalToStorage(room: Room) {
  if (!room.storage || !room.terminal) return [];

  return [
    {
      target: room.terminal.pos,
      handler: withdraw,
    },
    {
      target: room.storage.pos,
      handler: transfer,
    },
  ];
}

export function sendFromStorageToTerminal(room: Room) {
  if (!room.storage || !room.terminal) return [];

  return [
    {
      target: room.storage.pos,
      handler: withdraw,
    },
    {
      target: room.terminal.pos,
      handler: transfer,
    },
  ];
}
