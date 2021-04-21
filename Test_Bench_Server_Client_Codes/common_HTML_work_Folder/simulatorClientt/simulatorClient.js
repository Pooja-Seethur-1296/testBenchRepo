/*********************************************************************************************************************
*
*     Name:                    Simulator Web Socket Client 
*     Version:                 1.0
*     Author:                  Pooja Seethur
*     Description:             This is the javascript file having source code for a simple WebSocket Client. 
*							   This establishes a websocket communication between client and Server. 
*							   The Web Socket client communicates with the Server and handles the client accordingly.
*
**********************************************************************************************************************/

var webSocketConnection;
var webSocketServerAddress = "ws://192.168.1.118:2900";
//var webSocketServerAddress = "ws://192.168.1.3:65000";
//var webSocketServerAddress = "ws://192.168.43.86:4600";
//var webSocketServerAddress = "ws://194.59.165.40:4600"; 
var nodeIdArray = new Array();

/****************** Connects and binds to websocket server ******************/

function oConnectToWSServer(){
	
	webSocketConnection = new WebSocket(webSocketServerAddress);
 
	webSocketConnection.onopen = function(err){
	  
		if(webSocketConnection.readyState === WebSocket.OPEN){
			document.getElementById("connectionStatus").innerHTML = "Connected ! !"
			alert('Connected to test bench server');
		} else{
			alert('ERROR UNABLE TO CONNECT TO SERVER');
		}
	
	};

	webSocketConnection.onmessage = function(message){
	 
		if(typeof message.data === 'string'){
               console.log(message.data);
			//var inMessage = JSON.parse(message.data);
		 
			oHandleIncomingServerMessage(message.data);
		} else{
			 /*FOR FUTURE USE BINARY DATA*/
		}
	}
}

/****************** Handles incoming message from server ******************/

function oHandleIncomingServerMessage(inMessage){
    //var incomingMessage = inMessage;
	var incomingMessage = JSON.parse(inMessage);
	
	var inAction,inResp = null;
	inAction = incomingMessage.action;
    inResp = incomingMessage.resp;
	
    console.log("received action "+ inAction);

	switch(incomingMessage.action){
	case '106' : var actuatorIds = incomingMessage.actuator_id;
				nodeIdDisplayFunc(actuatorIds);
	break;

	case '107' : var sensorIds = incomingMessage.sensorId;
		nodeIdDisplayFunc(sensorIds);
	break;

	case '1005' :
				document.getElementById("MessageAcknowledgement").innerHTML = incomingMessage.Data
				break;			 
	 default :
				 break;
	}
}

function nodeIdDisplayFunc(handleId){
	var handleNodeId = handleId;
	nodeIdArray.push(handleNodeId);
	alert(handleNodeId);
	console.log(nodeIdArray);
	document.getElementById("nodeIdDisplay").innerHTML = nodeIdArray;
}

function timer(){
	var actuatorId1 = document.getElementById("actuatorId1").value;
	var actuatorId2 = document.getElementById("actuatorId2").value;
	var timeSlotA1 = document.getElementById("actuatorId1timeslot").value;
	var timeSlotA2 = document.getElementById("actuatorId2timeslot").value;
	var JSONMessage = {
		action :'444',
		actuatorId : [actuatorId1,actuatorId2],
		ts: [timeSlotA1,timeSlotA2]
	}
	console.log("sending"+JSONMessage);
	 alert('Sending device ID')
     oSendRequestToServer(JSON.stringify(JSONMessage));
}
/********* First details while starting the test **********/

function gateDeviceId(){
	 
	 var nameTester = document.getElementById("nameOfTester").value;
	 window.localStorage.setItem("nameTester", nameTester);
	 
	 var hardwareVersion = document.getElementById("hardwareVersion").value;
	 window.localStorage.setItem("hardwareVersion", hardwareVersion);
	 
     var JSONMessage = {
          action : "Entered_Device_ID",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  versionOfHardware: window.localStorage.getItem('hardwareVersion'),
		  userId: "Local test server",
		  testerName : window.localStorage.getItem('nameTester')
     }
     console.log("sending"+JSONMessage);
	 alert('Sending device ID')
     oSendRequestToServer(JSON.stringify(JSONMessage));
}

/************* Get device Current Info***************/

function getDeviceCurrentData(){
     var JSONMessage = {
          action : "GET_DEVICE_CURRENT_INFO",
          deviceId:window.localStorage.getItem('EnteredGwDeviceId'),
          clientId: window.localStorage.getItem('getClientId')
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));
    
}

/************* Mode Change request ***************/

function modeChange(){
	
     var currentMode = document.getElementById("DeviceMode").value;
     
	 var JSONMessage = {
          action : "MODE_CHANGE_REQ",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  mode:	currentMode,
		  clientId: window.localStorage.getItem('getClientId')
     }
     console.log("sending"+JSONMessage);
	 alert('Mode Change'+ currentMode)
     oSendRequestToServer(JSON.stringify(JSONMessage));
}

/*************Manual On/Off***************/

function manualOnOff(){
	
	var modeState = document.getElementById("state").value; 
	var timeOfFlow = document.getElementById("TimeInterval").value;
	var flowInLiters = document.getElementById("WaterFlowLiters").value;
	
     var JSONMessage = {
          action : "MOTOR_ON_OFF_REQ",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  state : modeState,
		  timeInterval : timeOfFlow,
		  waterFlow : flowInLiters,
          clientId: window.localStorage.getItem('getClientId')
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));
    
}

/************Get client ID***********/

function Action501(){

     var JSONMessage = {
          action:"000",
          userId:"Local test server",
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));


}
/************Factory Reset***********/

function factoryReset(){

     var JSONMessage = {
          action:"600",
		  deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  testerName : window.localStorage.getItem('nameTester')
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));

}

/***********Autogenate Report mail request********/

function generateAutoMail(){
     var JSONMessage = {
          action:"REPORT",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  clientId: window.localStorage.getItem('getClientId'),
		  testerName : window.localStorage.getItem('nameTester')
          };
console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));  

}

/***********Set timer for once(104/105)********/

function setTimerForOnce(){
	var Time = new Date();
	var Min = Time.getMinutes();
	var freshMin = Min.toString();
	var seperator = ':';
	var Hrs = Time.getHours();
	var freshHrs = Hrs.toString();
	var currentTime = freshHrs.concat(seperator,freshMin);
	var timeDur = document.getElementById("timeDuration").value;
	var timerAction = document.getElementById("timeAction").value;
     var JSONMessage = {
          action:timerAction,
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  descp:timeDur,
		  ts: currentTime,
		  clientId: window.localStorage.getItem('getClientId')
          };
console.log("sending"+JSONMessage);
alert(currentTime)
oSendRequestToServer(JSON.stringify(JSONMessage));  

}

/*************** for action alert message for test cycle *********/

function getConfirmTestCycle(){

  var testCycle = confirm("Your current test cycle incomplete! Do you want to restart anyway?");
  
  if (testCycle == true) {
    alert('New test cycle started! please fill all the datails');
	     var JSONMessage = {
          action:"RestartTestCycle"
       };
	console.log("sending"+JSONMessage);
	oSendRequestToServer(JSON.stringify(JSONMessage));
  } 
  
  else {
    alert('Resume testing without filling initial details!');
	     var JSONMessage = {
          action:"ResumeTestCycle"
       };
	console.log("sending"+JSONMessage);
	oSendRequestToServer(JSON.stringify(JSONMessage));
  }

}

/*************** Send JSON message to server ***************/

function oSendRequestToServer(inMessageToServer){
     console.log(inMessageToServer);
     if(webSocketConnection.readyState != WebSocket.OPEN){
                 alert('ERROR : UNABLE TO CONNECT TO SERVER')
                 return ;
             }

     webSocketConnection.send(inMessageToServer);
}


function sensorSimulation(){
	var JSONMessage = {
		action:"444"
		};
console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));  
}

function resp111(){
	var JSONMessage = {
		resp:"RA000"
		};
console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));  
}
