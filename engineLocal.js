
const parent = require("./engine");

module.exports = parent;

module.exports.sendMessage = (ctx, message) => {
  ctx.response.render("pages/test", {data:JSON.stringify(message)});
};