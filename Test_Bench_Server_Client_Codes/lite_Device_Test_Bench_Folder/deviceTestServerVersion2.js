/*************Device Test bench Server version 1.2****************/

/*****************************************************************************************************************************
*
*     Name:                    Device Test Bench Web Socket Server
*     Version:                 1.2
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
const appResponseToDeviceObj = require('./appResponsesForDevice');
const deviceResponseToAppObj = require('./deviceResponseToApp');
var nodemailer = require('nodemailer');
const fs = require('fs');
const updateToDbObj = require('./testEngine');

/***************************************** Global Variables*********************************************/

var iPort = 2900;
var connections = {};
var connectionIdCounter = 0;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var outNoOfIterations = 1;
var actionArray = {};
var actionCounter = null;
var respArray = {};
var respCounter = null;
var testCycleFlag = 0;
var reportFlag = false;

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
	global.GlobalMyArray = connections;

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
	
	console.log(inConnectionID);

	if(!(oUtilityCheckConnection(inConnectionID))){
		return;
	}
	console.log("Incoming message from client : " + inMessage);
	var connection = connections[inConnectionID];

    /*********Declare null variables for retreving incoming messages**********/ 
	
	var incomingMessage = JSON.parse(inMessage);
	var inAction =  null;
    var inUserId = null;
    var inVersion = null;
    var inTesterName = null;
    var inResp = null;
	var inclientId = null;
	var inDeviceId = null;
    var inMode = null;
    var inStatus = null;
    var inState = null;
    var inWaterFlow = null;
    var inTimeInterval = null;
    var inFlow = null;
    var inFlowRate = null;
    var inTs = null;
    var inDescp = null;

    /*********Retreving data from incoming messages**********/ 

    /******Data from the user/app/UI*****/

	inAction = incomingMessage.action;
    inUserId = incomingMessage.userId;
    inTesterName = incomingMessage.testerName;
    inVersion = incomingMessage.versionOfHardware;
	inclientId = incomingMessage.clientId;
    inTimeInterval = incomingMessage.timeInterval;     //Time set for the water to flow out of sensor(app triggered)
    inWaterFlow = incomingMessage.waterFlow;           //water sensor flow in liters(app triggered)
    inStatus = incomingMessage.state;       
    inTs = incomingMessage.ts;
    inDescp = incomingMessage.descp;

    //inTimer = incomingMessage.timer;

    /******Data from the device*****/

    inResp = incomingMessage.resp;
    inDeviceId = incomingMessage.deviceId;
    inMode = incomingMessage.mode;
    inState = incomingMessage.status;                  //data from device
    inFlow = incomingMessage.flow;                     //water flow info from sensor(device triggered)
    inFlowRate = incomingMessage.flowRate;             //water sensor flow in liters(device triggered)
	
    //cliDevIdFunction(inclientId,inDeviceId);
    
    /******Print Incoming action or response requests*****/

	console.log("Action ID: " + inAction);
    console.log("Response ID: " + inResp);

        
    /******* Reads number of iterations that has to be sent to device for stress test ******/

    var inNoOfIterations = readIterationNumber();

    /****** Write Initial details of the test cycle, to the text file in the beginning of the report ******/
    
    if(inAction === 'Entered_Device_ID'){

        initialProtocols(inNoOfIterations,inUserId,inDeviceId,inVersion,inTesterName);
        console.log("initial protocols written");

        decideContentForEmail(inAction,inDeviceId,inVersion,inTesterName);

            var incomingMessage = appResponseToDeviceObj.sendInfoToDb(inDeviceId,inTesterName,inVersion);
            updateToDbObj.addTesterInformation(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                try{
                    if(err){
                        oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                        return;
                    }
                    oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                    return;
                }catch(err){
                    var outGoingMessage={
                        resp:inAction,
                        statusCode:config.generalErrorCode,
                        descp:err.name
                    }
                    oSendAckBackToClient(inConnectionID, inAction, JSON.stringify(outGoingMessage));
                    return;
                }
            })
            console.log('Information sent to DB');
        }

    /****** Write final details of the test cycle, to the text file at the end of the report ******/

    if(inAction === 'REPORT'){
            /*fs.appendFile("automatedReport.json",'\n' +'\n'+ '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'<------End of the report------>'+'\n'+
                '----------------------------------------------------------------------------------------------'+'\n',function(err){
                if(err) throw err;
                console.log('Last lines written in the file');
                });*/

                var incomingMessage = appResponseToDeviceObj.sendFinalInfoToDb(inDeviceId,inTesterName);
                updateToDbObj.addTesterInformation(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                    try{
                        if(err){
                            oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                            return;
                        }
                        oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                        return;
                    }catch(err){
                        var outGoingMessage={
                            resp:inAction,
                            statusCode:config.generalErrorCode,
                            descp:err.name
                        }
                        oSendAckBackToClient(inConnectionID, inAction, JSON.stringify(outGoingMessage));
                        return;
                    }
                })
                console.log('Information sent to DB');
                
                var incomingMessage = appResponseToDeviceObj.getTesterInfoFromDb(inTesterName);
                updateToDbObj.getTesterInformation(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                    try{
                        if(err){
                            oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                            return;
                        }
                        oSendAckBackToClient(outConnectionId, inAction, JSON.stringify(outGoingMessage));
                        return;
                    }catch(err){
                        var outGoingMessage={
                            resp:inAction,
                            statusCode:config.generalErrorCode,
                            descp:err.name
                        }
                        oSendAckBackToClient(inConnectionID, inAction, JSON.stringify(outGoingMessage));
                        return;
                    }
                })
                console.log('DB Information obtained');
            }

    /*********** Store actions and its counter number in an array for reference **********/ 

        actionArray[inAction] = actionCounter++;
        console.log(actionArray);
        console.log(actionCounter);

        respArray[inResp] = respCounter++;
    
	/*********************For 2 way communication retrieving and swap connection ID *********************/
	
    console.log('The incoming connection ID is: '+ inConnectionID);
   
    if(inConnectionID === 1){
        var sendToOtherClient = 0;
    }

    else if(inConnectionID === 0){
        var sendToOtherClient = 1;
	}

    /*********************Check action or response from clients*********************/

	if((inAction === null)||(inResp === null)){
		console.log('Wrong Message from device/HTML Client');
		return;
	}
	
	
	switch(inAction){
		
		case 'GET_DEVICE_CURRENT_INFO': console.log("Request to get Device Information is received");
                    var incomingResponse = appResponseToDeviceObj.oGetDeviceCurrentInfo(inDeviceId);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
					var report = 'Obtain device information is requested';
					writeReportToFile(inAction,actionCounter,report);
                    break;	
                    
        case 'MODE_CHANGE_REQ': console.log("Request to get change mode received");
                    var incomingResponse = appResponseToDeviceObj.oRequestToChangeMode(inDeviceId,inMode);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
                    var report = 'Change mode requested';
                    writeReportToFile(inAction,actionCounter,report);
                    break;

        case 'MOTOR_ON_OFF_REQ': console.log("Request to get manual On/Off received");
                    var incomingResponse = appResponseToDeviceObj.oManualOnOff(inDeviceId,inStatus,inTimeInterval,inWaterFlow);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
                    if(inStatus === '1'){
                        var report = 'Manual solenoid On command received';
                    }
                    else if(inStatus === '0'){
                        var report = 'Manual solenoid Off command received';
                    }
					writeReportToFile(inAction,actionCounter,report);
                    break;

        case '104': console.log("Request to set timer and cron job");
                    var incomingResponse = appResponseToDeviceObj.oOnTimerForOnce(inAction,inDeviceId,inDescp);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
                    var report = 'Obtain device information is requested';
                    writeReportToFile(inAction,actionCounter,report);
                    break;

        case '105': console.log("Request to set fresh timer at device");
                    var incomingResponse = appResponseToDeviceObj.oOnTimerForOnce(inAction,inDeviceId,inDescp);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
                    var report = 'Time sheet has been set from app';
                    writeReportToFile(inAction,actionCounter,report);
                    break;

		case '000':	console.log("Request to get client ID");
					console.log('The ClientID is' + inclientId + 'The DeviceID is' + inDeviceId);
					var incomingResponse = appResponseToDeviceObj.oAssignClientId(inUserId);
                    oSendAckBackToClient(inConnectionID, outNoOfIterations, incomingResponse);
                    var report = 'Client ID is sent to the requested client';
                    writeReportToFile(inAction,actionCounter,report);
                    break;

        case '600':	console.log("Request to do factory reset at device");
					var incomingResponse = appResponseToDeviceObj.oFactoryReset(inDeviceId);
                    oSendAckBackToClient(sendToOtherClient, inNoOfIterations, incomingResponse);
                    decideContentForEmail(inAction,inDeviceId,inVersion,inTesterName);
                    break;

        case 'REPORT': console.log("Request to send report received from the client");	
                    //var report = 'Automatic report generated';
                    //writeReportToFile(inAction,actionCounter,report);
                    decideContentForEmail(inAction,inDeviceId,inVersion,inTesterName);
                    break;
                    	
	default :
				break;
    }
    
/**********Response handling from device and sending information back to user/client****************/

    switch(inResp){

        case '000': console.log('client ID received from user');
                    var report = 'client ID acknowledgement received by device and stored locally';
                    writeReportToFile(inResp,respCounter,report);
                    break;

        case '101': console.log("Response from the device received");
                    var incomingResponse = deviceResponseToAppObj.oSendDeviceCurrentInfo(inDeviceId,inState,inMode);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Device information is sent to client: Test cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;

        case '103': console.log("Mode Change Response from the device received");
                    var incomingResponse = deviceResponseToAppObj.oModeChangeInfo(inDeviceId,inState,inMode);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Mode change acknowledgement is sent to client: Test cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;

        case '102': console.log("Manual mode On/Off response received");
                    var incomingResponse = deviceResponseToAppObj.oManualOnOrOff(inDeviceId,inState,inFlow,inFlowRate);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Manual On/Off acknowledgement sent to client: Test cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;

        case '105': console.log("Mode Change Response from the device received");
                    var incomingResponse = deviceResponseToAppObj.oSetTimerSheet(inDeviceId);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Timer Sheet is received by the device: 105 cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;

        case '104': console.log("Mode Change Response from the device received");
                    var incomingResponse = deviceResponseToAppObj.oSetTimerSheet(inDeviceId);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Timer Sheet (Cron job) is received by the device: 104 cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;
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


function oSendAckBackToClient(inConnectionID, inNoOfIterations, incomingResponse){

	if(!(oUtilityCheckConnection(inConnectionID))){
	 return;
	}

	if((incomingResponse === null) || (incomingResponse === "")){
	 console.log('Message incorrect!');
	 return;
	}

	/* Create JSON string */
	var responseJSONMessage = incomingResponse;

	oSendToConnection(inConnectionID, inNoOfIterations, JSON.stringify(responseJSONMessage));
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
	//return true;
	var connection = connections[connectionID];

	if(!(connection && connection.connected)){
		 console.log('Error with Connection!!');
		 return false;
	}

	return true;
}

/********************Function to Automatically make clientID and deviceID global*********************

function cliDevIdFunction(inclientId,inDeviceId){
	clientId = inclientId;
	deviceID = inDeviceId;
}*/

/********************Function to send back to same client****************************/

function oSendToConnection(inConnectionID, inNoOfIterations, inResponseJSONMessage){

	if(!(oUtilityCheckConnection(inConnectionID))){
		return;
	}
	
	var connection = connections[inConnectionID];
	//console.log(connection);
    console.log('Sending message');

    /*Iterate, bombard the message to device for inNoOfIterations, for stress test*/
    var iterations = null;
    for(iterations = 0; iterations < inNoOfIterations; iterations++){
    connection.send(inResponseJSONMessage);
    console.log('Message sent for '+ iterations + ' times');
    }
} 
    
/************************************************************************************************************
*
*    Function     : writeReportToFile
*
*    Description  : This function writes the contents to file which contains all the actions performed by the               
*					tester.
*   
*************************************************************************************************************/    
    
function writeReportToFile(inAction,actionCounter,report){
        
    var newLine = report;
            
        fs.appendFile("automatedReport.json",'\n'+ actionCounter +') Case Tested: '+inAction+'\t'+'| Description: '+newLine+'\t'+'| ',function(err){
            if(err) throw err;
            console.log('Report is written to the file')
            });
               
}

/************************************************************************************************************
*
*    Function     : decideContentForEmail
*
*    Description  : This function takes json string read from a json file, as input parameter and parses 
*                   Json string, returns the Iteration number.
*
*    Parameters   : inAction
*
*************************************************************************************************************/

function decideContentForEmail(inAction,inDeviceId,inVersion,inTesterName){

    var words = fs.readFileSync('emailContent.json', 'utf8');
							
	var incomingData = JSON.parse(words);
	var inToAddressReport,inToAddressNotify,subReport,subNotification = null;
	
    inToAddressReport = incomingData.toAddressForReport;
    inToAddressNotify = incomingData.toAddressForNotification;
    subReport = incomingData.subjectTextForReport;
    subNotification = incomingData.subjectTextForNotification;

    if(inAction === 'Entered_Device_ID'){
        var textSubject = subNotification;
        var readData = 'Test cycle STARTED for the Device ID: ' + inDeviceId + '\n'+'Version of device: ' + inVersion + '\n'+'Name of Tester: ' + inTesterName +'\n'+'Time of Test: '+ new Date();
        sendEmail(textSubject,readData,inToAddressNotify);
    }

    else if((inAction === 'REPORT')||(reportFlag === false)){
        var textSubject = subReport;
        var readData = fs.readFileSync('automatedReport.json','UTF-8',function(err, data) { 
            if (err) throw err;
            console.log(data);
            });
            sendEmail(textSubject,readData,inToAddressReport); 
            var reportFlag = true;  
    
    
   // else if(inAction === '600'){
       if(reportFlag === true){
        var textSubject = subNotification;
        var readData = 'Test cycle successfully ENDED for the device ID: ' + inDeviceId + '\n'+'Name of Tester: ' + inTesterName +'\n'+'Time of Test: '+ new Date();
        sendEmail(textSubject,readData,inToAddressNotify);
        //setTimeout(sendEmail(textSubject,readData,inToAddressReport), 5000);
    }
}
	
}

function initialProtocols(inNoOfIterations,inUserId,inDeviceId,inVersion,inTesterName){

        /**************** Append initial values to report file *****************/

        fs.appendFile("automatedReport.json",'\n' + '----------------------------------------------------------------------------------------------'+'\n'+
        '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+"AUTOMATED TEST REPORT:"+ '\n' +
        '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+ "for Erigate lite gateway device" +'\n'+
        '----------------------------------------------------------------------------------------------'+'\n'+
        'Date and Time of the test : ' + new Date()+'\n'+
        '----------------------------------------------------------------------------------------------'+'\n'+ 
        'Device ID :'+ inDeviceId +'\n'+'User ID :'+ inUserId +'\n'+
        'Description : Demo inhouse erigate lite gateway device with HTML page'+'\n'+
        'Version : '+ inVersion +'\n'+
        'Name of the tester :'+ inTesterName +'\n'+
        'Number of iterations performed for each case:'+ inNoOfIterations +'\n'+
        '----------------------------------------------------------------------------------------------'+'\n',function(err){
            if(err) throw err;
            console.log('Initial lines written in the file');
            });


}

function sendEmail(textSubject,readData,toMailAddress){

    /*****************Reads the mail addresses and subject from the file***************/
            
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
    
    //put in another function and call this function afterwards: try tomorrow

    fs.writeFile('automatedReport.json', '', function(){console.log('Previous contents of report file erased')});
    //fs.writeFile('statusNotification.json', '', function(){console.log('Previous contents of status notification file erased')});	

}

/************************************************************************************************************
*
*    Function     : readIterationNumber
*
*    Description  : This function takes json string read from a json file, as input parameter and parses 
*                   Json string, returns the Iteration number.
*
*    Returns 	  : inIterationNumber, which returns the number of iterations to be performed
*
*************************************************************************************************************/

function readIterationNumber(){

    var words = fs.readFileSync('emailContent.json', 'utf8');
    console.log(words);
    var incomingData = JSON.parse(words);
    var inIterationNumber = null;
    inIterationNumber = incomingData.iterationNumber;

    console.log("No of iterations to be performed: "+inIterationNumber);
	return inIterationNumber;
}