import { Color } from "../../enums.ts";

export const specialist: CreepRoleHandler = {
  id: 7,
  name: "specialist",

  run: function (creep: Creep) {
    if (creep.store.getUsedCapacity() == 0) {
      creep.setStatus("get");
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.setStatus("out");
    }

    if (creep.getStatus() == "get") {
      get(creep);
    }
    if (creep.getStatus() == "out") {
      out(creep);
    }
  },
};

const get = function (creep: Creep) {
  const sourceId = "5bbcad019099fc012e63673b";
  const source = Game.getObjectById<Source>(sourceId as Id<Source>);
  if (!source) {
    creep.moveTo(new RoomPosition(25, 25, "E1S36"), {});
    return;
  }

  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(source, {
      visualizePathStyle: { stroke: Color.GRAY },
    });
  }
};

const out = function (creep: Creep) {
  const storageId = "67ca8da69af1de180e6ac0b2";
  const storage = Game.getObjectById<StructureStorage>(
    storageId as Id<StructureStorage>,
  );
  if (storage) {
    const res = creep.transfer(storage, RESOURCE_ENERGY);
    if (res == OK) {
      const value = Memory.log[creep.name] ? Memory.log[creep.name] : 0;
      Memory.log[creep.name] = value + creep.store.getCapacity();
    }

    if (res == ERR_NOT_IN_RANGE) {
      creep.moveTo(storage, {
        visualizePathStyle: { stroke: Color.GRAY },
      });
    }
  }
};
