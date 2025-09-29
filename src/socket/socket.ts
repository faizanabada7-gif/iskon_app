import { io as clientIO } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.44:5000"; // e.g., http://localhost:5000
const socket = clientIO(SOCKET_URL, {
  transports: ["websocket"], // force websocket
});

socket.on("connect", () => {
  console.log("🔥 Connected to socket server", socket.id);
});

export default socket;
