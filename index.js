'use strict';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PL_YES = 'PL_YES';
const PL_NO = 'PL_NO';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Return a '200 OK' response to all events
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;

  if (body.object === 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      if (body.entry && body.entry.length <= 0){
        return;
      }
      body.entry.forEach((pageEntry) => {
        // Iterate over each messaging event and handle accordingly
        pageEntry.messaging.forEach((messagingEvent) => {
          console.log({messagingEvent});
          if (messagingEvent.postback) {
            handlePostback(messagingEvent.sender.id, messagingEvent.postback);
          } else if (messagingEvent.message) {
            if (messagingEvent.message.quick_reply){
              handlePostback(messagingEvent.sender.id, messagingEvent.message.quick_reply);
            } else{
              handleMessage(messagingEvent.sender.id, messagingEvent.message);
            }
          } else {
            console.log(
              'Webhook received unknown messagingEvent: ',
              messagingEvent
            );
          }
        });
      });
    }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, message) {
  // check if it is a location message
  console.log('handleMEssage message:', JSON.stringify(message));
  handlePostback(sender_psid, {payload: GREETING});
  return;
}


function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response and udpate db based on the postback payload
  switch (payload){
    case PL_YES:
      nandleYes(sender_psid);
      break;
    case PL_NO:
      nandleNo(sender_psid);
      break;
    case GREETING:
      handleGreetingPostback(sender_psid)
      break;
    default:
      console.log('Cannot differentiate the payload type');
  }
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log('message to be sent: ', response);
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "url": `${FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log("Message Sent Response body:", body);
    if (err) {
      console.error("Unable to send message:", err);
    }
  });
}

function handleConfirmLocation(sender_psid, geocoding_location, geocoding_formattedAddr){
  console.log('Geocoding api result: ', geocoding_location);
  const query = {$and: [{'user_id': sender_psid}, { 'status': AUSTRALIA_YES }]};
  const update = {
    $set: { "location.lat": geocoding_location.lat, "location.long": geocoding_location.lng, status: AU_LOC_PROVIDED }
  };
  const options = {upsert: false, new: true};

  ChatStatus.findOneAndUpdate(query, update, options, (err, cs) => {
    console.log('handleConfirmLocation update location:', cs);
    if (err){
      console.log('handleConfirmLocation Error in updating coordinates:', err);
    } else if (cs){
      const response = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":`${geocoding_formattedAddr}. Is it your address?`,
            "buttons":[
              {
                "type":"postback",
                "payload": AU_LOC_PROVIDED,
                "title":"Yes"
              },
              {
                "type":"postback",
                "payload": AUSTRALIA_YES,
                "title":"No"
              }
            ]
          }
        }
      };
      callSendAPI(sender_psid, response);
    }
  });
}


function handleNo(sender_psid){
  const payload = {
    "text": "Well this is somewhat homoerotic"
  };
  callSendAPI(sender_psid, payload);
}

function handleYes(sender_psid){
  const payload = {
    "text": "Good for you but try to think about Jesus some more "
  };
  callSendAPI(sender_psid, payload);
}

function handleGreetingPostback(sender_psid){
  request({
    url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, function(error, response, body) {
    var greeting = "";
    if (error) {
      console.log("Error getting user's name: " +  error);
    } else {
      var bodyObj = JSON.parse(body);
      const name = bodyObj.first_name;
      greeting = "Hi " + name + ". ";
    }
    const message = greeting + "Who do you love more?";
    const greetingPayload = {
      "text": message,
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Sasha Gray",
          "payload": PL_YES
        },
        {
          "content_type":"text",
          "title":"Jesus",
          "payload": PL_NO
        }
      ]
    };
    callSendAPI(sender_psid, greetingPayload);
  });
}


