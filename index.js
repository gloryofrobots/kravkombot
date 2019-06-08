'use strict';

const LOCAL = process.env.LOCAL !== undefined;
console.log("LCL", LOCAL);

// if (LOCAL){
//     engine = require("./engineLocal");
//     // let fbsetup = require("./fbsetup");
//     // fbsetup(app);
// } else{
//     engine = require("./engine");
// }

const engine = require(LOCAL === true ? "./engineLocal" : "./engine");

const
  cfg = require("./cfg"),
  messages = require("./messages"),
  model = require("./model"),
  request = require('request'),
  util = require('util'),
  express = require('express'),
  body_parser = require('body-parser'),
  path = require('path');

  // creates express http server
const app = express()
  .use(body_parser.json()) 
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');


let asyncRequest = util.promisify(request);


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => {
  console.log('webhook is listening');
  // console.log(VERIFICATION_TOKEN);
  // console.log(PAGE_ACCESS_TOKEN);
});


// app.get('/setup', async (req, res) => {
//   let mode= req.query["mode"];
//   if (mode == "get_started") {
//     engine.sendProfile({"get_started":{"payload":"GREETING"}});
//   } else {
//     renderPlain(res, "Unknown setup mode");
//   }
// });

app.get('/group', async (req, res) => {
  let id = req.query["id"];
  if (!id) {
    console.error("INVALID GROUP ID");
    res.status(404);
    return;
  }
  let group = await model.loadGroup(id);
  res.render('pages/group', {group:group} );
});

app.get('/groups', async (req, res) => {
  try {
    var groups = await model.loadGroups();
    res.render('pages/groups', { 'groups': groups } );
  } catch (err) {
    res.send("Error " + err);
  }
});

app.get('/db', async (req, res) => {
  try {
    const results = await model.loadTest();
    res.render('pages/db', {results:results} );
  } catch (err) {
    res.send("Error " + err);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/test', (req, res) => {
  // Parse params from the webhook verification request
  let pb = req.query['pb'];
  let ctx = engine.context("TESTUSER", res);
  // Set the response and udpate db based on the postback payload
  if (pb){
    console.log("postback is", pb);
    handlePostback(ctx, {payload:pb});
    res.status(200);
  } else {
    console.log("postback unspecified");
    res.status(404);
  }
  // Return a '200 OK' response to all events
});


// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Return a '200 OK' response to all events
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;
  const ctx = engine.context(messagingEvent.sender_id, res);

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
            handlePostback(ctx, messagingEvent.postback);
          } else if (messagingEvent.message) {
            if (messagingEvent.message.quick_reply){
              handlePostback(ctx, messagingEvent.message.quick_reply);
            } else{
              handleMessage(ctx, messagingEvent.message);
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

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  console.log("VERIFICATION", cfg.VERIFICATION_TOKEN, token);
  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === cfg.VERIFICATION_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

function handleMessage(ctx, message) {
  // check if it is a location message
  console.log('handleMEssage message:', JSON.stringify(message));
  handlePostback(ctx, {payload: messages.PL_START});
  return;
}

function handlePostback(ctx, postback) {
  // Get the payload for the postback
  const payload = postback.payload;
  // Set the response and udpate db based on the postback payload
  console.log("payload", payload);
  if (payload == messages.PL_START) {
      handleStart(ctx);
  } else if (payload == messages.PL_ACTIVATE) {
      handleActivate(ctx);
  } else if (payload == messages.PL_DEACTIVATE) {
      handleDeactivate(ctx);
  } else if (payload.startsWith(messages.PL_GROUP)) {
    var id = messages.extractId(payload)
    handleGroup(ctx, id);
  } else if (payload.startsWith(messages.PL_PRICE)) {
    var id = messages.extractId(payload)
    handleGroupPrice(ctx, id);
  } else if (payload.startsWith(messages.PL_LOCATION)) {
    var id = messages.extractId(payload)
    handleGroupLocation(ctx, id);
  } else if (payload.startsWith(messages.PL_EQUIPMENT)) {
    var id = messages.extractId(payload)
    handleGroupEquipment(ctx, id);
  } else {
      console.log('Cannot differentiate the payload type');
  }
}

function handleDisable(ctx){
  engine.sendMessage(ctx, messages.disabled);
}

async function handleActivate(ctx){
  var groups = await model.loadGroups()
  var msg = await messages.activated(groups)
  engine.sendMessage(ctx, msg);
}

async function handleGroup(ctx, id){
  var group = await model.loadGroup(id);
  var msg = messages.group(group)
  engine.sendMessage(ctx, msg);
}

async function handleGroupPrice(ctx, id){
  var group = await model.loadGroup(id);
  var msg = messages.groupPrice(group)
  engine.sendMessage(ctx, msg);
}

async function handleGroupEquipment(ctx, id){
  var group = await model.loadGroup(id);
  var msg = messages.groupEquipment(group)
  engine.sendMessage(ctx, msg);
}

async function handleGroupLocation(ctx, id){
  var group = await model.loadGroup(id);
  var msg = messages.groupLocation(group)
  engine.sendMessage(ctx, msg);
}


function handleStart(ctx){
  return;
  request({
    url: engine.fburl(ctx),
    qs: {
      access_token: cfg.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, function(error, response, body) {
    var name = "";
    if (error) {
      console.log("Error getting user's name: " +  error);
    } else {
      var bodyObj = JSON.parse(body);
      name = bodyObj.first_name;
    }
    const message = messages.start(name);
    engine.sendMessage(ctx, greetingPayload);
  });
}



function handleConfirmLocation(ctx, geocoding_location, geocoding_formattedAddr){
  console.log('Geocoding api result: ', geocoding_location);
  const query = {$and: [{'user_id': ctx.senderPSID}, { 'status': AUSTRALIA_YES }]};
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
      engine.sendMessage(ctx, response);
    }
  });
}