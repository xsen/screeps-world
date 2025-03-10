import { miner } from "./handlers/miner.ts";
import { carry } from "./handlers/carry.ts";
import { builder } from "./handlers/builder.ts";
import { upgrader } from "./handlers/upgrader.ts";
import { repair } from "./handlers/repair.ts";

export const permanentCreeps: { [name: string]: PermanentCreeps[] } = {
  E1S37: [
    {
      handler: carry,
      body: [
        { count: 12, body: CARRY },
        { count: 8, body: MOVE },
      ],
      limit: 1,
      generation: 5,
    },
    {
      handler: miner,
      body: [
        { count: 4, body: WORK },
        { count: 3, body: CARRY },
        { count: 1, body: MOVE },
      ],
      limit: 4,
      generation: 5,
    },
    {
      handler: upgrader,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      limit: 3,
      generation: 3,
    },
    {
      handler: repair,
      body: [
        { count: 3, body: WORK },
        { count: 5, body: CARRY },
        { count: 4, body: MOVE },
      ],
      limit: 1,
      generation: 2,
    },
    {
      handler: builder,
      body: [
        { count: 4, body: WORK },
        { count: 4, body: CARRY },
        { count: 4, body: MOVE },
      ],
      generation: 4,
      limit: 0,
    },

    {
      handler: upgrader,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 10,
      limit: 1,
      room: "E2S37",
    },
    {
      handler: builder,
      body: [
        { count: 2, body: WORK },
        { count: 4, body: CARRY },
        { count: 3, body: MOVE },
      ],
      generation: 10,
      limit: 1,
      room: "E2S37",
    },
  ],
};
