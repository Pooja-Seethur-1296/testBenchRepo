module.exports = {

/***********************************************************************************************************
*
*    Function     : oGetDeviceCurrentInfo
*
*    Description  : Gives back device information acknowledgement obtained from device to app
*
************************************************************************************************************/

	oSendDeviceCurrentInfo:function(inDeviceId,inState,inMode) {

		var JSONMessage = {
                    resp : 'GET_DEVICE_CURRENT_INFO',
                    statusCode : 200,
                    deviceId : inDeviceId,
                    state : inState,
                    mode : inMode			
		}
		console.log("sending: "+JSONMessage);
		return JSONMessage;
		
    },
    
/***********************************************************************************************************
*
*    Function     : oModeChangeInfo
*
*    Description  : Gives back mode change information acknowledgement obtained from device to app
*
************************************************************************************************************/

oModeChangeInfo:function(inDeviceId,inState,inMode) {

    var JSONMessage = {
                resp : 'MODE_CHANGE_REQ',
                statusCode : 200,
                deviceId : inDeviceId,
                state : inState,
                mode : inMode			
    }
    console.log("sending: "+JSONMessage);
    return JSONMessage;
    
},

/***********************************************************************************************************
*
*    Function     : oManualOnOrOff
*
*    Description  : Gives back manual On/Off information acknowledgement obtained from device to app
*
************************************************************************************************************/

oManualOnOrOff:function(inDeviceId,inState,inFlow,inFlowRate) {

    var JSONMessage = {
                resp : 'MOTOR_ON_OFF_REQ',
                statusCode : 200,
                deviceId : inDeviceId,
                state : inState,
                flow: inFlow,
                flowRate: inFlowRate,
                	
    }
    console.log("sending: "+JSONMessage);
    return JSONMessage;
    
},

/***********************************************************************************************************
*
*    Function     : oSetTimerSheet(104/105)
*
*    Description  : Gives back timer information acknowledgement obtained from device to app 
*
************************************************************************************************************/

oSetTimerSheet:function(inDeviceId) {

    var JSONMessage = {
                resp : 'SET_TIMER',
                statusCode : 200,
                deviceId : inDeviceId
                	
    }
    console.log("sending: "+JSONMessage);
    return JSONMessage;
    
}

};