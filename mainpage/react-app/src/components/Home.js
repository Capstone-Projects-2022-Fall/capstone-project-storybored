import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'

const Home = () => {
    

    const [ user, setUser ] = useState("")
    const [ error, setError ] = useState("")
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setUser(event.target.value)
    }

    const validateForm = (input) => {
        let removeWhite = input.replace(/\s/g, "")
        if (removeWhite.length===0){
            setError("PLEASE ENTER A USERNAME")
            return false
        }
        else{
            setError("")
            return true
        }
        
    }

    const navToCreateRoom = () => {
        if(validateForm(user)){
            navigate('/CreateRoom', {state: {user: user}})
        }        
    }

    return (
    <div className='Home'>
        <h1>StoryBored</h1>
        <form>
            <label for='username-input' id='username-label'>Username:</label> 
            <input 
                type='text' 
                id='username-input' 
                value={user}
                onChange={handleInputChange}/>
        </form>
        <p>{error}</p>
        <button id='create-room-button' onClick={navToCreateRoom}>Create Room</button>
    </div>
    )
}

export default Home