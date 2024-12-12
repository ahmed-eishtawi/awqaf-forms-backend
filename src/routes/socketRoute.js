const useSocketIo = (io) => {
  let my_data = [];
  io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("receive_data", (data) => {
      console.log(data);
      my_data.push(data);
      io.emit("send_data", my_data);
    });
  });
};

export default useSocketIo;
