
import axios from 'axios'

// const API_URL = "34.148.104.177:4000"
const API_URL = "localhost:4000"


const createRoom = () => {
    return axios.get(`http://${API_URL}/api/roomID`)
        .then(response => {
           
            return response.data.roomID
        })
}



const exportObj = { createRoom }
export default exportObj

