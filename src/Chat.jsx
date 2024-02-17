import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on("connect", () => {
      console.log(socket.id);
      socket.emit("hello", "Tôi là Hello world!");
      socket.on("hi", (data) => {
        console.log(data);
      });
    });
    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return <div>Chat</div>;
}
