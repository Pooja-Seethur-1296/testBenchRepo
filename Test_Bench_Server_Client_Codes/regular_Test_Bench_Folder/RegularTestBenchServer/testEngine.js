
var Request = require("request"); 
var config=require("./configaration/config");
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

/*********************************************************************************************************
 * @function     {*} getTesterInformationBasedOnDate()
 * @param        {*} inConnId 
 * @param        {*} inComingMessage 
 * @param        {*} callBack 
 * @description  {*} Function called to get test information
 *********************************************************************************************************/
getTesterInformationBasedOnDate:function(inConnId,inComingMessage,callBack){
    try{
        
        

        module.exports.getTesterInfoFromDbBasedOnDate(inConnId,inComingMessage,function(err,outConnectionId,response,responseCode)       {
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


  /*********************************************************************************************************
 * @function     {*} getTesterInformationBasedOnTestStatus()
 * @param        {*} inConnId 
 * @param        {*} inComingMessage 
 * @param        {*} callBack 
 * @description  {*} Function called to get test information
 *********************************************************************************************************/
getTesterInformationBasedOnTestStatus:function(inConnId,inComingMessage,callBack){
    try{
        
        

        module.exports.getTesterInfoFromDbBasedOnTestStatus(inConnId,inComingMessage,function(err,outConnectionId,response,responseCode)       {
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
 * @function    {*} getTesterInfoFromDbBasedOnTestStatus
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to get tester information from db
 ********************************************************************************************************/

getTesterInfoFromDbBasedOnTestStatus:function(inConnId,inComingMessage,callBack){
    try{
        Request.get({
            "headers": { "content-type": "application/json" },
            "url":  config.apiBaseURL+"/tester/testerStatus",
            "body": JSON.stringify({
                "testerStatus": inComingMessage.testStatus,
                "deviceId":inComingMessage.deviceId
                
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

 /*******************************************************************************************************
 * @function    {*} getTesterInfoFromDbBasedOnDate
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to get tester information from db
 ********************************************************************************************************/

getTesterInfoFromDbBasedOnDate:function(inConnId,inComingMessage,callBack){
    try{
        Request.get({
            "headers": { "content-type": "application/json" },
            "url":  config.apiBaseURL+"/tester/date",
            "body": JSON.stringify({
                "date": inComingMessage.date,
                "deviceId":inComingMessage.deviceId
                
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


/*********************************************************************************************************
 * @function     {*} getTesterInformationBasedOnDeviceId()
 * @param        {*} inConnId 
 * @param        {*} inComingMessage 
 * @param        {*} callBack 
 * @description  {*} Function called to get test information
 *********************************************************************************************************/
getTesterInformationBasedOnDeviceId:function(inConnId,inComingMessage,callBack){
    try{
        
        

        module.exports.getTesterInfoFromDbBasedOnDeviceId(inConnId,inComingMessage,function(err,outConnectionId,response,responseCode)       {
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
 * @function    {*} getTesterInfoFromDbBasedOnDeviceId
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to get tester information from db
 ********************************************************************************************************/

getTesterInfoFromDbBasedOnDeviceId:function(inConnId,inComingMessage,callBack){
    try{
        Request.get({
            "headers": { "content-type": "application/json" },
            "url":  config.apiBaseURL+"/tester/deviceId",
            "body": JSON.stringify({
                "deviceId":inComingMessage.deviceId
                
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




/*******************************************************************************************************
 * @function    {*} addTesterInformation
 * @param       {*} inConnId 
 * @param       {*} inComingMessage
 * @param       {*} callBack 
 * @description {*} Function called to add test information in db
 ********************************************************************************************************/

    addTesterInformation:function(inConnId,inComingMessage,callBack){
        try{
            
           module.exports.pushTesterInformationTodb(inConnId,inComingMessage,function(err,outConnectionId,respCode){  //This function caled to add tester information
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
