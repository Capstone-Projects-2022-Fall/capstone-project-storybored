import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import roomService from "../services/fetchRoomID.js"

const CreateRoom = () => {
    console.log(window.location.href)

    const { state } = useLocation();
    const { user } = state;

    const [priv, setPriv] = useState(false)
    const [size, setSize] = useState()
    const [error, setError] = useState("")
    const [roomID, setRoomID] = useState("")

    const hooks = () => {
        roomService
            .createRoom()
            .then(roomID => {
                setRoomID(roomID)
            })
    }
    useEffect(hooks, [])

    const validateForm = (input) => {
        if (/[a-zA-Z]/g.test(input)) {
            setError("PLEASE ENTER VALID NUMBERS")
            return false
        }
        else if (input.length === 0) {
            setError("PLEASE ENTER NUMBERS")
            return false
        }
        else {
            setError("")
            return true
        }
    }

    const handleCheckChange = (event) => {
        setPriv(event.target.checked)
    }
    const handleInputChange = (event) => {
        setSize(event.target.value)
    }
    const redirectTo = () => {
        if (validateForm(size)) {
            window.location.href = `http://34.148.43.56:3000/${roomID}`;
            console.log("valid size, continue")
        }
    }

    return (
        <div className='CreateRoom'>
            <h1>Create Room for {user}</h1>

            <div id='options'>
                <form>
                    <label for='private-input' id='private-label'>Make Private</label>
                    <input onChange={handleCheckChange} type='checkbox' id='private-input' />
                </form>
                <form>
                    <label for='canvas-size-input' id='canvas-size-label'>Canvas Size</label>
                    <input onChange={handleInputChange} value={size} type='text' id='canvas-size-input' />

                </form>
                <p>{error}</p>
            </div>
            <button id='start-button' onClick={redirectTo}>Start!</button>
        </div>
    )
}

export default CreateRoom