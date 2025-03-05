export const Utils = {

  updateSafeMode: (room: Room) => {
    if (room.controller?.safeMode != undefined && room.controller.safeMode < 5) {
      room.controller.activateSafeMode()
    }
  }
}
