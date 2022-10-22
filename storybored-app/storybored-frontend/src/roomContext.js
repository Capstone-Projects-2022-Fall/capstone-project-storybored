import React, { useState } from "react";

const RoomContext = React.createContext();

const RoomProvider = ({ children }) => {
  const [nickname, setNickName] = useState("");
  const [room, setRoom] = useState("");
  return <RoomContext.Provider value={{ nickname, room, setNickName, setRoom }}>{children}</RoomContext.Provider>;
};

export { RoomContext, RoomProvider };
