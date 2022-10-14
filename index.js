import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios'


const root = ReactDOM.createRoot(document.getElementById('root'));

async function getToken() {
  let data = {
    username: "user" + parseInt(Math.random() * 100000),
  }

  axios.post('http://localhost:7007/access', data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}` 
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

  context.eventSource = new EventSource(`http://localhost:7007/connect?token=${token}`);

  context.eventSource.addEventListener("connected", (user) => {
    context.user = user;
    join(token, context.roomID, {user: {id: context.username}})
  });

  root.render(
    <React.StrictMode>
      <App context={context} />
    </React.StrictMode>
  );
}

async function join(token, roomID, user) {
  console.log(user);
  return axios.post(`http://localhost:7007/${roomID}/join`, user)
}


getToken();


reportWebVitals();