const { application } = require("express");
const { cloneElement } = require("react");

var context  = {
	username: 'user' + parseInt(Math.random()*100000),
	roomID: window.location.pathname.substr(1),
	token: null,
	eventSource: null,
	peers: {},
	channels: {}
};

const rtcConfig = {
	iceServers: [{
		urls: [
			'stun:stun.l.google.com:19302',
            'stun:global.stun.twilio.com:3478'
		]
	}]
};

async function getToken(){
	let res = await fetch('/access', {
		method: 'POST',
		headers:  {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: context.username
		})
	});
	let data = await res.json();
	context.token = data.token;
}

async function join(){
	return fetch(`${context.roomID}/join`, {
		method: POST,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${context.token}`
		}
	});
}

async function connect() {
	await getToken();
	context.eventSource.addEventListener('add-peer', addPeer, false);
	context.eventSource.addEventListener('remove-peer', removePeer, false);
	context.eventSource.addEventListener('session-description', sesssionDescription, false);
	context.eventSource.addEventListener('ice-candidate', iceCandidate, false);
	context.eventSource.addEventListener('connected', (user) => {
		context.user = user;
		join();
	});
}

function addPeer(data) {
	let message = JSON.parse(data.data);
	if(context.peers[message.peer.id]){
		return;
	}

	let peer = new RTCPeerConnection(rtcConfig);

	peer.onicecandidate = function (event) {
		if(event.candidate) {
			relay(message.peer.id, event.data)
		}
	};

	if(message.offer) {
		let channel = peer.createDataChannel('updates');
		channel.onmessage = function (event) {
			onPeerData(message.peer.id, event.data)
		};
		context.channels[message.peer.id] = channel;
		createOffer(message.peer.id, peer);
	}else{
		peer.ondatachannel =  function (event) {
			context.channels[message.peer.id] = event.channel;
			event.channel.onmessage =  function (evn) {
				onPeerData(message.peer.id, evt.data);
			};
		};
	}
}

async function createOffer(peerID, peer) {
	let offer = await peer.createOffer();
	await peer.setLocalDescription(offer);
	await relay(peerID, 'session-description', offer);
}

function relay(peerID, event, data){
	fetch(`/relay/${peerID}/${event}`, {
		method: POST,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${context.token}`
		},
		body: JSON.stringify(data)
	});
}

function peerDataUpdate(peerID, data){
	onPeerData(peerID, data.data);
}

function broadcast(data) {
	for( let peerID in context.channels) {
		if( context.channels[peerID].readyState === 'open'){
			context.channels[peerID].send(data);
		}
	}
}

function removePeer(data){
	let message = JSON.parse(data.data);
	if(context.peers[message.user.id]){
		context.peers[message.peer.id].close();
	}

	delete context.peers[message.peer.id];
}

async function sesssionDescription(data) {
	let message = JSON.parse(data.data);
	let peer = context.peers[message.peer.id];

	let remoteDescription =  new RTCSessionDescription(message.data);
	await peer.setRemoteDescription(remoteDescription);
	if(remoteDescription.type === 'offer'){
		let answer = await peer.createAnswer();
		await peer.setLocalDescription(answer);
		await relay(message.peer.id, 'session-description', answer);
	}
}

function iceCandidate(data){
	let message = JSON.parse(data.data);
	let peer = context.peers[message.peer.id];
	peer.addIceCandidate(new RTCIceCandidate(message.data));
}

connect();