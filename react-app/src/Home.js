import React from 'react'
import {useNavigate} from 'react-router-dom'

const Home = () => {

    const navigate =useNavigate();

    const navToCreateRoom = () => {
        navigate('CreateRoom')
    }

    return (
    <div className='Home'>
        <h1>StoryBored</h1>
        
        <form>
            <label for='username-input' id='username-label'>Username:</label> 
            <input type='text' id='username-input'></input>
        </form>
        <button id='create-room-button' onClick={navToCreateRoom}>Create Room</button>
    </div>
    )
}

export default Home