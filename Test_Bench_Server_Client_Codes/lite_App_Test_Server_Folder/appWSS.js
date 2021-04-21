/*****************************************************************************************************************************
*
*     Name:                    App Testbench Web Socket Server
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
const appFunctionsObj = require('./appFunctionalities');
var nodemailer = require('nodemailer');

/***************************************** Global Variables*********************************************/

var iPort = 65000;
var connections = {};
var connectionIdCounter = 0;
var actionCounter = null;
var actionArray = {};
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
//set NODE_TLS_REJECT_UNAUTHORIZED = 0;
 
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
	
	var incomingMessage = JSON.parse(inMessage);
	var inAction =  null;
	var inStatus =  null;
	var inMode =  null;
	var inClientID = null;
	
	inAction = incomingMessage.action;
	inStatus = incomingMessage.state;
	inMode = incomingMessage.mode;
	inClientID = incomingMessage.clientId;

	console.log("Action ID: " + inAction + ", State: " + inStatus+ ", Mode: " + inMode);

	if((inAction === null)||(inStatus === null)){
		console.log('Wrong Message from Client');
		return;
	}
	//var appInitCounter = null; 
	
	actionArray[inAction] = actionCounter++;
	console.log(actionArray);
	console.log(actionCounter);
	
	if(actionCounter === 1){
	fs.appendFile("automatedReport.json",'\n' + '----------------------------------------------------------------------------------------------'+'\n'+
	'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+"AUTOMATED TEST REPORT:"+ '\n' +
	'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+ "for Erigate lite app test run" +'\n'+
	'----------------------------------------------------------------------------------------------'+'\n'+
	'Date and Time of the test: ' + new Date()+'\n'+
	'----------------------------------------------------------------------------------------------'+'\n'+ 
	'User ID : xyz' + '\n'+'Description: Demo inhouse erigate lite app'+'\n'+
	'----------------------------------------------------------------------------------------------'+'\n',function(err){
		if(err) throw err;
		console.log('Initial lines written in the file');
		});
	}
	
	//if(actionCounter === 6){
	
	
	//}
	
	switch(inAction){
		
	case 'APP_INIT':console.log("Initial handshake Message received from the client");
	
					var statusCodes = appFunctionsObj.oActionCounterStatusCode(actionCounter);  //counters 1, 2 for 200; 3 for 404
					var incomingResponse = appFunctionsObj.oAssignClientId(statusCodes);
				    oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
				    var report = 'Assign client ID';
				    writeReportToFile(actionCounter,inAction,report,statusCodes);
				    break;
					
	case 'SWMS_INIT':console.log("Initial handshake Message received from the client");          //read activation key from different file and compare with entered key
					var statusCodes = appFunctionsObj.oActionCounterStatusCode(actionCounter);
					var incomingResponse = appFunctionsObj.oEnterActivationApp(statusCodes);		//counters 4 for 200; 6 for 404; 5 for 400
				    oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
				    var report = 'Enter Activation key';
				    writeReportToFile(actionCounter,inAction,report,statusCodes);
				    break;
				
	case 'GET_DEVICE_LIST': console.log("Request to get list of devices is received");
							var statusCodes = appFunctionsObj.oActionCounterStatusCode(actionCounter);
						    var incomingResponse = appFunctionsObj.oGetDeviceList(inClientID,statusCodes);
							oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
						    var report = 'Get device list';
							writeReportToFile(actionCounter,inAction,report,statusCodes);
							break;	
				
	case 'GET_DEVICE_INFO': console.log("Request to get Device Information is received");       //sendAutoGeneratedEmail();
							var incomingResponse = appFunctionsObj.oGetDeviceInfo();
							oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
							var report = 'Obtain Particular device Info';
							writeReportToFile(actionCounter,inAction,report,statusCodes);
							break;
							
	case 'GET_DEVICE_CURRENT_INFO': console.log("Request to get current device info received from the client");
									var incomingResponse = appFunctionsObj.oGetDeviceCurrentInfo();
									oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
									var report = 'Obtain Particular device current Info';
									writeReportToFile(actionCounter,inAction,report,statusCodes);
									break;
	
	case 'MODE_CHANGE_REQ': console.log("Request to get change mode received from the client");
							var incomingResponse = appFunctionsObj.oRequestToChangeMode(inMode);
							oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
							var report = 'Change mode';
							writeReportToFile(actionCounter,inAction,report,statusCodes);
							break;
									
	case 'SET_TIMER': console.log("Request to set timer received from the client");								
					  var incomingResponse = appFunctionsObj.oEnterActivationApp(inMode);
					  oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
					  var report = 'Change mode';
					  writeReportToFile(actionCounter,inAction,report,statusCodes);
				      break;
					  
	case 'REPORT': console.log("Request to send report received from the client");	
				   //oSendAckBackToClient(inConnectionID, inAction);
				   var report = 'Automatic report generated';
				   //writeReportToFile(actionCounter,inAction,report,statusCodes);
				   sendAutoGeneratedEmail();
				   break;
						
	case 'MOTOR_ON_OFF_REQ':console.log("Motor On Message received from the HTML erigate client");
	
				switch(inStatus){
                    case '1':
					
							console.log("Motor On Once");	
				            var incomingResponse = appFunctionsObj.oManualOnOff(inStatus);
								oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
								console.log("Acknowledgemt sent to client");
								var report = 'Motor On Once is tested';
								writeReportToFile(actionCounter,inAction,report,statusCodes);
					
                    break;
					
					case '0':
							console.log("Motor Off Once");
							var incomingResponse = appFunctionsObj.oManualOnOff(inStatus);
								oSendAckBackToClient(inConnectionID, inAction, incomingResponse);
								console.log("Acknowledgemt sent to client");
							var report = 'Manual Off is tested for Once';
								writeReportToFile(actionCounter,inAction,report,statusCodes);
                    default:
                                break;
                }
						
	default :
				break;
	}
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


function oSendAckBackToClient(inConnectionID, inAction, incomingResponse){

	if(!(oUtilityCheckConnection(inConnectionID))){
	 return;
	}

	if(inAction === null){
	 console.log('Message incorrect!');
	 return;
	}
	
	if(incomingResponse === null){
	 console.log('Response Corrupted!!');
	 return;
	}

	/* Create JSON string */
	var responseJSONMessage = incomingResponse;

	oSendToConnection(inConnectionID, JSON.stringify(responseJSONMessage));
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
*    Function     : readIterationNumber
*
*    Description  : This function takes json string read from a json file, as input parameter and parses 
*                   Json string, returns the Iteration number.
*
*    Parameters   : words - which contains json string
*
*    Returns 	  : inIterationNumber, which returns the number of iterations to be performed
*
*************************************************************************************************************/

function readIterationNumber(words){
							
	var incomingData = JSON.parse(words);
	var inAction =  null;
	var inIterationNumber =  null;
	
	inAction = incomingData.action;
	inIterationNumber = incomingData.iterationNumber;
	console.log("No of iterations to be performed: "+inIterationNumber);
	return inIterationNumber;
	
}

/************************************************************************************************************
*
*    Function     : sendAutoGeneratedEmail
*
*    Description  : This function sends an email report which conntains all the actions performed by the                
*					tester by reading config file and erases the contents of file once email is sent.
*   
*************************************************************************************************************/

function sendAutoGeneratedEmail(){
	
/*****Reads the data from report file where details of every action is written*****/
	
		var readData = fs.readFileSync('automatedReport.json','UTF-8',function(err, data) { 
		if (err) throw err;
		console.log(data);
		});
		console.log(readData);

/*****************Reads the mail addresses and subject from the file***************/
		
		var words = fs.readFileSync('appAddress.json', 'utf8');
		console.log(words);
		var parsedWords = JSON.parse(words);
		
		var fromMailAddress,toMailAddress,textSubject = null;
		
		fromMailAddress = parsedWords.fromAddress;
		toMailAddress = parsedWords.toAddress;
		textSubject = parsedWords.subjectText;
		
		console.log(toMailAddress);
		
		var transporter = nodemailer.createTransport({
			service: 'zoho',
			port: 587,
			auth: {
			user: 'pooja.sp@ortusolis.com',  
			pass: 'pSiauIFsTvjb'
            }
  
		});

		var mailOptions = {
			from: 'pooja.sp@ortusolis.com',                          //'pooja.sp@ortusolis.com',
			to: toMailAddress,                                       //'dinesh.s@ortusolis.com,jayasimha.hsd@ortusolis.com',
			subject: textSubject, 
			text: readData
		};
		

		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
			console.log(error);
			} else {
			console.log('Email sent: ' + info.response);
			}
		});
		
		fs.writeFile('automatedReport.json', '', function(){console.log('Previous contents of file erased')});		

}

/************************************************************************************************************
*
*    Function     : writeReportToFile
*
*    Description  : This function writes the contents to file which contains all the actions performed by the               
*					tester.
*   
*************************************************************************************************************/

function writeReportToFile(inActionCounter,inAction,report,inStatusCodes){
	
		var newLine = report;
		
		fs.appendFile("automatedReport.json",'\n'+inActionCounter+') Case Tested: '+inAction+'\t'+'| Description: '+newLine+'\t'+'| Status code: '+ inStatusCodes+'\t'+'|',function(err){
		
		//fs.appendFile("automatedReport.json",'\n'+new Date()+'\t'+'Case Tested: '+inAction+', Description:'+' '+newLine,function(err){
		if(err) throw err;
		console.log('Report is written to the file')
		});
		
		if(inActionCounter === 6){
			fs.appendFile("automatedReport.json",'\n' +'\n'+ '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'<------End of the report------>'+'\n'+
					'----------------------------------------------------------------------------------------------'+'\n',function(err){
					if(err) throw err;
					console.log('Last written in the file');
					});
			
		}
		   
		};
