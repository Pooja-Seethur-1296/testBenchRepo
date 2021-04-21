/*********************************************************************************************************************
*
*     Name:                    Web Socket Client
*     Version:                 1.0
*     Description:             This is the javascript file having source code for a simple WebSocket Client. 
*							   This establishes a wensocket communication between client and Server. 
*							   The Web Socket client communicates with the Server and handles the client accordingly.
*
**********************************************************************************************************************/

var webSocketConnection;
//var webSocketServerAddress = "ws://49.206.21.20:41000";
//var webSocketServerAddress = "ws://localhost:3200";
//var webSocketServerAddress = "ws://194.59.165.40:2630";
var webSocketServerAddress = "ws://192.168.1.118:2900";

function oConnectToWSServer(){
	
	webSocketConnection = new WebSocket(webSocketServerAddress);

	webSocketConnection.onopen = function(err){
	
		if(webSocketConnection.readyState === WebSocket.OPEN){
			document.getElementById("connectionStatus").innerHTML = "Connected ! !"
			
		} else{
			alert('ERROR UNABLE TO CONNECT TO SERVER');
		}
	};

	webSocketConnection.onmessage = function(message){
	 
		if(typeof message.data === 'string'){
			var incomingMessage = message.data;
			//var incomingMessage = JSON.parse(message.data);
			alert(incomingMessage); 
			oHandleIncomingServerMessage(incomingMessage);
		} else{
			 /*FOR FUTURE USE BINARY DATA*/
		}
	}
}

function oHandleIncomingServerMessage(inMessage){
	var incomingMessage = inMessage;

	if((incomingMessage.Action === null) || (incomingMessage.Data === null)){
		alert('Data Corrupted');
	}

	switch(incomingMessage.Action){
	case '1000' :
				 document.getElementById("MessageAcknowledgement").innerHTML = "Message Sent"
				 break;
	 default :
				 break;
	}
}

function oSendMessageToServer()
{
     var messageToServer = $('#uConnect_MSG_val').val();
     var JSONMessage = messageToServer;//{
                         //"Action" : "1234",
                         //"Data" : 
						 //messageToServer
                      //};
     console.log(JSONMessage);

    // oSendRequestToServer(JSON.stringify(messageToServer));
	//oSendRequestToServer((messageToServer));
	//oSendRequestToServer(JSON.stringify(JSONMessage));
	oSendRequestToServer(JSONMessage);
}


function oSendRequestToServer(inMessageToServer){
     console.log(inMessageToServer);
     if(webSocketConnection.readyState != WebSocket.OPEN){
                 alert('ERROR : UNABLE TO CONNECT TO SERVER')
                 return ;
             }

     webSocketConnection.send(inMessageToServer);
}



