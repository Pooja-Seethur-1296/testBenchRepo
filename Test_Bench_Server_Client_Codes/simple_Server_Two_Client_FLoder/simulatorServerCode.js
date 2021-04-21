/*****************************************************************************************************************************
*
*     Name:                    Simulator Web Socket Server
*     Version:                 1.0
*     Description:             This is the javascript file having source code for simple Web Socket server. 
*							   The Web Socket Server communicates with the Client and handles the client accordingly.
*							   It performs the following actions.
*                               -> Create HTTP Server
*                               -> Bind & Listen To Port
*                               -> Upgrade to WS Server
*                               -> Accept the Clients
*                               -> Send <---> Receive 
*****************************************************************************************************************************/

/****************************************** Node modules needed*******************************************/

var httpServerInstance = require('http'); 
var wsServerInstance = require('websocket').server;
const fs = require('fs');

/***************************************** Global Variables*********************************************/

var iPort = 2950;
var connections = {};
var connectionClientArray = new Array();
var connectionIdCounter = 0;
var assignCidCounter = 2;

/*******************************************************************************************************
*	 Create a HTTP Server instance
********************************************************************************************************
*
*    Description : This creates a HTTP Server using the http module where the callback function is sent 
*				   as the parameter. On a regular HTTP request then callback function is called to reject 
*				   as a 'BAD REQUEST' and ends the connection
*    Argument   :  Anonymous Callback Function with request and response as its parameter 
*********************************************************************************************************/

var  newHTTPServer = httpServerInstance.createServer(function (request, response){
         console.log((new Date()) + 'Recieved request for' + request.url);
         response.writeHead(404);
         response.end();
     });


/**********************************************************************************************************
*	 BIND & LISTEN To Port 
***********************************************************************************************************
*
*    Description : Using the instance of the HTTP Server, bind the server to the dedicated free port 
*				   and start listening
*
***********************************************************************************************************/

newHTTPServer.listen(iPort, function(){
     console.log((new Date()) + 'Server is listening on port ' + iPort);
});

/********************************************************************************************************** 
* 	 Upgrade to Web Socket Server 
***********************************************************************************************************
*
*    Description : Here we specify the HTTP Server Instance to upgrade to WS Server
*
**********************************************************************************************************/

var webSocketServer = new wsServerInstance({httpServer : newHTTPServer});

/**********************************************************************************************************  
* 	 Server ON  and Accepting The Clients 
***********************************************************************************************************
*
*	 Description : Event handler for the server which is successfully bound to a port and is listening for
*	    		   incoming requests. 
*
**********************************************************************************************************/

webSocketServer.on('request', function(request){
	/*if(!originIsAllowed(request.origin)){
		//Reject those whose origin is Suspicious 
		return;
	}*/

	var connection =  request.accept(null, request.origin)

	/* Store a Reference to a connection using incremental counter*/
	connection.id = connectionIdCounter++;                         
	/* Store the Connections in Local Array */
	connections[connection.id] = connection;                     
	/* Now it is possible to access each connection  with a connectionId */

	console.log((new Date()) + 'Connection ID' + connection.id +'accepted');

	oHandleIncomingMessage(connection.id);
});


/**********************************************************************************************************
*
*    Function    : oHandleIncomingMessage
*
*    Description : This function is called when a new connection from a client is accepted by the server.
*     			   If a valid connection exists, then the message type is checked. Text and Media messages
*				   both can be handled accordingly.
*
*    Parameters : connectionID - This Contains the connection id of the client
*
***********************************************************************************************************/

function oHandleIncomingMessage(connectionID){

	var connection = connections[connectionID];
	if (connection && connection.connected){
		 connection.on('message', function(message){
				 if(message.type === 'utf8'){
					 console.log('Recieved message:' + message.utf8Data);
					 oHandleTextMessage(connectionID, message.utf8Data);
				 }

		 });
	} else {
		console.log("Connection corrupted!");
	}
}

/***********************************************************************************************************
*
*    Function     : oHandleTextMessage
*
*    Description  : This function is called to process the text messages. Based on the protocol values, the 
*				    respective Action is performed.
*
*    Parameters   : connectionID 	- This Contains the connection id of the client ,
*                   inMessage 		- This contains the message received from the client which has  both the  
*									  request action and the message in JSON format which is parsed
*
************************************************************************************************************/

function oHandleTextMessage(inConnectionID, inMessage){

	if(!(oUtilityCheckConnection(inConnectionID))){
		return;
	}
	console.log("Incoming message from client : " + inMessage);
	var incomingMessage = inMessage;
	var incomingActionMessage = JSON.parse(inMessage);

	var inAction =  null;
	var inUserId = null;
	var inClientId = null;
	
	inAction = incomingActionMessage.action;
	inClientId = incomingActionMessage.clientId;
	inUserId = incomingActionMessage.userId;


	/*********************For 2 way communication retrieving and swap connection ID *********************
	
		console.log('The incoming connection ID is: ' + inConnectionID);
		if(inConnectionID === 1){
			var sendToOtherClient = 0;
		}
	
		else if(inConnectionID === 0){
			var sendToOtherClient = 1;
        }
        
    /*********************For 2 way communication retrieving and swap connection ID *********************/

    /*if(incomingActionMessage.action === 'SWMS_RESTART'){
            var JSONMessage = {
                resp:"RA000"
            }
            oSendAckBackToClient(sendToOtherClient, JSONMessage);	
	}*/
	
	console.log(inClientId);

	connectionClientArray[inClientId] = inConnectionID;         //Update the client Id if existing connection is refreshed
	var updatedArray = getDistinctArray(connectionClientArray);
	console.log(updatedArray);
	

	if(inClientId != '1A'){

		var latestNonUserClientId = inClientId;
		console.log(latestNonUserClientId);
			
			fs.writeFile('latestClientId.json', '', function(){console.log('Previous contents of report file erased')});
		
				fs.appendFile("latestClientId.json", latestNonUserClientId ,function(err){
					if(err) throw err;
					console.log('Report is written to the file')
					});

			sendingClientId = connectionClientArray['1A'];
			console.log('sending Cid: '+sendingClientId);
	
	}

	else if(inClientId === '1A'){
		
		var latestNonUserClientId = fs.readFileSync('latestClientId.json', 'utf8');
		 sendingClientId= connectionClientArray[latestNonUserClientId];
		console.log('sending Cid: '+sendingClientId);

	}

	if(inAction === '000'){
		var responseJSONMessage = assignUniqueClientId(inUserId,inConnectionID);
		oSendAckBackToClient(inConnectionID, JSON.stringify(responseJSONMessage));
	}
	

    else {
		oSendAckBackToClient(sendingClientId, inMessage);
    }

	/*switch(inAction){
	case '000' :  	/* Handle simple communication handshake*
					//oSendAckBackToClient(inConnectionID, incomingMessage);
					var responseJSONMessage = assignUniqueClientId(inUserId,inConnectionID);
					oSendAckBackToClient(inConnectionID, responseJSONMessage);
				break;
	
	default : oSendAckBackToClient(sendingClientId, inMessage);
				break;
	}*/
}


/***********************************************************************************************************
*
*    Function     : oSendAckBackToClient
*
*    Description  : This function is called to send acknowledgment to the client that has requested it.
*
*    Parameters   : connectionID - This Contains the connection id of the client ,
*                   inAction - This contains the Action to send to the client,
*                   inData - This contains the message to be echoed back to the client by the server
*
************************************************************************************************************/


function oSendAckBackToClient(inConnectionID, incomingMessage){

	if(!(oUtilityCheckConnection(inConnectionID))){
	 return;
	}
    var responseJSONMessage = incomingMessage;
	oSendToConnection(inConnectionID, responseJSONMessage);
}

/*************************************************************************************************************
*
*    Function     : oSendToConnection
*
*    Description  : This function is called to send the message to the client that has a valid connection.
*
*    Parameters   : inConnectionID - This Contains the connection id of the client ,
*                   inResponseJSONMessage - Incoming JSON message
*
*************************************************************************************************************/

function oSendToConnection(inConnectionID, inResponseJSONMessage){

	if(!(oUtilityCheckConnection(inConnectionID))){
		return;
	}

	var connection = connections[inConnectionID];
	console.log('Sending message');
	connection.send(inResponseJSONMessage);
}

/************************************************************************************************************
*
*    Function     : oUtilityCheckConnection
*
*    Description  : This function is called to check if the client is still connected to the server or not
*
*    Parameters   : inConnectionID - This Contains the connection id of the client ,
*
*    Returns 	  : This returns true if connection still exists between connectionID and server,
*                   This returns false if connection does not exist between connectionID and server,
*
************************************************************************************************************/

function oUtilityCheckConnection(connectionID){

	var connection = connections[connectionID];

	if(!(connection && connection.connected)){
		 console.log('Error with Connection!!');
		 return false;
	}
	return true;
}

/************************************************************************************************************
*
*    Function     : assignUniqueClientId
*
*    Description  : This function is called to assign unique client Id to the newly connected clients
*
*    Parameters   : inConnectionID, inUserId
*
*    Returns 	  : Json message containing cilent Id
*
************************************************************************************************************/

function assignUniqueClientId(inUserId, inConnectionID){
	
	//var clienteeId =  Math.random().toString(36).substring(2, 15);
	console.log("got request for generation of client ID");
	
	if(inUserId === 'Local test server'){
		var clientIdentifier = '1A';
		connectionClientArray[clientIdentifier] = inConnectionID;              //Store client Id based on connection ID
	}
	else {
		var updatedclientId = assignCidCounter++;
		var newGeneratedclientId = updatedclientId + 'A';
		var clientIdentifier = newGeneratedclientId;
		connectionClientArray[clientIdentifier] = inConnectionID;
		//var clientIdentifier = '93jsna345esaw2345kcm12we349saw2349bs'; 
	}
	console.log(connectionClientArray);
	var JSONMessage = {
				resp : '000',
				clientId : clientIdentifier
				
	}
	console.log('Sending' + JSONMessage);
	return JSONMessage;
}

function getDistinctArray(connectionClientArray) {
	return [...new Set(connectionClientArray)];
}