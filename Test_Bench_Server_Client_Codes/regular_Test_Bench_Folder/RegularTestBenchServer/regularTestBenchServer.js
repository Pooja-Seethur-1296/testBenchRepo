/*************Device Test bench Server version 1.0****************/

/*****************************************************************************************************************************
* @name         {*}  Regular Device Test Bench Web Socket Server
* @version      {*}  1.0
* @description  {*}  This is the javascript file having source code for simple Web Socket server. 
*					 The Web Socket Server communicates with the Client and handles the client accordingly.
*					 It performs the following actions.
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
var nodemailer = require('nodemailer');
const fs = require('fs');
const updateToDbObj = require('./testEngine');

/***************************************** Global Variables*********************************************/

var iPort = 2900;
var connections = {};
var connectionIdCounter = 0;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var addSensorIdArray = new Array();
var addActuatorIdArray = new Array();
var addDeleteCounter = 0;

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
	var inDeviceId = null;

    /*********Retreving data from incoming messages**********/ 

    /******Data from the user/app/UI*****/

	inAction = incomingMessage.action;
    inUserId = incomingMessage.userId;
    inTesterName = incomingMessage.testerName;
    inVersion = incomingMessage.versionOfHardware;
    inTimeInterval = incomingMessage.timeInterval;     //Time set for the water to flow out of sensor(app triggered)
    inWaterFlow = incomingMessage.waterFlow;           //water sensor flow in liters(app triggered)
    inStatus = incomingMessage.state;       
    inTs = incomingMessage.ts;
    inDescp = incomingMessage.descp;

    /******Data from the device*****/

    inResp = incomingMessage.resp;
    inDeviceId = incomingMessage.deviceId;
    
    /******Print Incoming action or response requests*****/

	console.log("Action ID: " + inAction);
    console.log("Response ID: " + inResp);
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        
    /******* Reads number of iterations that has to be sent to device for stress test ******/

    var inNoOfIterations = readIterationNumber();

    /****** Write Initial details of the test cycle, to the text file in the beginning of the report ******/
    
    if(inAction === 'Entered_Device_ID'){

        initialProtocols(inUserId,inDeviceId,inVersion,inTesterName);
        console.log("initial protocols written");

        /** Calling function to send notification email in beginning of test cycle **/
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
                
            }

	/*********************For 2 way communication retrieving and swap connection ID *********************/
	
    console.log('The incoming connection ID is: '+ inConnectionID);
   
    if((inConnectionID === 1)||(inConnectionID === 2)){
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

     /*********************Switch test routine action from HTML client*********************/

	switch(inAction){
        case 'SWMS_RESTART': var JSONMessage = {
                                resp:"RA000"
                            }
                            oSendAckBackToClient(inConnectionID, JSONMessage);
                            break;

        case 'addSensorNodes':  addSensorIdArray[0] = incomingMessage.sensorID1; 
                                addSensorIdArray[1] = incomingMessage.sensorID2;
                                addSensorIdArray[2] = incomingMessage.sensorID3;
                                addSensorIdArray[3] = incomingMessage.sensorID4;
                                addSensorIdArray[4] = incomingMessage.sensorID5;
                                var report = '\n'+"Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                writeReportToFile(report);
                                var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[0]);
                                oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                break;

        case 'addActuatorNodes':addActuatorIdArray[0] = incomingMessage.actuatorID1; 
                                addActuatorIdArray[1] = incomingMessage.actuatorID2;
                                addActuatorIdArray[2] = incomingMessage.actuatorID3;
                                addActuatorIdArray[3] = incomingMessage.actuatorID4;
                                addActuatorIdArray[4] = incomingMessage.actuatorID5;
                                var report = '\n'+"Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                writeReportToFile(report);
                                var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[0]);
                                oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                break;
          
        case 'deleteExistingSensor':var report = '\n'+"Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                    writeReportToFile(report);
                                    var inComingAction = '109';
                                    var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inComingAction, inDeviceId, addSensorIdArray[0]);
                                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                    break;
        
        case 'deleteSensorNodes':   addSensorIdArray[0] = incomingMessage.sensorID1;
                                    addSensorIdArray[1] = incomingMessage.sensorID2;
                                    addSensorIdArray[2] = incomingMessage.sensorID3;
                                    addSensorIdArray[3] = incomingMessage.sensorID4;
                                    addSensorIdArray[4] = incomingMessage.sensorID5;
                                    var report = '\n'+"Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                    writeReportToFile(report);
                                    var inComingAction = "109";
                                    var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inComingAction, inDeviceId, incomingMessage.sensorID1);
                                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                    break;

        case 'deleteExistingActuator':var report = '\n'+"Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                    writeReportToFile(report);
                                    var inComingAction = '108';
                                    var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, addActuatorIdArray[0]);
                                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                    break;

        case 'deleteActuatorNodes': addActuatorIdArray[0] = incomingMessage.actuatorID1; 
                                    addActuatorIdArray[1] = incomingMessage.actuatorID2;
                                    addActuatorIdArray[2] = incomingMessage.actuatorID3;
                                    addActuatorIdArray[3] = incomingMessage.actuatorID4;
                                    addActuatorIdArray[4] = incomingMessage.actuatorID5;
                                    var report = "Routine selected: " + inAction + "(All 5 nodes) @ " + time;
                                    writeReportToFile(report);
                                    var inComingAction = "108";
                                    var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, incomingMessage.actuatorID1);
                                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                    break;

        case 'addDeleteNodes':  var addAndDeleteNodeIterNo = null;
                                addAndDeleteNodeIterNo = incomingMessage.noOfAddDeleteIter;
                                addActuatorIdArray[6] = addAndDeleteNodeIterNo;
                                addActuatorIdArray[5] = incomingMessage.actuatorID;
                                var report =  '\n'+ "Routine selected: add and delete a node @ " + time;
                                writeReportToFile(report);  //addition
                                var inComingAction = "addActuatorNodes";
                                var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, incomingMessage.actuatorID);
                                oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                break;	
                    
        case 'addPairDeleteNodes':  addActuatorIdArray[7] = incomingMessage.actuatorID1;
                                    addSensorIdArray[5] = incomingMessage.sensorID1;
                                    var report = '\n'+ "Routine selected: add, pair & delete a node @ " + time;
                                    writeReportToFile(report);  //addition of actuator
                                    var inComingAction = "addActuatorNodes";
                                    var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, incomingMessage.actuatorID1);
                                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                    break;

        case 'regularRoutine':  addActuatorIdArray[8] = incomingMessage.actuatorID1;
                                addSensorIdArray[6] = incomingMessage.sensorID1;
                                var report = '\n'+ "Routine selected: regular rotine @ " + time;
                                writeReportToFile(report);  //addition of actuator
                                var inComingAction = "addActuatorNodes";
                                var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, incomingMessage.actuatorID1);
                                oSendAckBackToClient(sendToOtherClient, incomingResponse);
                                break;
     
        case '107': var incomingResponse = { resp : "RM1000" };
                    oSendAckBackToClient(inConnectionID, incomingResponse);
                    break;            
        case '106': var incomingResponse = { resp : "RA1000" };
                    oSendAckBackToClient(inConnectionID, incomingResponse); 
                    break;   
        case '108': var incomingResponse = { resp : "RA1001" };
                    oSendAckBackToClient(inConnectionID, incomingResponse); 
                    break; 

        case 'check':console.log("aaaaaaaa");
                    addActuatorIdArray[7] = 'OTSA989';
                    addSensorIdArray[5] = 'OTSU111';
                    var incomingResponse = appResponseToDeviceObj.pairSensorActuatorNode(inDeviceId, addActuatorIdArray[7], addSensorIdArray[5]);
                    oSendAckBackToClient(sendToOtherClient, incomingResponse); 
                    break; 

        case 'setThreshold':console.log("bbbbbb");
                    //addActuatorIdArray[7] = 'OTSA989';
                    addSensorIdArray[5] = 'OTSU111';
                    var incomingResponse = appResponseToDeviceObj.oSetThreshold(inDeviceId,addSensorIdArray[5],time);
                    //var report = "Request to set threshold value for the sensor node in Automatic mode";
                            //writeReportToFile(report);
                    oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    break; 
        //case '': var incomingResponse = { resp : "RA1002" };
                    //oSendAckBackToClient(inConnectionID, incomingResponse);
                    //break;                
                            /*******************get device information*******************
                            var incomingResponse = appResponseToDeviceObj.oGetDeviceCurrentInfo(inDeviceId);
                            var report = "1) Request to obtain current device information";
                            sendSensorInfo(sendToOtherClient, incomingResponse, report, inAction);
                            syncWait(2000);
                            /*******************Change mode to manual*******************
                            var inMode = "M";
                            var incomingResponse = appResponseToDeviceObj.oRequestToChangeMode(inDeviceId,inMode);
                            var report = "2) Request to change the mode to Manual";

                            /*******************Error cases*******************
                            var incomingResponse = {
                                action : 'Error routine started',
                                deviceId: inDeviceId,
                            }
                            var report = '\n'+"ERROR ROUTINE STARTED";
                            writeReportToFile(report);
                            oSendAckBackToClient(inConnectionID, incomingResponse);
                            /**Change mode to timer, switch on manually, Change mode to manual, set timer(105)**/
                            /*Manual On in timer mode, when it is off*
                            var inWaterFlow = "0";
                            var inStatus = "1";
                            var incomingResponse = appResponseToDeviceObj.oManualOnOff(inDeviceId,inWaterFlow,inStatus);
                            var report = "Error case 1) switch on manually in timer mode";
                            sendSensorInfo(sendToOtherClient, incomingResponse, report, inAction);

                            /*******************get device information*******************
                            var incomingResponse = appResponseToDeviceObj.oGetDeviceCurrentInfo(inDeviceId);
                            var report = "2) Request to obtain current device information";
                            syncWait(1000);

                            /*******************Set a timer when manually on*******************
                            var Time = new Date();
	                        var Min = Time.getMinutes(); var freshMin = Min.toString();
                            var seperator = '0211';                                 //Set timer for 2 minutes
                            var Hrs = Time.getHours(); var freshHrs = Hrs.toString();
                            var currentTime = freshHrs.concat(freshMin,seperator);
                            var inDescp = currentTime; 
                            var report = "6) Request to set the timer @ " + inDescp;
                            var incomingResponse = appResponseToDeviceObj.oOnTimerForOnce(inDeviceId, incomingMessage.actuatorID1, inDescp);
                            sendSensorInfo(sendToOtherClient, incomingResponse, report, inAction);
                            syncWait(60000);

                            /*******************Delete sensor & actuator in the end of routine*******************
                            var inComingAction = "109";
                            var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inComingAction, inDeviceId, incomingMessage.sensorID1);
                            oSendAckBackToClient(sendToOtherClient, incomingResponse);
                            syncWait(2000);
                            var inComingAction = "108"; //deletion
                            var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, incomingMessage.actuatorID1);
                            oSendAckBackToClient(sendToOtherClient, incomingResponse);
                            syncWait(2000);
                            */
                    

        /*case '104': console.log("Request to set timer and cron job");
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
                    break;*/

        case '850': var incomingMessage = appResponseToDeviceObj.getTesterInfoFromDb(inTesterName);
                        updateToDbObj.getTesterInformation(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                            try{
                                if(err){
                                    oSendAckBackToClient(outConnectionId, outGoingMessage);
                                    return;
                                }
                                oSendAckBackToClient(outConnectionId, outGoingMessage);
                                console.log(outGoingMessage);
                                return;
                            }catch(err){
                                var outGoingMessage={
                                    resp:inAction,
                                    statusCode:config.generalErrorCode,
                                    descp:err.name
                                }
                                oSendAckBackToClient(inConnectionID, outGoingMessage);
                                return;
                            }
                        })
                        console.log('Tester Information from DB is obtained');
                        break;

        case '851': var incomingMessage = appResponseToDeviceObj.getInfoFromDbBasedOnDeviceID(inDeviceId);
                        updateToDbObj.getTesterInformationBasedOnDeviceId(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                            try{
                                if(err){
                                    oSendAckBackToClient(outConnectionId, outGoingMessage);
                                    return;
                                }
                                oSendAckBackToClient(outConnectionId, outGoingMessage);
                                return;
                            }catch(err){
                                var outGoingMessage={
                                    resp:inAction,
                                    statusCode:config.generalErrorCode,
                                    descp:err.name
                                }
                                oSendAckBackToClient(inConnectionID, outGoingMessage);
                                return;
                            }
                        })
                        console.log('Information from DB based on Device ID is obtained');
                        break;

        case '852': var incomingMessage = appResponseToDeviceObj.getInfoFromDbBasedOnDate(inDeviceId,incomingMessage.date);
                        updateToDbObj.getTesterInformationBasedOnDate(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                            try{
                                if(err){
                                    oSendAckBackToClient(outConnectionId, outGoingMessage);
                                    return;
                                }
                                oSendAckBackToClient(outConnectionId, outGoingMessage);
                                return;
                            }catch(err){
                                var outGoingMessage={
                                    resp:inAction,
                                    statusCode:config.generalErrorCode,
                                    descp:err.name
                                }
                                oSendAckBackToClient(inConnectionID, outGoingMessage);
                                return;
                            }
                        })
                        console.log('Information from DB based on date is obtained');
                        break;

        case '853': var incomingMessage = appResponseToDeviceObj.getInfoFromDbBasedOnTestStatus(inDeviceId, incomingMessage.testStatus);
                        updateToDbObj.getTesterInformationBasedOnTestStatus(inConnectionID,incomingMessage,function(err,outConnectionId,outGoingMessage){
                            try{
                                if(err){
                                    oSendAckBackToClient(outConnectionId, outGoingMessage);
                                    return;
                                }
                                oSendAckBackToClient(outConnectionId, outGoingMessage);
                                return;
                            }catch(err){
                                var outGoingMessage={
                                    resp:inAction,
                                    statusCode:config.generalErrorCode,
                                    descp:err.name
                                }
                                oSendAckBackToClient(inConnectionID, outGoingMessage);
                                return;
                            }
                        })
                        console.log('Information from DB based on test status is obtained');
                        break;

        case 'normalRegular': /*******************manual On******************{doubt ask}*/
                                var inWaterFlow = "1";
                                var inStatus = "1";
                                addActuatorIdArray[7] = 'OTSA989';
                                var incomingResponse = appResponseToDeviceObj.oManualOnOff(inDeviceId, inWaterFlow,inStatus,addActuatorIdArray[7]);
                                var report = '\t'+"Request to switch on actuator manually";
                                sendSensorInfo(sendToOtherClient, incomingResponse, report, inAction);
                                break;

        case 'REPORT': console.log("Request to send report received from the client");	
                    decideContentForEmail(inAction,inDeviceId,inVersion,inTesterName);
                    break;
                    	
	default :
				break;
    }

/**********Response handling from device and sending information back to user/client****************/

    switch(inResp){

        case '000': //console.log('client ID received from user');
                    var report = 'client ID acknowledgement received by device and ID is stored locally at device';
                    writeReportToFile(report);
                    break;

        case '101': var report = '\t'+ "Device Information received(101)" + time;
                    writeReportToFile(report);
                    oSendAckBackToClient(sendToOtherClient, incomingMessage);
                    break;

        case '103': var report = '\t'+ "Mode Changed to: " + incomingMessage.mode +" acknowledgement from the device received";
                    writeReportToFile(report);
                    if(incomingMessage.mode === 'T'){
                       
                            /*******************Set a timer*******************/
                            var Time = new Date();
	                        var Min = Time.getMinutes(); var freshMin = Min.toString();
                            var seperator = '0211';                                 //Set timer for 2 minutes
                            var Hrs = Time.getHours(); var freshHrs = Hrs.toString();
                            var currentTime = freshHrs.concat(freshMin,seperator);
                            var inDescp = currentTime;           
                            var report = "6) Request to set the timer @ " + inDescp;
                            var incomingResponse = appResponseToDeviceObj.oOnTimerForOnce(inDeviceId, addActuatorIdArray[8], inDescp);
                            writeReportToFile(report);
                    }
                    else if(incomingMessage.mode === 'A'){

                            /************** Set Threshold value for sensor node ***************/
                            var incomingResponse = appResponseToDeviceObj.oSetThreshold(inDeviceId,addSensorIdArray[6],time);
                            var report = "Request to set threshold value for the sensor node in Automatic mode";
                            writeReportToFile(report);
                    }
                    oSendAckBackToClient(inConnectionID, incomingMessage);
                    break;

        case '102': var report = '\t'+ "Actuator On/Off acknowledgement received";
                    writeReportToFile(report);
                    if(incomingMessage.status === '1'){
                        var inWaterFlow = "0";
                        var inStatus = "0";
                        var incomingResponse = appResponseToDeviceObj.oManualOnOff(inDeviceId, inWaterFlow,inStatus,addActuatorIdArray[8]);
                    }
                    else if(incomingMessage.status === '0'){
                        var inMode = "T";
                        var incomingResponse = appResponseToDeviceObj.oRequestToChangeMode(inDeviceId, inMode);
                    }
                    oSendAckBackToClient(inConnectionID, incomingMessage);
                    break;

        case '105': var report = '\t'+ "Time sheet (105) has been successfully updated in device";
                    writeReportToFile(report);
                    /*******************Change mode to Automatic*******************/
                    var inMode = "A";
                    var incomingResponse = appResponseToDeviceObj.oRequestToChangeMode(inDeviceId, inMode);
                    var report = " Request to change the mode to Automatic";
                    writeReportToFile(report);
                    oSendAckBackToClient(inConnectionID, incomingMessage);
                    break;
        
        case '106': var report = '\t'+ "Actuator ID: "+ incomingMessage.actuatorId +" has been successfully added to gateway device" + " @ Server:" + time ;
                    writeReportToFile(report);
                    var inAction = "addActuatorNodes";
                    if(incomingMessage.actuatorId === addActuatorIdArray[0]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[1]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[1]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[2]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[2]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[3]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[3]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[4]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                        var incomingResponse = {action:"Addition of actuator Routine ended successfully"}
                        oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[5]){
                        var inComingAction = "108"; //deletion
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, addActuatorIdArray[5]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[7]){
                        var inComingAction = "addSensorNodes";
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inComingAction, inDeviceId, addSensorIdArray[5]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[8]){
                        var inComingAction = "addSensorNodes";
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inComingAction, inDeviceId, addSensorIdArray[6]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    break;

        case '107': //var incomingResponse = { resp : "RM1000" };
                    //oSendAckBackToClient(inConnectionID, incomingResponse);
                    var report = '\t'+ "Sensor ID: "+ incomingMessage.sensorId +" has been successfully added to gateway device" + " @ Server:" + time ;
                    writeReportToFile(report);
                    var inAction = "addSensorNodes";
                    if(incomingMessage.sensorId === addSensorIdArray[0]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[1]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[1]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[2]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[2]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[3]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[3]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[4]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                        var incomingResponse = {action:"Addition of sensor Routine ended successfully"}
                        oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[5]){
                        var incomingResponse = appResponseToDeviceObj.pairSensorActuatorNode(inDeviceId, addActuatorIdArray[7], addSensorIdArray[5]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[6]){
                        var incomingResponse = appResponseToDeviceObj.pairSensorActuatorNode(inDeviceId, addActuatorIdArray[8], addSensorIdArray[6]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    break;

        case '108': var report = '\t'+ "Actuator ID: "+ incomingMessage.actuatorId +" has been successfully deleted from gateway device" + " @ Server:" + time ;
                    writeReportToFile(report);
                    var inAction = '108';
                    if(incomingMessage.actuatorId === addActuatorIdArray[0]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[1]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[1]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[2]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[2]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[3]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[3]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[4]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                        var incomingResponse = {action:"Deletion of actuator Routine ended successfully"}
                        oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[5]){
                        addDeleteCounter++;
                        console.log("addDeleteCounter No: "+ addDeleteCounter);
                            if(addDeleteCounter === (addActuatorIdArray[6])){
                                var incomingResponse = {action:"Add & delete Routine Completed"}
                                oSendAckBackToClient(sendToOtherClient, incomingResponse);
                            }
                            else{
                                var inComingAction = "addActuatorNodes";
                                var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inComingAction, inDeviceId, addActuatorIdArray[5]);
                                oSendAckBackToClient(inConnectionID, incomingResponse);
                            }
                    }
                    else if(incomingMessage.actuatorId === addActuatorIdArray[7]){
                            var incomingResponse = {action:"Add, pair & delete Routine Completed"}
                            oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    }
                    break;

        case '109': var report = '\t'+ "Sensor ID: "+ incomingMessage.sensorId +" has been successfully deleted to gateway device" + " @ Server:" + time ;
                    writeReportToFile(report);
                    var inAction = '109';
                    if(incomingMessage.sensorId === addSensorIdArray[0]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[1]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[1]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[2]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[2]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[3]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[3]){
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[4]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                        var incomingResponse = {action:"Delete of sensor Routine ended successfully"}
                        oSendAckBackToClient(sendToOtherClient, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[5]){
                        var inAction = '108';
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteActuator(inAction, inDeviceId, addActuatorIdArray[7]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    
                    }
                    break;
                    
        case '111':
                        addSensorIdArray[6] = 'OTSU111';
                        var incomingResponse = appResponseToDeviceObj.oSetThreshold(inDeviceId,addSensorIdArray[6],time);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                         var report = '\t'+ "Actuator ID: " + addActuatorIdArray[7] + " Sensor ID: " + addSensorIdArray[5] + " has been successfully paired";
                    writeReportToFile(report);
                    if(incomingMessage.sensorId === addSensorIdArray[5]){
                        var inAction = '109';
                        var incomingResponse = appResponseToDeviceObj.addOrDeleteSensor(inAction, inDeviceId, addSensorIdArray[5]);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    else if(incomingMessage.sensorId === addSensorIdArray[6]){
                        /*******************manual On******************{doubt ask}*
                        var inWaterFlow = "1";
                        var inStatus = "1";
                        var incomingResponse = appResponseToDeviceObj.oManualOnOff(inDeviceId, inWaterFlow,inStatus,addActuatorIdArray[8]);
                        var report = '\t'+"Request to switch on actuator manually";
                        sendSensorInfo(inConnectionID, incomingResponse, report, inAction);*/
                        addSensorIdArray[6] = 'OTSU111';
                        var incomingResponse = appResponseToDeviceObj.oSetThreshold(inDeviceId,addSensorIdArray[6],time);
                        oSendAckBackToClient(inConnectionID, incomingResponse);
                    }
                    break;

        case '110': var report = '\t'+ "Threshold value has been successfully updated";
                    writeReportToFile(report);
                    /*******************Change mode to Automatic*******************/
                    var inMode = "A";
                    var incomingResponse = appResponseToDeviceObj.oRequestToChangeMode(inDeviceId, inMode);
                    var report = " Request to change the mode to Automatic";
                    writeReportToFile(report);
                    oSendAckBackToClient(inConnectionID, incomingMessage);
                    //
                    oSendAckBackToClient(sendToOtherClient, incomingMessage);
                    break;

        /*case '104': console.log("Mode Change Response from the device received");
                    var incomingResponse = deviceResponseToAppObj.oSetTimerSheet(inDeviceId);
                    oSendAckBackToClient(sendToOtherClient, outNoOfIterations, incomingResponse);
                    var report = 'Timer Sheet (Cron job) is received by the device: 104 cycle completed';
                    writeReportToFile(inResp,respCounter,report);
                    break;*/
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


function oSendAckBackToClient(inConnectionID, incomingResponse){

	if(!(oUtilityCheckConnection(inConnectionID))){
	 return;
	}

	if((incomingResponse === null) || (incomingResponse === "")){
	 console.log('Message incorrect!');
	 return;
	}

	/* Create JSON string */
	var responseJSONMessage = incomingResponse;

	oSendToConnection(inConnectionID, JSON.stringify(responseJSONMessage));
}



/************************************************************************************************************
* @function     {*} oUtilityCheckConnection
* @param        {*} inConnectionID
* @description  {*} This function is called to check if the client is still connected to the server or not
* @returns 	    {*} This returns true if connection still exists between connectionID and server,
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

/********************Function to send back to same client****************************/

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
*    Function     : writeReportToFile
*
*    Description  : This function writes the contents to file which contains all the actions performed by the               
*					tester.
*   
*************************************************************************************************************/    
 
function writeReportToFile(report){
//function writeReportToFile(inAction,actionCounter,report){
        
    var newLine = report;

    fs.appendFile("automatedReport.json",'\n'+ newLine,function(err){
        if(err) throw err;
        console.log('Report is written to the file')
        });
}

/************************************************************************************************************
 * @function     {*} decideContentForEmail
 * @param        {*} inAction 
 * @param        {*} inDeviceId 
 * @param        {*} inVersion 
 * @param        {*} inTesterName
 * @description  {*} Function called to write content for notification email/to read report.json file to send 
 *                   report mail 
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

/*********************************************************************************************************
 * @function     {*} initialProtocols()
 * @param        {*} inUserId 
 * @param        {*} inDeviceId 
 * @param        {*} inVersion 
 * @param        {*} inTesterName
 * @description  {*} Function called to write initial report in a format, with specific credentials
 *********************************************************************************************************/

function initialProtocols(inUserId,inDeviceId,inVersion,inTesterName){

        /**************** Append initial values to report file *****************/

        fs.appendFile("automatedReport.json",'\n' + '----------------------------------------------------------------------------------------------'+'\n'+
        '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+"AUTOMATED TEST REPORT:"+ '\n' +
        '\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+'\t'+ "for Erigate regular gateway device" +'\n'+
        '----------------------------------------------------------------------------------------------'+'\n'+
        'Date and Time of the test : ' + new Date()+'\n'+
        '----------------------------------------------------------------------------------------------'+'\n'+ 
        'Device ID :'+ inDeviceId +'\n'+'User ID :'+ inUserId +'\n'+
        'Description : Demo inhouse erigate Regular gateway device with HTML page'+'\n'+
        'Version : '+ inVersion +'\n'+
        'Name of the tester :'+ inTesterName +'\n'+
        '----------------------------------------------------------------------------------------------'+'\n',function(err){
            if(err) throw err;
            console.log('Initial lines written in the file');
            });


}

/*********************************************************************************************************
 * @function     {*} sendEmail()
 * @param        {*} textSubject 
 * @param        {*} readData 
 * @param        {*} toMailAddress 
 * @description  {*} Function called to send report/notification email to recipients mentioned
 *********************************************************************************************************/

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
  
    fs.writeFile('automatedReport.json', '', function(){console.log('Previous contents of report file erased')});

}

/************************************************************************************************************
*@function     {*} readIterationNumber
*@description  {*} This function takes json string read from a json file, as input parameter and parses 
*                  Json string, returns the Iteration number.
*************************************************************************************************************/

function readIterationNumber(){
    return true;

    var words = fs.readFileSync('emailContent.json', 'utf8');
    //console.log(words);
    var incomingData = JSON.parse(words);
    var inIterationNumber = null;
    inIterationNumber = incomingData.iterationNumber;

    console.log("No of iterations to be performed: "+inIterationNumber);
	return inIterationNumber;
}


const syncWait = ms => {
    const end = Date.now() + ms
    while (Date.now() < end) continue
}

/*********************************************************************************************************
 * @function     {*} sendSensorInfo()
 * @param        {*} sendToOtherClient 
 * @param        {*} incomingResponse 
 * @param        {*} report 
 * @description  {*} Function called to send information regarding sensor to gateway & write report to actions
 *********************************************************************************************************/

function sendSensorInfo(sendToOtherClient, incomingResponse, report, inAction)
{
    var sensorIteration = null;
    var newLine = report;

    fs.appendFile("automatedReport.json",'\n'+ newLine,function(err){
        if(err) throw err;
        console.log('Report is written to the file')
        });

    //for(sensorIteration=0; sensorIteration < 1; sensorIteration++){
        //syncWait(5000);
        oSendAckBackToClient(sendToOtherClient, incomingResponse);
   // }
}


