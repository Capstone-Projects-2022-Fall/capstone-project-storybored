import React from "react";
import io from "socket.io-client";

const SocketContext = React.createContext();

const SocketProvider = ({ children }) => {
  const ENDPOINT = "https://localhost/";
  const socket = io(ENDPOINT, { transports: ["polling", "websocket"] });
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export { SocketContext, SocketProvider };
