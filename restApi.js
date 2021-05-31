/*********************************************************************************************************************
*
*     Name:                clientGatewayApi
*     Version:             1.0
*     Author:				   Pooja Seethur
*     Description:         This is the javascript file having source code for a rest Api which responds to get
*							      list of devices, actuators, get timesheet and delete timesheet
*
**********************************************************************************************************************/

/********Node modules required**********/

var express = require('express');
var app = express();
var responseObj = require('./jsonResp.json');

/* Adding piece of middleware for parsing request*/

app.use(express.json());

/********Send device List for user**********/

app.post('/api/deviceList', (req, res) => {

   console.log("Got a GET request for getDeviceList");
   const individualDeviceList = responseObj.userIdentifier.find(c => c.userId ===(req.body.userId));
   if(!individualDeviceList) res.status(404).send({"resp":"GET_DEVICE_LIST","statusCode":"404"});
   res.send(individualDeviceList);

})

/********Send actuator List for user**********/

app.post('/api/actuatorList', (req, res) => {

   console.log("Got a GET request for getActuatorList");
   const individualActuatorList = responseObj.deviceIdentifier.find(c => c.deviceId ===(req.body.deviceId));
   if(!individualActuatorList) res.status(404).send({"resp":"GET_ACTUATOR_LIST","statusCode":"404"});
   res.send(individualActuatorList);

})

/********Send timesheet for user**********/

app.post('/api/reqTimesheet', (req, res) => {

   console.log("Got a GET request for Timesheet");

   /*********Check for actuator Id and retreive data**********/

   if((req.body.actuatorId) === "OTSAID001"){
      //const actOneTimeSheet = responseObj.timeActuatorOne.find(c => c.weekDay ===(req.body.weekDay));
      const actOneTimeSheet = responseObj.actOneTimeVerTwo;
      if(!actOneTimeSheet) res.status(404).send({"resp":"GET_TIMER_SHEET","statusCode":"404","descp":"Timesheet for selected actuator not found!"});
      res.send(actOneTimeSheet);
   }

   else if((req.body.actuatorId) === "OTSAID002"){
      //const actTwoTimeSheet = responseObj.timeActuatorTwo.find(c => c.weekDay ===(req.body.weekDay));
      const actTwoTimeSheet = responseObj.actTwoTimeVerTwo;
      if(!actTwoTimeSheet) res.status(404).send({"resp":"GET_TIMER_SHEET","statusCode":"404","descp":"Timesheet for selected actuator not found!"});
      res.send(actTwoTimeSheet);
   }

}
)

/********************* delete timesheet ********************/

app.post('/api/deleteTimeSheet', (req, res) =>{

   console.log("Got a GET request for deleting Timesheet");
      res.send( {"resp":"DELETE_TIMER","statusCode":"200","actuatorId":req.body.actuatorId,"description":"Timer deleted successfully"})
}
)

/********************* set timesheet ********************/

app.post('/api/setTimeSheet', (req, res) =>{

   console.log("Got a GET request for setting Timesheet");
      res.send( {"resp":"SET_TIMER","statusCode":"200","actuatorId":req.body.actuatorId,"description":"Timer set successfully"})
}
)

/********************* delete all timers of a day ********************/

app.post('/api/deleteAllTimers', (req, res) =>{

   console.log("Got a GET request for deleting a day's Timers");
      res.send( {"resp":"DELETE_ALL_TIMER","statusCode":"200","actuatorId":req.body.actuatorId,"description":"All deleted successfully"})
}
)

/********************* Set Port ********************/

const port = process.env.PORT || 5400;

app.listen(port, () =>  console.log(`Listening on port ${port}.....`) );   //const port = process.env.PORT || 8082; and serial printing use $(port)