/*********************************************************************************************************************
*
*     Name:                    App Simulator Web Socket Client 
*     Version:                 1.0
*     Author:                  Pooja Seethur
*     Description:             This is the javascript file having source code for a simple WebSocket Client. 
*							   This establishes a websocket communication between client and Server. 
*							   The Web Socket client communicates with the Server and handles the client accordingly.
*
**********************************************************************************************************************/

var webSocketConnection;

//var webSocketServerAddress = "ws://192.168.1.118:2990";
//var webSocketServerAddress = "ws://192.168.43.86:2990";
var webSocketServerAddress = "ws://194.59.165.40:2500"; 

var onOffCounter = 0;
var modeChangeCounter = 0;

/****************** Connects and binds to websocket server ******************/

function oConnectToWSServer(){
        //
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
			//var incomingMessage = JSON.parse(message.data);
		 
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
	
    console.log("received action "+inAction);

	/*if((incomingMessage.action === null) || (incomingMessage.mode === null ||(incomingMessage.Status===null) ||(incomingMessage.clientId===null))){
		alert('Data Corrupted');
	}*/
	
	if(inAction === 'alertMsg'){
		console.log(inMessage);
		getConfirmTestCycle();
	}
	
	if(inResp === '850'){
		console.log(inMessage);
		alert(inMessage);
	}
	
	//var getClientId = null;
	//getClientId = incomingMessage.clientId;
	
	//window.localStorage.setItem("getClientId", getClientId);

	switch(inResp){
        
    /******************************Handle incoming motor On/Off response***********************/

    case 'MOTOR_ON_OFF_REQ' : onOffCounter++;
                                var time = new Date();
                                var selectedTestIndex = document.getElementById("manualOnOffIterationNo").selectedIndex;
                                var manOnOffIterNo = document.getElementsByTagName("option")[selectedTestIndex].value;
                                var intIterationNo =  parseInt(manOnOffIterNo);
                                console.log(onOffCounter/2);
                                if(onOffCounter === 1){
                                    console.log('Manual On Off iteration Response Start time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
                                }
                                else if(intIterationNo === (onOffCounter/2)){
                                    console.log('Manual On Off iteration Response end time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
                                    onOffCounter = 0;
                                }
    break;

    /******************************Handle incoming mode change response***********************/

    case 'MODE_CHANGE_REQ' : modeChangeCounter++;
                                var time = new Date();
                                var selectedTestIndex = document.getElementById("modeIterationNo").selectedIndex;
                                var modeChangeIterNo = document.getElementsByTagName("option")[selectedTestIndex].value;
                                var intIterationNo =  parseInt(modeChangeIterNo);
                                console.log(modeChangeCounter/2);
                                if(modeChangeCounter === 1){
                                    console.log('Mode Change iteration Response Start time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
                                }
                                else if(intIterationNo === (modeChangeCounter/2)){
                                    console.log('Mode Change iteration Response end time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
                                    onOffCounter = 0;
                                }
    break;

	case '1005' :
				document.getElementById("MessageAcknowledgement").innerHTML = incomingMessage.Data
				break;			 
	 default :
				 break;
	}
}

/********* First details while starting the test **********

function gateDeviceId(){
	
     var gatewayDeviceId = document.getElementById("DeviceID").value;
	 window.localStorage.setItem("EnteredGwDeviceId", gatewayDeviceId);
	 
	 var nameTester = document.getElementById("nameOfTester").value;
	 window.localStorage.setItem("nameTester", nameTester);
	 
	 var hardwareVersion = document.getElementById("hardwareVersion").value;
	 window.localStorage.setItem("hardwareVersion", hardwareVersion);
	 
     var JSONMessage = {
          action : "Entered_Device_ID",
          deviceId: 'OTSLITEGID001',
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
          deviceId:'OTSLITEGID001',
          clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
     }
     console.log("sending"+JSONMessage);
     oSendRequestToServer(JSON.stringify(JSONMessage));
    
}

/************* Mode Change request in iterations***************/

function modeChangeInIterations(){
  
    var selectedTestIndex = document.getElementById("modeIterationNo").selectedIndex;
    var modeChangeIterNo = document.getElementsByTagName("option")[selectedTestIndex].value;
    var time = new Date();
    console.log(modeChangeIterNo);
    console.log('Mode iteration start time:'+ time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds() );
    for(var modeIterNo = 0; modeIterNo < modeChangeIterNo; modeIterNo++){
        
        /********************Manual Mode*******************/
            var JSONMessage = {
                action : "MODE_CHANGE_REQ",
                deviceId: 'OTSLITEGID001',
                mode:'M',
                clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
            }
            console.log("sending"+JSONMessage);
            oSendRequestToServer(JSON.stringify(JSONMessage));

        /********************Timer Mode********************/
            var JSONMessage = {
                action : "MODE_CHANGE_REQ",
                deviceId: 'OTSLITEGID001',
                mode:'T',
                clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
            }
            console.log("sending"+JSONMessage);
            oSendRequestToServer(JSON.stringify(JSONMessage));
    }
    console.log('Mode iteration end time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
}

/*************Manual On/Off***************/

function manualOnOff(){

    var selectedTestIndex = document.getElementById("manualOnOffIterationNo").selectedIndex;
    var manOnOffIterNo = document.getElementsByTagName("option")[selectedTestIndex].value;
   
    console.log(manOnOffIterNo);
    
    var time = new Date();

    console.log('Manual iteration start time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds()) ;
    for(var manualIterNo = 0; manualIterNo < manOnOffIterNo; manualIterNo++){

        /*****************On****************/
            var JSONMessage = {
                action : "MOTOR_ON_OFF_REQ",
                deviceId: 'OTSLITEGID001',
                state : '1',
                timeInterval : '1',
                waterFlow : '0',
                clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
            }
            console.log("sending"+JSONMessage);
            oSendRequestToServer(JSON.stringify(JSONMessage));

        /******************Off*****************/
            var JSONMessage = {
                action : "MOTOR_ON_OFF_REQ",
                deviceId: 'OTSLITEGID001',
                state : '0',
                timeInterval : '0',
                waterFlow : '0',
                clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
            }
            console.log("sending"+JSONMessage);
            oSendRequestToServer(JSON.stringify(JSONMessage));
    }
    console.log('Mode iteration end time:' + time.getMinutes()+ ":" + time.getSeconds() + ":" + time.getMilliseconds());
}

/************* Mode Change request ***************/

function modeChange(currentMode){
    
    var JSONMessage = {
         action : "MODE_CHANGE_REQ",
         deviceId: 'OTSLITEGID001',
         mode:	currentMode,
         clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
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
          deviceId: 'OTSLITEGID001',
		  descp:timeDur,
		  ts: currentTime,
		  clientId: 'c8ae4580-7669-11eb-9728-5385865b3532'
          };
console.log("sending"+JSONMessage);
alert(currentTime)
oSendRequestToServer(JSON.stringify(JSONMessage));  

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


