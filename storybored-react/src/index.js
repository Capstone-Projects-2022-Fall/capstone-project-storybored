import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios'
import {onPeerData} from './App.js'



var context = {
  username: "user" + parseInt(Math.random() * 100000),
  // roomID: window.location.pathname.substr(1),
  roomID: '5gsw5',
  token: null,
  peers: {},
  channels: {},
}

const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
    },
  ],
};

async function getToken() {
  let data = {
    username: context.username,
  }

  axios.post('http://localhost:7007/access', data, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then(response => {
    context.token = response.data.token
    console.log(context.token)
    connect(response.data.token)
    
  })
}

async function connect(token) {
  // await getToken()
  // was missing this line - need to make EventSource to open persistent connection to server - SSE
  console.log(context.token)
  context.eventSource = new EventSource(`http://localhost:7007/connect?token=${token}`);

  context.eventSource.addEventListener("add-peer", addPeer, false);
  context.eventSource.addEventListener("remove-peer", removePeer, false);
  context.eventSource.addEventListener("session-description", sesssionDescription, false);
  context.eventSource.addEventListener("ice-candidate", iceCandidate, false);
  context.eventSource.addEventListener("connected", (user) => {
    console.log("CONNECTED")
    context.user = user;
    console.log("RESULT", join(token));
  });
}


// for now, room ID is static, assume that the createRoom function has returned a roomdID
async function join(token) {

  console.log("t", token)
  return axios.post(`http://localhost:7007/${context.roomID}/join`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  })
}

function addPeer(data) {
  let message = JSON.parse(data.data);
  if (context.peers[message.peer.id]) {
    return;
  }

  let peer = new RTCPeerConnection(rtcConfig);

  // was missing this line - need to add new peer to peers list
  context.peers[message.peer.id] = peer;

  peer.onicecandidate = function (event) {
    if (event.candidate) {
      // was missing second parameter 'ice-candidate' in relay function
      relay(message.peer.id, "ice-candidate", event.candidate);
    }
  };

  if (message.offer) {
    // create the data channel, map peer updates
    let channel = peer.createDataChannel("updates");
    channel.onmessage = function (event) {
      onPeerData(message.peer.id, event.data);
    };
    context.channels[message.peer.id] = channel;
    createOffer(message.peer.id, peer);
  } else {
    peer.ondatachannel = function (event) {
      context.channels[message.peer.id] = event.channel;
      event.channel.onmessage = function (evt) {
        onPeerData(message.peer.id, evt.data);
      };
    };
  }
}

async function createOffer(peerID, peer) {
  let offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await relay(peerID, "session-description", offer);
}

function relay(peerID, event, data) {
  console.log("relaying....", context.token)

  axios.post(`http://localhost:7007/relay/${peerID}/${event}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${context.token}`,
    }
  })
  
}

function peerDataUpdate(peerID, data) {
  onPeerData(peerID, data);
}

function removePeer(data) {
  let message = JSON.parse(data.data);
  // should've been peer.id not user.id 
  if (context.peers[message.peer.id]) {
    context.peers[message.peer.id].close();
  }
  delete context.peers[message.peer.id];
}

async function sesssionDescription(data) {
  let message = JSON.parse(data.data);
  let peer = context.peers[message.peer.id];

  let remoteDescription = new RTCSessionDescription(message.data);

  await peer.setRemoteDescription(remoteDescription);
  if (remoteDescription.type === "offer") {
    let answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await relay(message.peer.id, "session-description", answer);
  }
}

function iceCandidate(data) {
  let message = JSON.parse(data.data);
  let peer = context.peers[message.peer.id];
  peer.addIceCandidate(new RTCIceCandidate(message.data));
}

function broadcast(data) {
  console.log("BROADCASTING", data)
  for (let peerId in context.channels) {
      if (context.channels[peerId].readyState === 'open') {
          context.channels[peerId].send(data);
      }
  }
}


const root = ReactDOM.createRoot(document.getElementById('root'));
getToken();


root.render(
  <React.StrictMode>
    <App broadcast={broadcast}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
