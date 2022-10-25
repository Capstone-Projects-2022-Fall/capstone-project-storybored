import React, { useState } from "react";

import Canvas from "./components/canvas/Canvas";
import Home from "./components/Home.js";
import CreateRoom from "./components/CreateRoom";
import { SocketProvider } from "./socketContext";
import { RoomProvider } from "./roomContext";
import { UsersProvider } from "./usersContext";


import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = ({ context, url }) => {
  // const { nickName, room, setNickName, setRoom } = useContext(RoomContext);
  // const socket = useContext(SocketContext);
  // const { users } = useContext(UsersContext);
  const [shapes, setShapes] = useState([]);

  return (
    <div className="App">
      <header className="App-header">
        <RoomProvider>
          <UsersProvider>
            {/* <SocketProvider> */}
            <Router>
              <Routes>
                <Route path="" element={<Home />} />
                <Route path="/CreateRoom" element={<CreateRoom />} />
                <Route path="/Canvas" element={<Canvas shapes={shapes} setShapes={setShapes} />} />
              </Routes>
            </Router>
            {/* </SocketProvider> */}
          </UsersProvider>
        </RoomProvider>
      </header>
    </div>
  );
};

export default App;

