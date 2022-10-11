
// import axios from 'axios'

var context = {
    username: "user" + parseInt(Math.random() * 100000),
    roomID: window.location.pathname.substr(1),
    token: null,
    eventSource: null,
    peers: {},
    channels: {},
};



async function getToken() {
    let res = await fetch("/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: context.username,
      }),
    });
    let data = await res.json();
    context.token = data.token;
}

async function join() {
    return fetch(`${context.roomID}/join`, {
      // POST wasn't in quotes
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${context.token}`,
      },
    });
  }
  
  
async function connect() {
    await getToken();
  
    // was missing this line - need to make EventSource to open persistent connection to server - SSE
    context.eventSource = new EventSource(`/connect?token=${context.token}`);
  
    // context.eventSource.addEventListener("add-peer", addPeer, false);
    // context.eventSource.addEventListener("remove-peer", removePeer, false);
    // context.eventSource.addEventListener("session-description", sesssionDescription, false);
    // context.eventSource.addEventListener("ice-candidate", iceCandidate, false);
    context.eventSource.addEventListener("connected", (user) => {
      context.user = user;
      join();
    });
  }