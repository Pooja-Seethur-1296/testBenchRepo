/*********************************************************************************************************************
*
*     Name:                    Web Socket Client 
*     Version:                 1.0
*     Author:                  Pooja Seethur
*     Description:             This is the javascript file having source code for a simple WebSocket Client. 
*							   This establishes a wensocket communication between client and Server. 
*							   The Web Socket client communicates with the Server and handles the client accordingly.
*
**********************************************************************************************************************/

var webSocketConnection;

//var webSocketServerAddress = "ws://192.168.1.118:2900";
//var webSocketServerAddress = "ws://192.168.1.3:65000";
//var webSocketServerAddress = "ws://192.168.43.86:2950";
//var webSocketServerAddress = "ws://194.59.165.40:2996"; 


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
               console.log(message.data);
			var incomingMessage = JSON.parse(message.data);
		 
			oHandleIncomingServerMessage(incomingMessage);
		} else{
			 /*FOR FUTURE USE BINARY DATA*/
		}
	}
}

function oHandleIncomingServerMessage(inMessage){
    var incomingMessage = inMessage;
    
    console.log("received action "+incomingMessage.Action);

	if((incomingMessage.Action === null) || (incomingMessage.Mode === null ||(incomingMessage.Status===null) ||(incomingMessage.Client_ID===null))){
		alert('Data Corrupted');
	}
	
	var assignedClientId = null;
     assignedClientId = incomingMessage.Client_ID;
     
     var today = new Date();
     var time = today.getHours() + ":" + today.getMinutes();
	
	window.localStorage.setItem("clientId", assignedClientId);

	switch(incomingMessage.action){
     case 'addSensorNodes' : var inComeAction = "107";
                             handleSensorNode(inComeAction, incomingMessage.sensorId, time);
                             break;

     case 'deleteSensorNodes' : var inComeAction = "109";
                             handleSensorNode(inComeAction, incomingMessage.sensorId, time);
                             break;
     
     case '109' : var inComeAction = "109";
                             handleSensorNode(inComeAction, incomingMessage.sensorId, time);
                             break;
     
     case '108' : var inComeAction = "108";                      
                    handleActuatorNode(inComeAction,incomingMessage.actuatorId, time);
                    break;

     case 'addActuatorNodes' : var inComeAction = "106";                      
                               handleActuatorNode(inComeAction,incomingMessage.actuatorId);
                               break;

     case 'deleteActuatorNodes' : var inComeAction = "108";                      
                               handleActuatorNode(inComeAction,incomingMessage.actuatorId);
                               break;

     case '111': var inComeAction = "111"; 
               handleSensorNode(inComeAction, incomingMessage.sensorId, time);
               break;

	case '1005' :
				document.getElementById("MessageAcknowledgement").innerHTML = incomingMessage.Data
				break;			 
	 default :
				 break;
	}
}
/************* Get device Current Info case 101***************/
function action101(){

     var JSONMessage = {
          resp:"101",
		  deviceId:"GOTSGID001",
		  status:'0',
		  mode: "M",
          ts:"12:34"
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));

}

function action103(){

     var JSONMessage = {
          resp:"103"
       };

console.log("sending"+JSONMessage);
oSendRequestToServer(JSON.stringify(JSONMessage));

}

function action102(){

     var JSONMessage = {
          resp:"102"
       };

console.log("sending"+JSONMessage);
oSendRequestToServer(JSON.stringify(JSONMessage));

}

function action104(){

     var JSONMessage = {
          resp:"104"
       };

console.log("sending"+JSONMessage);
oSendRequestToServer(JSON.stringify(JSONMessage));

}

function action105(){

     var JSONMessage = {
          resp:"105"
       };

console.log("sending"+JSONMessage);
oSendRequestToServer(JSON.stringify(JSONMessage));

}

function Action501(){

     var JSONMessage = {
          action:"000",
          userId:"Local test server",
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));


}


function manualMotorOn()
{
     var JSONMessage = {
                    action:"102",
                    mode :'M',
                    deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
                    clientId: window.localStorage.getItem('clientId'),
					modeStatus:'1'
                    };
     console.log("sending"+JSONMessage);

     oSendRequestToServer(JSON.stringify(JSONMessage));
}

function manualMotorMultipleOn()
{
     var JSONMessage = {
                    action:"102",
                    mode :'M',
                    deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
                    clientId: window.localStorage.getItem('clientId'),
					modeStatus:'2'
                    };
     console.log("sending"+JSONMessage);

     oSendRequestToServer(JSON.stringify(JSONMessage));
}

function manualMotorOff(){
     var JSONMessage = {
          action:"102",
          mode :'M',
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
		  clientId: window.localStorage.getItem('clientId'),
		  modeStatus:'0'
       
          };
console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));  

}

function generateAutoMail(){
     var JSONMessage = {
          action:"1001",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
          clientId: window.localStorage.getItem('clientId'),
          };
console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));  

}

function setAutoMode(){

     var JSONMessage = {
          action:"102",
          mode :'A',
          deviceId:"123",
          cid:"75a21cb0-5d40-11ea-9c82-b1148025044f",
          state:""
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));

}

function setLimit(){
     var JSONMessage = {
          action:"103",
          deviceId:"123",
          cid:"75a21cb0-5d40-11ea-9c82-b1148025044f",
           lt:"50",
           ut:"90"
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));

}


function sendTimeSheet(){

     var JSONMessage = {
          action:"105",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
          clientId: window.localStorage.getItem('clientId'),
          timeSheet:[
               {SU : ["10301511" , "15001510"]},
               {MO : ["11440111","16530111","17040110","17240510","11550111"]},
               {TU : ["11530111","12010111","17040110","17240510","11550111"]},
               {WE : ["18410311" , "10350111"]},
               {TH : ["17390111" , "17200111","10380110","10400110","10420110"]},
               {FR : ["17320211","16280111","16300111","16320111","16340111"]}
          ]
       };

console.log("sending"+JSONMessage);

oSendRequestToServer(JSON.stringify(JSONMessage));


}

function getTimeSheet(){
     
          var JSONMessage = {
          action:"Get_Time_Sheet",
          deviceId:"WOTSGID001",
          clientId: window.localStorage.getItem('clientId'),
          }
          console.log("sending"+JSONMessage);

     oSendRequestToServer(JSON.stringify(JSONMessage));


}

function gateDeviceId(){
     var gatewayDeviceId = document.getElementById("DeviceID").value;
     window.localStorage.setItem("EnteredGwDeviceId", gatewayDeviceId);
     var JSONMessage = {
          action : "Entered_Device_ID",
          deviceId: window.localStorage.getItem('EnteredGwDeviceId'),
          //clientId:"9047e640-61fe-11ea-b826-9dc39f87d760"
     }
     console.log("sending"+JSONMessage);
	 alert('Sending device ID')
     oSendRequestToServer(JSON.stringify(JSONMessage));
}




function getDeviceData(){
     var JSONMessage = {
          action : "101",
          deviceId:window.localStorage.getItem('EnteredGwDeviceId'),
          clientId: '1'//window.localStorage.getItem('clientId'),
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));
    
}

function handleSensorNode(inComeAction,inSensorId, time){
     var JSONMessage = {
          resp : inComeAction,
          deviceId:window.localStorage.getItem('EnteredGwDeviceId'),
          sensorId: inSensorId,
          ts: time 
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));  
}

function handleActuatorNode(inComeAction,inActuatorId,time){
     var JSONMessage = {
          resp : inComeAction,
          deviceId:window.localStorage.getItem('EnteredGwDeviceId'),
          actuatorId: inActuatorId,
          ts: time 
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));  
}

function oSendRequestToServer(inMessageToServer){
     console.log(inMessageToServer);
     if(webSocketConnection.readyState != WebSocket.OPEN){
                 alert('ERROR : UNABLE TO CONNECT TO SERVER')
                 return ;
             }

     webSocketConnection.send(inMessageToServer);
}

function actuator106(){
     var JSONMessage = {
          action : '106',
          deviceId : 'OTS001',
          actuator_id: 'OTSAID001',
          //ts: time 
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));  
}

