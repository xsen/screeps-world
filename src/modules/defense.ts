export const defense: BaseModule = {
  config: {},
  create: function () {
    return this;
  },
  execute: (data: ModuleData) => {
    console.log(data);
  },
};
