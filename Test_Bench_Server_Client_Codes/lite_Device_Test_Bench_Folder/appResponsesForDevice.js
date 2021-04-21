
/*Make status code dynamic by passing the status code as parameter to the function*/

module.exports = {
	
/***********************************************************************************************************
*
*    Function     : oAssignClientId
*
*    Description  : This function is called to generate unique clientId to the client that has requested it.
*
*    Returns      : json containing clienteeId
*
************************************************************************************************************/


oAssignClientId:function(inUserId) {

	//var clienteeId =  Math.random().toString(36).substring(2, 15);
	console.log("got requestfor client ID");
	
	if(inUserId === 'Local test server'){
		var clientIdentifier = '1'; 
	}
	else {
		var clientIdentifier = '93jsna345esaw2345kcm12we349saw2349bs'; 
	}
	var JSONMessage = {
				action : '000',
				clientId : clientIdentifier
				
	}
	console.log('Sending' + JSONMessage);
	return JSONMessage;
	
},

	
/***********************************************************************************************************
*
*    Function     : oGetDeviceCurrentInfo
*
*    Description  : Sends json request to obtain device information
*
************************************************************************************************************/

	oGetDeviceCurrentInfo:function(inDeviceId) {

		var JSONMessage = {
                    action : '101',
                    deviceId: inDeviceId,
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},

/***********************************************************************************************************
*
*    Function     : oRequestToChangeMode
*
*    Description  : Sends json request to change mode
*
************************************************************************************************************/

	oRequestToChangeMode:function(inDeviceId,inMode) {

		var JSONMessage = {
                    action : '103',
                    deviceId: inDeviceId,
					mode: inMode
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oManualOnOff
*
*    Description  :  Sends json request to On/Off solenoid manually
*
************************************************************************************************************/

	oManualOnOff:function(inDeviceId,inStatus,inTimeInterval,inWaterFlow) {

		var JSONMessage = {
                    action : '102',
                    deviceId: inDeviceId,
					state: inStatus,
					timeInterval: inTimeInterval,
					waterFlow: inWaterFlow
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},


/***********************************************************************************************************
*
*    Function     : oOnTimerForOnce
*
*    Description  : Send 104/105 timer request to device
*
************************************************************************************************************/

oOnTimerForOnce:function(inAction,inDeviceId,inDescp) {

	var Time = new Date();
	var Min = Time.getMinutes();
	var freshMin = Min.toString();
	var seperator = ':';
	var Hrs = Time.getHours();
	var freshHrs = Hrs.toString();
	var currentTime = freshHrs.concat(seperator,freshMin);

	var JSONMessage = {
				action : inAction,
				deviceId: inDeviceId,
				descp :inDescp,
				ts: currentTime
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*
*    Function     : oFactoryReset
*
*    Description  : Sends request to delete/clear all memory from EEPROM OF device
*
************************************************************************************************************/

oFactoryReset:function(inDeviceId) {

	var JSONMessage = {
				action : '600',
				deviceId: inDeviceId,
				
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*
*    Function     : sendInfoToDb
*
*    Description  : This function is called to send information json message to database
*
*    Returns      : Json Message
*
************************************************************************************************************/

sendInfoToDb:function(inDeviceId,inTesterName,inVersion) {

	var JSONMessage = {
				action : '800',
				deviceId: inDeviceId,
				version: inVersion,
				testerName: inTesterName,
				testResult: 'Started test cycle'

				
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*
*    Function     : sendFinalInfoToDb
*
*    Description  : This function is called to send information json message to database after final test
*
*    Returns      : Json Message
*
************************************************************************************************************/

sendFinalInfoToDb:function(inDeviceId,inTesterName) {

	var JSONMessage = {
				action : '800',
				deviceId: inDeviceId,
				testerName: inTesterName,
				testResult: 'Completed test cycle'
				
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*
*    Function     : getTesterInfoFromDb
*
*    Description  : This function is called to send information json message to database after final test
*
*    Returns      : Json Message
*
************************************************************************************************************/

getTesterInfoFromDb:function(inTesterName) {

	var JSONMessage = {
				
				action : '850',
				testerName: inTesterName
				
				
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

	
};