import { io } from "socket.io-client";

// khi khởi tạo 1 socket bằng cái io này thì nó sẽ tiến hành connect đến server của chúng ta
// khi mình gọi socket này mặc định nó sẽ gửi 1 request yêu cầu kết nối đến server socket
// khi nó khởi tạo 1 socket thì nó đã có Authorization rồi
const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

export default socket;
