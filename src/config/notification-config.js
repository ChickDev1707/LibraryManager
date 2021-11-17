
function init(io){
  io.on("connection", function (socket) {
    console.log("Made socket connection");
  
    socket.on("disconnect", function () {
      console.log("Made socket disconnected");
    });
  
    // socket.on("send-notification", async function (data) {
    //   let notification = JSON.parse(data)
    //   io.emit("new-notification", notification);
    // });
  
  });
}

module.exports = {
  init
}