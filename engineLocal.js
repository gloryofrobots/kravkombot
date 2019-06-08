
const parent = require("./engine");

module.exports = parent;

module.exports.sendMessage = (ctx, message) => {
  // console.log("ENG LOCAL", message);
  ctx.response.render("pages/test", {data:JSON.stringify(message)});
};