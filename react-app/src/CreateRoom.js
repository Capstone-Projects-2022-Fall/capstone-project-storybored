import React from 'react'

const CreateRoom = () => {
  return (
    <div className='CreateRoom'>
        <h1>Create Room</h1>
        
        <div id='options'>
            <form>
                <label for='private-input' id='private-label'>Make Private</label> 
                <input type='checkbox' id='private-input'></input>
            </form>
                {/*Here if Make Private is checked, a password <p></p> will need to be injected dynamically*/}
            
            <form>
                <label for='canvas-size-input' id='canvas-size-label'>Canvas Size</label>
                <input type='text' id='canvas-size-input'></input>
            </form>
        </div>
        <button id='start-button'>Start!</button>
    </div>
  )
}

export default CreateRoom