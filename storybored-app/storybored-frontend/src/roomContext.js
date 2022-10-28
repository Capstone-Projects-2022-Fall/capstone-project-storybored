import React, { useState } from "react";

const RoomContext = React.createContext();

const RoomProvider = ({ children }) => {
  const [nickname, setNickName] = useState("a");
  const [room, setRoom] = useState("a");
  return <RoomContext.Provider value={{ nickname, room, setNickName, setRoom }}>{children}</RoomContext.Provider>;
};

export { RoomContext, RoomProvider };
