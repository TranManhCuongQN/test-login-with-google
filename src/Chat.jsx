import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

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

const LIMIT = 10;
const PAGE = 1;

export default function Chat() {
  const [value, setValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });

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

    socket.on("receive_message", (data) => {
      const { payload } = data;
      console.log("data", payload);
      setConversations((conversations) => [...conversations, payload]);
    });

    socket.on("connect_error", (err) => {
      console.log(err.data);
    });

    socket.on("disconnect", (reason) => {
      console.log(reason);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  console.log("conversations", conversations);

  useEffect(() => {
    // when user click to chat with someone to watch messages
    if (receiver) {
      axios
        .get(`/conversations/receivers/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            limit: LIMIT,
            page: PAGE,
          },
        })
        .then((res) => {
          const { conversations, page, total_page } = res.data.result;
          setConversations(conversations);
          setPagination({
            page,
            total_page,
          });
        });
    }
  }, [receiver]);

  const fetchMoreConversations = () => {
    console.log(pagination);
    if (receiver && pagination.page < pagination.total_page) {
      axios
        .get(`/conversations/receivers/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            limit: LIMIT,
            page: pagination.page + 1,
          },
        })
        .then((res) => {
          const { conversations, page, total_page } = res.data.result;
          setConversations((prev) => [...prev, ...conversations]);
          setPagination({
            page,
            total_page,
          });
        });
    }
  };

  const send = (e) => {
    e.preventDefault();
    setValue("");

    const conversation = {
      content: value,
      sender_id: profile._id,
      receiver_id: receiver,
    };

    socket.emit("send_message", {
      payload: conversation,
    });

    setConversations((conversations) => [
      {
        ...conversation,
        _id: new Date().getTime(), // id temporary to display message, no match id on mongodb
      },
      ...conversations,
    ]);
  };

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
      <div
        id="scrollableDiv"
        style={{
          height: 300,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreConversations}
          style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={pagination.page < pagination.total_page}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {conversations.map((conversation) => (
            <div key={conversation._id}>
              <div className="message-container">
                <div
                  className={
                    "message " +
                    (conversation.sender_id === profile._id
                      ? "message-right"
                      : "")
                  }
                >
                  {conversation.content}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
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
