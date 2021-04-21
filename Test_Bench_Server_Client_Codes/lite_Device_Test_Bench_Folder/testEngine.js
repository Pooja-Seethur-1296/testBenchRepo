
var Request = require("request"); 
var config=require("./config/config");
module.exports={

    /*********************************************************************************************************
 * @function     {*} getTesterInformation()
 * @param        {*} inConnId 
 * @param        {*} inComingMessage 
 * @param        {*} callBack 
 * @description  {*} Function called to get test information
 *********************************************************************************************************/
getTesterInformation:function(inConnId,inComingMessage,callBack){
    try{
        
        

        module.exports.getTesterInfoFromDb(inConnId,inComingMessage,function(err,outConnectionId,response,responseCode)       {
            try{
                if(err) {
                    var jsonMessage={
                        resp:inComingMessage.action,
                        statusCode:config.generalErrorCode
                    }
                    callBack(null,outConnectionId,jsonMessage);
                    return;
                }
                
                if(responseCode === config.successCode){
                    let resp=JSON.parse(response);
                   
                    var jsonMessage={
                        resp:inComingMessage.action,
                        result:resp
                    }
                    console.log(jsonMessage);
                    callBack(null,outConnectionId,jsonMessage);
                    return;
                
                   
                    
                    
                }else{
                    var jsonMessage={
                        resp:inComingMessage.action,
                        statusCode:responseCode
                    }
                    callBack(null,outConnectionId,jsonMessage);
                    return;
                }
                
            }catch(err){
               console.log("Reference/Syntax Error"+" "+err);
                var jsonMessage={
                    resp:inComingMessage.action,
                    statusCode:config.generalErrorCode
                }
                callBack(null,outConnectionId,jsonMessage);
                return;
            }
        });
    }catch(err){
        console.log("Reference/Syntax Error"+" "+err);
        var jsonMessage={
            resp:inComingMessage.action,
            statusCode:config.generalErrorCode
        }
        callBack(null,inConnId,jsonMessage);
        return;
    }
},


/*******************************************************************************************************
 * @function    {*} addTesterInformation
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to add test information in db
 ********************************************************************************************************/

    addTesterInformation:function(inConnId,inComingMessage,callBack){
        try{
            
           module.exports.pushTesterInformationTodb(inConnId,inComingMessage,function(err,outConnectionId,respCode){  //This function caled to add actuator
                    try{
                        if(err){
                            var jsonMessage={
                                resp:inComingMessage.action,
                                statusCode:config.generalErrorCode
                            }
                            callBack(null,outConnectionId,jsonMessage);
                            return;
                        }
                        if(respCode === config.successCode){
							var jsonMessagetoUser={
                                resp:inComingMessage.action,
                                statusCode:respCode
                            }
                            callBack(null,outConnectionId,jsonMessagetoUser);
							}else{
                                var jsonMessage={
                                    resp:inComingMessage.action,
                                    statusCode:respCode
                                }
                                callBack(null,outConnectionId,jsonMessage);
                                return;;
							}
						}catch(err){
							console.log("Reference/Syntax Error"+" "+err);
                             var jsonMessage={
                                 resp:inComingMessage.action,
                                 statusCode:config.generalErrorCode
                            }
                            callBack(null,inConnId,jsonMessage);
                            return;
						}
                });
            	
        }catch(err){
            console.log("Reference/Syntax Error"+" "+err);
             var jsonMessage={
                  resp:inComingMessage.action,
                  statusCode:config.generalErrorCode
            }
            callBack(null,inConnId,jsonMessage);
            return;
        }
    },
    /*******************************************************************************************************
 * @function    {*} getTesterInfoFromDb
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to get tester information from db
 ********************************************************************************************************/

getTesterInfoFromDb:function(inConnId,inComingMessage,callBack){
    try{
        Request.get({
            "headers": { "content-type": "application/json" },
            "url":  config.apiBaseURL+"/tester/testerName",
            "body": JSON.stringify({
                "testerName":inComingMessage.testerName
                
            })
        }, (error, response, body) => {
            try{
                if(error) {
                    console.log("DB Error"+" "+error);
                    callBack(null,inConnId,null,config.dbErrorCode);
                    return;
                }
                console.log(JSON.parse(body).length);
                if((response.statusCode === config.successCode) && (body.length === 0)){
                    callBack(null,inConnId,null,config.notFoundErrorCode);
                    return;
                }else if((response.statusCode === config.successCode) && (body.length > 0)){
                    callBack(null,inConnId,body,response.statusCode);
                    return;
                }else{
                    callBack(null,inConnId,null,response.statusCode);
                    return;
                }
               
            }catch(err){
                console.log("Reference/Syntax Error"+" "+err);
                callBack(null,inConnId,null,config.generalErrorCode);
                return;
            }
        })
    }catch(err){
       console.log("Reference/Syntax Error"+" "+err);
        callBack(null,inConnId,null,config.generalErrorCode);
        return;
    }
},
/*********************************************************************************************
 * @function    {*} pushTesterInformationTodb()
 * @param       {*} inConnId 
 * @param       {*} inComingMessage 
 * @param       {*} callBack 
 * @description {*} Function called to push tester information to db
 *********************************************************************************************/
pushTesterInformationTodb:function(inConnId,inComingMessage,callBack){
    try{
    Request.post({
        "headers": { "content-type": "application/json" },
        "url": config.apiBaseURL+"/tester",
        "body": JSON.stringify({
            "testerName":inComingMessage.testerName,
            "deviceId" : inComingMessage.deviceId,
            "version" :  inComingMessage.version,
            "testResult" : inComingMessage.testResult
            
        })
    }, (error, response, body) => {
                try{
                    if(error) {
                        console.log("DB Error"+" "+error);
                        callBack(null,inConnId,config.dbErrorCode);
                        return;
                        
                    }
                    if((response.statusCode === config.successCode) && (JSON.parse(body).nModified === 1)){ //if Sensor Node Added Successfuly
                        callBack(null,inConnId,response.statusCode); 
                        return;
                    }else if((response.statusCode === config.successCode) && (JSON.parse(body).nModified === 0)){
                        callBack(null,inConnId,config.notFoundErrorCode); 
                        return;
                    }else{
                        callBack(null,inConnId,response.statusCode); 
                        return;
                    }
                }catch(err){
                    console.log("Reference/Syntax Error"+" "+err);
                    callBack(null,inConnId,config.generalErrorCode);
                    return;
                }
            });
        
    }catch(err){
        console.log("Reference/Syntax Error"+" "+err);
        callBack(null,inConnId,config.generalErrorCode);
        return;
    }
}
}
