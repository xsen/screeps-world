export const utils = {
  log: function (message?: any, ...optionalParams: any[]) {
    if (message !== Memory.logs?.lastError) {
      Memory.logs = Memory.logs || { lastError: null, data: [] };
      Memory.logs.lastError = message;
      console.log(message, ...optionalParams);
    }
  },
  objectToString: function (obj: any, indentLevel: number = 0): string {
    const indent = "  ".repeat(indentLevel); // Два пробела на каждый уровень вложенности

    if (obj === null) {
      return "null";
    }
    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        const items = obj.map((item) =>
          this.objectToString(item, indentLevel + 1),
        );
        return "[" + items.join(", ") + "]";
      } else {
        const keys = Object.keys(obj);
        const pairs = keys.map(
          (key) =>
            indent +
            "  " +
            key +
            ": " +
            this.objectToString(obj[key], indentLevel + 1),
        );
        return "{\n" + pairs.join(",\n") + "\n" + indent + "}";
      }
    }
    return String(obj);
  },
};
