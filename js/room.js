
let chatSocket = null;
let chatLog = document.querySelector("#chatLog");
let chatMessageInput = document.querySelector("#chatMessageInput");
let chatMessageSend = document.querySelector("#chatMessageSend");
const userName = localStorage.getItem('user_name');
const userId = localStorage.getItem('user_id');
const roomName = sessionStorage.getItem('roomName');

window.onload = () => {
    console.log("Sanity check from room.js.");

    chatMessageInput.focus();

    chatMessageInput.onkeyup = function(e) {
        
        if (e.keyCode === 13) {  // enter key
            chatMessageSend.click();
        }
    };

    chatMessageSend.onclick = function() {
        
        if (chatMessageInput.value.length === 0) return;
        chatSocket.send(JSON.stringify({
            "message": chatMessageInput.value,
            'user': userName,
            'user_id': userId,
            'command': 'new_message'
        }));
        chatMessageInput.value = "";
    };

    connect();
}



function connect() {
    chatSocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/" + roomName + "/?token=" + localStorage.getItem("access") );
    
    chatSocket.onopen = function(e) {
        console.log("Successfully connected to the WebSocket.");
        chatSocket.send(JSON.stringify({'command': 'fetch_messages'}))
    }

    chatSocket.onclose = function(e) {
        console.error("WebSocket connection closed unexpectedly.");
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        if (data['command'] === 'messages') {
            for (let i = 0; i < data['messages'].length; i++) {
                createMessage(data['messages'][i]);
            }
        } else if (data['command'] === 'new_message') {
            createMessage(data['message']);
        }

        chatLog.scrollTop = chatLog.scrollHeight;
    };

    chatSocket.onerror = function(err) {
        console.log("WebSocket encountered an error: " + err.message);
        chatSocket.onclose()
    }
}

function createMessage(data) {
    const author = data['author'];
    chatLog.value += (author + ': ' + data.content + '\n');
}

function roomDelete(){
    const token = localStorage.getItem("access")
    const response = fetch('http://127.0.0.1:8000/chat/room/', {
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body:JSON.stringify({
            "room_id": roomName,
        }),
        method: 'DELETE',
    })
    .then(window.location.pathname = `chat/room_index.html`)
}


