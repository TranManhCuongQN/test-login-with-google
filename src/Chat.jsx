import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";

const profile = JSON.parse(localStorage.getItem("profile"));

const usernames = [
  {
    name: "Pame Pame 1",
    value: "user65c0bbd5da0742a7dad804e1",
  },
  {
    name: "Pame Pame 2",
    value: "user65c0b8adda0742a7dad804dd",
  },
];

export default function Chat() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState("");

  const getProfile = (username) => {
    axios
      .get(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
      })
      .then((res) => {
        setReceiver(res.data.result._id);
        alert(`Now you can chat with ${res.data.result.name}`);
      });
  };

  useEffect(() => {
    // const socket = io(import.meta.env.VITE_API_URL);
    // socket.on("connect", () => {
    //   console.log(socket.id);
    //   socket.emit("hello", "Tôi là Hello world!");
    //   socket.on("hi", (data) => {
    //     console.log(data);
    //   });
    // });
    // socket.on("disconnect", () => {
    //   console.log(socket.id); // undefined
    // });

    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("receive private message", (data) => {
      const content = data.content;
      setMessages((messages) => [
        ...messages,
        {
          content,
          isSender: false,
        },
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (e) => {
    e.preventDefault();
    setValue("");
    socket.emit("private message", {
      content: value,
      to: receiver, // user_id của client 2
    });

    setMessages((messages) => [
      ...messages,
      {
        content: value,
        isSender: true,
      },
    ]);
  };

  console.log(messages);

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>
              {username.name}
            </button>
          </div>
        ))}
      </div>
      <div className="chat">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="message-container">
              <div
                className={
                  "message " + (message.isSender ? "message-right" : "")
                }
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
