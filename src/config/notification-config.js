
function init(io){
  io.on("connection", function (socket) {
    console.log("Made socket connection");
  
    socket.on("disconnect", function () {
      console.log("Made socket disconnected");
    });
  });
}

module.exports = {
  init
}