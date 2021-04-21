/*********************************************************************************************************************
*
*     Name:                    Regular Web Socket Client 
*     Version:                 1.0
*     Author:                  Pooja Seethur
*     Description:             This is the javascript file having source code for a simple WebSocket Client. 
*							   This establishes a websocket communication between client and Server. 
*							   The Web Socket client communicates with the Server and handles the client accordingly.
*
**********************************************************************************************************************/

var webSocketConnection;

var webSocketServerAddress = "ws://192.168.1.118:2900";
//var webSocketServerAddress = "ws://192.168.43.86:2900";
//var webSocketServerAddress = "ws://194.59.165.40:2900"; 

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
	 //console.log(message);
		if(typeof message.data === 'string'){
               console.log(message.data);
			var incomingMessage = JSON.parse(message.data);
		 
			oHandleIncomingServerMessage(incomingMessage);
		} else{
			 /*FOR FUTURE USE BINARY DATA*/
		}
	}
}

/****************** Handles incoming message from server ******************/

function oHandleIncomingServerMessage(inMessage){
    var incomingMessage = inMessage;
     //var incomingMessage = JSON.parse(inMessage);
	
	var inAction,inResp = null;
	inAction = incomingMessage.action;
     inResp = incomingMessage.resp;
	
    console.log("received action "+inAction);
    console.log("received response "+inResp);

	/*if((incomingMessage.action === null) || (incomingMessage.mode === null ||(incomingMessage.Status===null) ||(incomingMessage.clientId===null))){
		alert('Data Corrupted');
	}*/
	
	if(inAction === 'alertMsg'){
		console.log(inMessage);
		getConfirmTestCycle();
	}
	
	switch(incomingMessage.resp){
          case '850': console.log(incomingMessage);
                    alert(incomingMessage);
                    sizeof()
                    break;
     }
	
	var getClientId = null;
	getClientId = incomingMessage.clientId;
	
	window.localStorage.setItem("getClientId", getClientId);

}

/********* First details while starting the test **********/

function gateDeviceId(){
	
     var gatewayDeviceId = document.getElementById("DeviceID").value;
	 window.localStorage.setItem("EnteredGwDeviceId", gatewayDeviceId);
	 
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

/************* handle testing related request from user and send request to DB ***************/

function handleTestRelatedRequest(){

     var selectedTestIndex = document.getElementById("dataBaseParam").selectedIndex;
     var selectedTestParam = document.getElementsByTagName("option")[selectedTestIndex].value;
     var testParameter = document.getElementById("DbTesterParam").value;
     var secondTestParameter = document.getElementById("DbTesterSecondParam").value;

     alert("You have selected: " + selectedTestParam + ' Parameter: '+testParameter);

     switch(selectedTestParam){
          case 'byTesterName': var JSONMessage = {
                                   action:'850',
                                   testerName: testParameter
                              }
                              oSendRequestToServer(JSON.stringify(JSONMessage));
          break;

          case 'byDeviceId': var JSONMessage = {
                                   action:'851',
                                   deviceId: testParameter
                              }
                              oSendRequestToServer(JSON.stringify(JSONMessage));
          break;

          case 'byDate': var JSONMessage = {
                                   action:'852',
                                   date: testParameter,
                                   deviceId: secondTestParameter
                              }
                              oSendRequestToServer(JSON.stringify(JSONMessage));
          break;

          case 'byTestStatus': var JSONMessage = {
                                   action:'853',
                                   testStatus: testParameter,
                                   deviceId: secondTestParameter
                              }
                              oSendRequestToServer(JSON.stringify(JSONMessage));
          break;
     }
}

/************* define the routine for test ***************/

function routineDefinition(selectedRoutine){

    //var selectedRoutineIndex = document.getElementById("routineType").selectedIndex;
    //var selectedRoutine = document.getElementsByTagName("option")[selectedRoutineIndex].value;
   
     //alert("You have selected: " + selectedRoutine);

     switch(selectedRoutine){
         case 'addSensorNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Adds all the 5 wireless sensor nodes to GW device)");
                              var sensorId1 = document.getElementById("sensorId1").value;
                              var sensorId2 = document.getElementById("sensorId2").value;
                              var sensorId3 = document.getElementById("sensorId3").value;
                              var sensorId4 = document.getElementById("sensorId4").value;
                              var sensorId5 = document.getElementById("sensorId5").value;
                              var JSONMessage = {
                                   action : selectedRoutine,
                                   deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                   sensorID1 : sensorId1,
                                   sensorID2 : sensorId2,
                                   sensorID3 : sensorId3,
                                   sensorID4 : sensorId4,
                                   sensorID5 : sensorId5,
                              }
                              oSendRequestToServer(JSON.stringify(JSONMessage));
         break;
         case 'addActuatorNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Adds all the 5 wireless actuator nodes to GW device)");
                              var actuatorId1 = document.getElementById("actuatorId1").value;
                              var actuatorId2 = document.getElementById("actuatorId2").value;
                              var actuatorId3 = document.getElementById("actuatorId3").value;
                              var actuatorId4 = document.getElementById("actuatorId4").value;
                              var actuatorId5 = document.getElementById("actuatorId5").value;
                              var JSONMessage = {
                                   action : selectedRoutine,
                                   deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                   actuatorID1 : actuatorId1,
                                   actuatorID2 : actuatorId2,
                                   actuatorID3 : actuatorId3,
                                   actuatorID4 : actuatorId4,
                                   actuatorID5 : actuatorId5,
                              }

                              oSendRequestToServer(JSON.stringify(JSONMessage));
         break;
         case 'deleteSensorNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Deletes all the 5 wireless sensor nodes from GW device)");
                                   var sensorId1 = document.getElementById("sensorId3r1").value;
                                   var sensorId2 = document.getElementById("sensorId3r2").value;
                                   var sensorId3 = document.getElementById("sensorId3r3").value;
                                   var sensorId4 = document.getElementById("sensorId3r4").value;
                                   var sensorId5 = document.getElementById("sensorId3r5").value;
                                   var JSONMessage = {
                                        action : selectedRoutine,
                                        deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                        sensorID1 : sensorId1,
                                        sensorID2 : sensorId2,
                                        sensorID3 : sensorId3,
                                        sensorID4 : sensorId4,
                                        sensorID5 : sensorId5,
                                   }
                                   oSendRequestToServer(JSON.stringify(JSONMessage));
         break;

         case 'deleteExistingSensor': alert("You have selected: " + selectedRoutine + '\n'+ "(Deletes all the 5 wireless sensor nodes from GW device which are added from previous routine)");
                                      var JSONMessage = {
                                           action : selectedRoutine
                                      }
                                      oSendRequestToServer(JSON.stringify(JSONMessage));
         break;

         case 'deleteExistingActuator':alert("You have selected: " + selectedRoutine + '\n'+ "(Deletes all the 5 wireless actuator nodes from GW device which are added from previous routine)");
                                        var JSONMessage = {
                                             action : selectedRoutine
                                        }
                                        oSendRequestToServer(JSON.stringify(JSONMessage));
         break;

         case 'deleteActuatorNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Deletes all the 5 wireless actuator nodes from GW device)");
                                   var actuatorId1 = document.getElementById("actuatorId4r1").value;
                                   var actuatorId2 = document.getElementById("actuatorId4r2").value;
                                   var actuatorId3 = document.getElementById("actuatorId4r3").value;
                                   var actuatorId4 = document.getElementById("actuatorId4r4").value;
                                   var actuatorId5 = document.getElementById("actuatorId4r5").value;
                                   var JSONMessage = {
                                        action : selectedRoutine,
                                        deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                        actuatorID1 : actuatorId1,
                                        actuatorID2 : actuatorId2,
                                        actuatorID3 : actuatorId3,
                                        actuatorID4 : actuatorId4,
                                        actuatorID5 : actuatorId5,
                                   }
                                   oSendRequestToServer(JSON.stringify(JSONMessage));
         break;
         case 'addDeleteNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Adds single wireless node to GW device & deletes it)");
                                   var actuatorId = document.getElementById("actuatorId5r").value;
                                   var inIterNo = document.getElementById("noOfIterAddDelete").value;
                                   var iterNo = parseInt(inIterNo);
                                   var JSONMessage = {
                                        action : selectedRoutine,
                                        deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                        actuatorID : actuatorId,
                                        noOfAddDeleteIter : iterNo
                                   }
                                   oSendRequestToServer(JSON.stringify(JSONMessage));
         
         break;
         case 'addPairDeleteNodes': alert("You have selected: " + selectedRoutine + '\n'+ "(Adds one pair of sensor & actuator node to GW device, pairs & deletes them)");
                                   var sensorId6r = document.getElementById("sensorId6r").value;
                                   var actuatorId6r = document.getElementById("actuatorId6r").value;
                                   var JSONMessage = {
                                        action : selectedRoutine,
                                        deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                        sensorID1 : sensorId6r,
                                        actuatorID1 :actuatorId6r
                                   }
                                   oSendRequestToServer(JSON.stringify(JSONMessage));
         break;
         case 'regularRoutine': alert("You have selected: " + selectedRoutine + '\n'+ "(Performs mode change,On/Off,Set timer,error cases on a single routine)");
                                   var sensorId7r = document.getElementById("sensorId7r").value;
                                   var actuatorId7r = document.getElementById("actuatorId7r").value;
                                   var JSONMessage = {
                                        action : selectedRoutine,
                                        deviceId : window.localStorage.getItem('EnteredGwDeviceId'),
                                        sensorID1 : sensorId7r,
                                        actuatorID1 :actuatorId7r
                                   }
                                   oSendRequestToServer(JSON.stringify(JSONMessage));
         break;
     }
     
    
}

function normalRegularRoutine(){

     var JSONMessage = {
          action:"normalRegular"
       };

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



/*************** for action alert message for test cycle *********

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

}*/

/*************** Send JSON message to server ***************/

function oSendRequestToServer(inMessageToServer){
     console.log(inMessageToServer);
     if(webSocketConnection.readyState != WebSocket.OPEN){
                 alert('ERROR : UNABLE TO CONNECT TO SERVER')
                 return ;
             }

     webSocketConnection.send(inMessageToServer);
}



