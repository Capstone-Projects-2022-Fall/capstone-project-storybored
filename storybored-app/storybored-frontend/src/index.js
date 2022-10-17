import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios'


// const address = '10.142.0.2'
// const address = "34.148.104.177"
const address = "localhost"

const root = ReactDOM.createRoot(document.getElementById('root'));

async function getToken() {
  let data = {
    username: "user" + parseInt(Math.random() * 100000),
  }

  axios.post(`http://${address}:7007/access`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      connect(response.data.token, data.username)
    })
}

async function connect(token, username) {
  var context = {
    username: username,
    roomID: '5gsw5',
    token: token,
    peers: {},
    channels: {},
  }

  console.log(window.location.hostname)

  context.eventSource = new EventSource(`http://${address}:7007/connect?token=${token}`);

  context.eventSource.addEventListener("connected", (user) => {
    context.user = user;
    join(token, context.roomID)
  });

  root.render(
    <React.StrictMode>
      <App context={context} url={address} />
    </React.StrictMode>
  );
}

async function join(token, roomID) {
  return axios.post(`http://${address}:7007/${roomID}/join`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  })
}


getToken();


reportWebVitals();

