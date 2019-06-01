
const request = require('request');
const cfg = require('./cfg');

function sendMessage(ctx, message) {
    // Construct the message body
    console.log('message to be sent: ', message);
    let request_body = {
        "recipient": {
        "id": ctx.senderPSID
        },
        "message": message
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "url": `${cfg.FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
        "qs": { "access_token": cfg.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log("Message Sent Response body:", body);
        if (err) {
        console.error("Unable to send message:", err);
        }
    });
};

function sendToProfile(data){
    request({
        "url": `${cfg.FACEBOOK_GRAPH_API_BASE_URL}me/messenger_profile`,
        "qs": { "access_token": cfg.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": data
    }, (err, res, body) => {
        console.log("sendToProfile Response body:", body);
        if (err) {
        console.error("Unable to send to profile :", err);
        }
    });
}

function deleteFromProfile(fields) {
    request({
        "url": `${cfg.FACEBOOK_GRAPH_API_BASE_URL}me/messenger_profile`,
        "qs": { "access_token": cfg.PAGE_ACCESS_TOKEN },
        "method": "DELETE",
        "json": {fields:fields}
    }, (err, res, body) => {
        console.log("deleteFromProfile Response body:", body);
        if (err) {
        console.error("Unable to delete from profile:", err);
        }
    });

}

function context(senderPSID, res){
  return {
    response:res,
    senderPSID:senderPSID
  };
}

function fburl(ctx){
    return `${cfg.FACEBOOK_GRAPH_API_BASE_URL}${senderPSID}`;
}

function renderPlain(res, message) {
  res.render("pages/test", {data:message});
}

module.exports = {
  sendMessage: sendMessage,
  sendToProfile: sendToProfile,
  deleteFromProfile: deleteFromProfile,
  context: context,
  renderPlain:renderPlain,
  fburl:fburl
};