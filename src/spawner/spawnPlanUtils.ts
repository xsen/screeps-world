interface CreateSpawnPlanOptions {
  body: SpawnCreepBody[];
  limit: number;
  generation: number;
  target?: string;
  targetRoom?: string;
  commands?: CreepCommand[];
  isEmergency?: boolean;
  minBody?: SpawnCreepBody[];
  priority?: number;
  preSpawnTicks?: number;
}

export function createSpawnPlanForRole(
  roleHandler: CreepRoleHandler,
  options: CreateSpawnPlanOptions,
): SpawnPlan {
  return {
    handlerName: roleHandler.name,
    body: options.body,
    limit: options.limit,
    generation: options.generation,
    target: options.target,
    targetRoom: options.targetRoom,
    commands: options.commands,
    isEmergency: options.isEmergency || roleHandler.defaultIsEmergency,
    minBody: options.minBody || roleHandler.defaultMinBody,
    priority:
      options.priority !== undefined && options.priority !== null
        ? options.priority
        : roleHandler.defaultPriority !== undefined &&
            roleHandler.defaultPriority !== null
          ? roleHandler.defaultPriority
          : 0,
    preSpawnTicks: options.preSpawnTicks || roleHandler.defaultPreSpawnTicks,
  };
}
