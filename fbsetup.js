
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
            "type":"web_url",
            "title":"Info",
            "url":"https://kravkombot.herokuapp.com/groups",
            "webview_height_ratio":"tall",
            "messenger_extensions": "true"
            }
        ]
        }
    ]
    }
}

let get_started = {"get_started":{"payload":"GREETING"}}

// engine.sendToProfile(get_started);
engine.sendToProfile(persistent_menu());
// engine.deleteFromProfile(["get_started"]);