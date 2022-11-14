import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ callback }) => {
  const navigate = useNavigate();
  const [nameValue, setNameValue] = useState("player");
  const [roomValue, setRoomValue] = useState("room");
  const navToCreateRoom = () => {
    navigate("/CreateRoom");
  };

  const submit = () => {
    callback(nameValue, roomValue);
    navToCreateRoom();
  };

  return (
    <div className="Home">
      <h1>StoryBored</h1>
      Welcome to StoryBored, a collaborative drawing application that allows you to draw on multiple frames in real-time with friends anywhere on the
      planet
      <h2>Enter your name and click 'That's me!' to continue!</h2>
      <form>
        <label htmlFor="username-input" id="username-label">
          Username:
        </label>
        <input type="text" id="username-input" onChange={(e) => setNameValue(e.target.value)}></input>
        <label htmlFor="room-input" id="room-label">
          Room:
        </label>
        <input type="text" id="room-input" onChange={(e) => setRoomValue(e.target.value)}></input>
      </form>
      <button id="create-room-button" onClick={submit}>
        That's me!
      </button>
    </div>
  );
};

export default Home;
