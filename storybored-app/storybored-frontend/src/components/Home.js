import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'

const Home = ( {callback} ) => {

    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("")
    const navToCreateRoom = () => {
        navigate('/CreateRoom')
    }

    const submit = () => {
        callback(inputValue)
        navToCreateRoom()
    }

    return (
    <div className='Home'>
        <h1>StoryBored</h1>
        
        <form>
            <label htmlFor='username-input' id='username-label'>Username:</label> 
            <input type='text' id='username-input' onChange={(e) => setInputValue(e.target.value)}></input>
        </form>
        <button id='create-room-button' onClick={submit}>Create Room</button>
    </div>
    )
}

export default Home