import React from "react";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const navigate = useNavigate();
  //   const [inputValue, setInputValue] = useState("");
  const navToCanvas = () => {
    navigate("/Canvas");
  };

  const submit = () => {
    navToCanvas();
  };
  return (
    <div className="CreateRoom">
      <h1>Join Room</h1>

      {/* <form>
        <label for="room-name-input" id="room-name-label">
          Room Name
        </label>
        <input type="text" id="room-name-input" onChange={(e) => (inputValue = setInputValue(e.target.value))}></input>
      </form> */}

      <button id="start-button" onClick={submit}>
        Start!
      </button>
    </div>
  );
};

export default CreateRoom;
