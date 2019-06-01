
const engine = require("./engine");

// module.exports = (app) => {
//     app.get('/setup', (req, res) => {
//         let mode= req.query["mode"];
//         if (mode == "get_started") {
//             engine.sendProfile();
//         } else if (mode == "persistent_menu"){
//             engine.sendProfile(persistent_menu());
//         } else {
//             engine.renderPlain(res, "Unknown setup mode");
//         }
//     });
// }

function persistent_menu(){
    return {
    "persistent_menu":[
        {
        "locale":"default",
        "composer_input_disabled": true,
        "call_to_actions":[
            {
            "title":"My Account",
            "type":"nested",
            "call_to_actions":[
                {
                "title":"Pay Bill",
                "type":"postback",
                "payload":"PAYBILL_PAYLOAD"
                },
                {
                "type":"web_url",
                "title":"Latest News",
                "url":"https://www.messenger.com/",
                "webview_height_ratio":"full"
                }
            ]
            }
        ]
        }
    ]
    }
}

let get_started = {"get_started":{"payload":"GREETING"}}

// engine.sendProfile(get_started);
engine.sendProfile(persistent_menu());