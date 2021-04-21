
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
************************************************************************************************************


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
* @function    {*} addOrDeleteSensor
* @description {*} This function is called to send different request json message of a routine
* @returns     {*} Json Message
************************************************************************************************************/

addOrDeleteSensor:function(inAction, inDeviceId, inSensorId) {

		var JSONMessage = {
			action:inAction,
			deviceId: inDeviceId,
			sensorId: [inSensorId] 
		}

	return JSONMessage;
},

/***********************************************************************************************************
* @function    {*} addOrDeleteActuator
* @description {*} This function is called to send different request json message of a routine
* @returns     {*} Json Message
************************************************************************************************************/

addOrDeleteActuator:function(inComingAction, inDeviceId, inActuatorId) {

		var JSONMessage = {
			action:inComingAction,
			deviceId: inDeviceId,
			actuatorId: [inActuatorId]
		}
	
	return JSONMessage;
},

/***********************************************************************************************************
* @function    {*} pairSensorActuatorNode
* @description {*} This function is called to send different request json message of a routine
* @returns     {*} Json Message
************************************************************************************************************/

pairSensorActuatorNode:function(inDeviceId, inactuatorID, insensorID) {

		var JSONMessage = {
			action:"111",
			deviceId:inDeviceId,
            actuator_nodes:[inactuatorID],
			sensor_nodes:[insensorID],
			logic:'s1',
			group:0
		}
	
	return JSONMessage;
},
	
/***********************************************************************************************************
*@function    {*} oGetDeviceCurrentInfo
*@description {*} Sends json request to obtain device information
************************************************************************************************************/

	oGetDeviceCurrentInfo:function(inDeviceId) {

		var JSONMessage = {
                    action : '101',
                    deviceId: inDeviceId,
					
		}
		return JSONMessage;	
	},

/***********************************************************************************************************
*@function     {*} oRequestToChangeMode
*@description  {*} Sends json request to change mode 
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
*@function     {*} oManualOnOff
*@description  {*} Sends json request to On/Off solenoid manually
************************************************************************************************************/

	oManualOnOff:function(inDeviceId, inWaterFlow,inStatus,inActuatorId) {

		var JSONMessage = {
                    action : '102',
					deviceId: inDeviceId,
					actuatorId: [inActuatorId],
					state: inStatus,
					timeInterval: "0",
					waterFlow: inWaterFlow
					
		}
		return JSONMessage;
		
	},


/***********************************************************************************************************
*@function     {*} oOnTimerForOnce
*@description  {*} Send timer request to gateway device
************************************************************************************************************/

oOnTimerForOnce:function(inDeviceId,inActuatorId,inDescp) {

	var Time = new Date();
	var Min = Time.getMinutes();
	var freshMin = Min.toString();
	var seperator = ':';
	var Hrs = Time.getHours();
	var freshHrs = Hrs.toString();
	var currentTime = freshHrs.concat(seperator,freshMin);

	var JSONMessage = {
				action : "105",
				deviceId: inDeviceId,
				actuatorId: inActuatorId,
				descp :inDescp,
				ts: currentTime
	}
	return JSONMessage;
	
},

/***********************************************************************************************************
*@function     {*} oSetThreshold
*@description  {*} Sends json request to set threshold value for a given node
************************************************************************************************************/

oSetThreshold:function(inDeviceId,inSensorID,time) {

	var JSONMessage = {
		action: "110",
		deviceId:inDeviceId, 
		sensorId:[inSensorID],
		lowerLimit:"50", 
		upperLimit:"90",
		ts:time                                                                                                                                                                                                                                       
	}
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
				testResult: "0"			
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/******************************************************************************************************************
*@function     {*} sendFinalInfoToDb
*@description  {*} This function is called to send information json message to database after finishing test cycle
*@return       {*} JSONMessage
*******************************************************************************************************************/

sendFinalInfoToDb:function(inDeviceId,inTesterName) {

	var JSONMessage = {
				action : '800',
				deviceId: inDeviceId,
				testerName: inTesterName,
				testResult: "1"
				
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*@function     {*} getTesterInfoFromDb
*@description  {*} This function is called to send information json request to database after final test
*@returns      {*} Json Message
************************************************************************************************************/

getTesterInfoFromDb:function(inTesterName) {

	var JSONMessage = {
				
				action : '850',
				testerName: inTesterName		
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*@function     {*} getInfoFromDbBasedOnDeviceID
*@description  {*} This function is called to send information json request to database after final test
*@returns      {*} Json Message
************************************************************************************************************/

getInfoFromDbBasedOnDeviceID:function(inDeviceId) {

	var JSONMessage = {
				
				action : '851',
				deviceId: inDeviceId		
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*@function     {*} getInfoFromDbBasedOnDate
*@description  {*} This function is called to send information json request to database after final test
*@returns      {*} Json Message
************************************************************************************************************/

getInfoFromDbBasedOnDate:function(inDeviceId, inDate) {

	var JSONMessage = {
				
				action : '852',
				deviceId: inDeviceId,
				date: inDate	
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

/***********************************************************************************************************
*@function     {*} getInfoFromDbBasedOnTestStatus
*@description  {*} This function is called to send information json request to database after final test
*@returns      {*} Json Message
************************************************************************************************************/

getInfoFromDbBasedOnTestStatus:function(inDeviceId, inTestStatus) {

	var JSONMessage = {
				
				action : '853',
				deviceId: inDeviceId,
				testStatus: "0"	
	}
	console.log("sending: "+JSONMessage);
	return JSONMessage;
	
},

};