
/*Make status code dynamic by passing the status code as parameter to the function*/

module.exports = {
	
/***********************************************************************************************************
*
*    Function     : oAssignClientId
*
*    Description  : This function is called to generate unique clientId to the client that has requested it.
*
*    Returns      : clienteeId
*
************************************************************************************************************/
	
	oAssignClientId:function(statusCodes) {

		var clienteeId =  Math.random().toString(36).substring(2, 15);
		console.log("Client ID is generated "+clienteeId);
			var JSONMessage = {
                    resp : 'APP_INIT',
					statusCode: statusCodes,
                    clientId : clienteeId
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oErrorInAssignClientId
*
************************************************************************************************************/
	
	oErrorInAssignClientId:function() {

		var clienteeId =  Math.random().toString(36).substring(2, 15);
		console.log("Client ID is generated "+clienteeId);
			var JSONMessage = {
                    resp : 'APP_INIT',
					statusCode: 404,
                    clientId : clienteeId
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oEnterActivationApp
*
*    Description  : This function is called to generate unique clientId to the client that has requested it.
*
*    Returns      : clienteeId
*
************************************************************************************************************/
	
	oEnterActivationApp:function(statusCodes) {

			var JSONMessage = {
                    resp : 'SWMS_INIT',
					statusCode: statusCodes,
                    deviceId : '1234'
					
		}
		
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oGetDeviceList
*
*    Description  : This function is called to obtain device information for the entered device ID.
*
*    Returns      : Json containing list of devices
*
************************************************************************************************************/

	oGetDeviceList:function(inClientID,statusCodes) {

		var JSONMessage = {
					resp : 'GET_DEVICE_LIST',
					//clientId : inClientID,
					statusCode: statusCodes,
					deviceList:[{
								deviceId : "1234",
								deviceName : "Test device"
								//deviceName: 
								//"Test Device",
								//"Lawn area"
					
					}]}
		console.log(JSONMessage);
		//console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oGetDeviceInfo
*
*    Description  : This function is called to obtain device information for the entered device ID.
*
*    Returns      : Json containing list of devices
*
************************************************************************************************************/

	oGetDeviceInfo:function() {

		var JSONMessage = {
                    resp : 'GET_DEVICE_INFO',
					statusCode: 200,
                    deviceId: '1234',
					deviceStatus: 'Active',
					lastWaterTime:'05:30',
					timeSheet:	{	TU:'11350511'
                        //MO:'10:30',
                        //TU:'11:00',
                        //WE:'16:00',
                        //TH:'08:00',
                        //FR:'08:30',
						//SA:'10;00'   
					}
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oGetDeviceCurrentInfo
*
*    Description  : This function is called to obtain device information for the entered device ID.
*
*    Returns      : Json containing list of devices
*
************************************************************************************************************/

	oGetDeviceCurrentInfo:function() {

		var JSONMessage = {
                    resp : 'GET_DEVICE_CURRENT_INFO',
					statusCode: 200,
                    deviceId: 'GOTSGID001',
					status: 1,
					mode: 'M'
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},

/***********************************************************************************************************
*
*    Function     : oRequestToChangeMode
*
*    Description  : This function is called to obtain device information for the entered device ID.
*
*    Returns      : Json containing list of devices
*
************************************************************************************************************/

	oRequestToChangeMode:function(newMode) {

		var JSONMessage = {
                    resp : 'MODE_CHANGE_REQ',
					statusCode: 200,
                    deviceId: 'GOTSGID001',
					status: 1,
					mode: newMode
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},
	
/***********************************************************************************************************
*
*    Function     : oManualOnOff
*
*    Description  : This function is called to obtain device information for the entered device ID.
*
*    Returns      : Json containing list of devices
*
************************************************************************************************************/

	oManualOnOff:function(inStatus) {

		if (inStatus === '1'){
			var waterFlow = 1;
			var waterInLiter = 5;
		}
		else if(inStatus === '0'){
			var waterFlow = 0 ;
			var waterInLiter = 0;
		}

		var JSONMessage = {
                    resp : 'MOTOR_ON_OFF_REQ',
					statusCode: 200,
                    deviceId: 'GOTSGID001',
					state: inStatus,
					flow: waterFlow,
					flowrate: waterInLiter
					
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
	},


//};

/***********************************************************************************************************
*
*    Function     : oActionCounterStatusCode
*
*    Description  : This function is called to generate unique clientId to the client that has requested it.
*
*    Returns      : clienteeId
*
************************************************************************************************************/
	
	oActionCounterStatusCode:function(inactionCounter) {
		
		console.log('Got inactionCounter!!');
		switch (inactionCounter){
			
			case 1 : var toSendStatusCode = 200;
			break;
			case 2 : var toSendStatusCode = 200;
			break;
			case 4 : var toSendStatusCode = 200;
			break;
			case 3 : var toSendStatusCode = 404;
			break;
			case 6 : var toSendStatusCode = 404;
			break;
			case 5 : var toSendStatusCode = 400;
			break;
			
		/*if((inactionCounter === 1) || (inactionCounter === 2) || (inactionCounter === 4)){
			var toSendStatusCode = 200;
		}
		else if((inactionCounter === 3) || (inactionCounter === 6)){
			var toSendStatusCode = 404;
		}
		else if(inactionCounter === 5){
			var toSendStatusCode = 400;
		}*/}
		console.log("sending: "+ toSendStatusCode);
		return toSendStatusCode;
		
	},
	
};