
const model = require("./model")

const PL_ACTIVATE= "PL_ACTIVATE";
const PL_START= "PL_START";
const PL_DEACTIVATE= "PL_DEACTIVATE";
const PL_GROUP = "PL_GROUP";
const PL_PRICE = "PL_PRICE";
const PL_LOCATION = "PL_LOCATION";
const PL_EQUIPMENT = "PL_EQUIPMENT";

const SEP = "::"


function createSimple(txt, quickReplies) {
  var msg ={
    "text": txt
  };
  if (quickReplies) {
    msg.quick_replies = quickReplies;
  }
  // console.log("msg:", msg);
  return msg;
}

function buildPL(holder, id) {
  return holder + SEP + id;
}

module.exports = {
  PL_ACTIVATE:PL_ACTIVATE,
  PL_DEACTIVATE:PL_DEACTIVATE,
  PL_START:PL_START,
  PL_GROUP: PL_GROUP,
  PL_PRICE: PL_PRICE,
  PL_LOCATION: PL_LOCATION,
  PL_EQUIPMENT: PL_EQUIPMENT,

  extractId: (pl) => {
    var parts = pl.split(SEP);
    return parseInt(parts[1])
  },

  disabled: createSimple(
    "Напишите нам Ваш вопрос, мы ответим на него в ближайшее время."
  ),

  groupPrice: (group) => {
    return createSimple(
      "Цена " + group.price + "грн в месяц", 
      [
        {
          "content_type":"text",
          "title":"Интересует другой вопрос?",
          "payload": buildPL(PL_GROUP, group.id)
        }
      ]
    )
  },

  groupLocation: (group) => {
    return createSimple(
      `Время занятий с ${group.start_time} до ${group.end_time}
Место проведения: ${group.address}`,
      [
        {
          "content_type":"text",
          "title":"Интересует другой вопрос?",
          "payload": buildPL(PL_GROUP, group.id)
        }
      ]
    )
  },

  groupEquipment: (group) => {
    var info = group.equipment.join(", ") + "\n" +
        "(Если у Вас нет перчаток, на первых порах можно пользоваться общими)"

    return createSimple(
      info,
      [
        {
          "content_type":"text",
          "title":"Интересует другой вопрос?",
          "payload": buildPL(PL_GROUP, group.id)
        }
      ]
    )
  },

  group: (group) => {
    return createSimple(
      "Что Вас интересует?", 
      [
        {
          "content_type":"text",
          "title":"Цена занятий",
          "payload": buildPL(PL_PRICE, group.id)
        },
        {
          "content_type":"text",
          "title":"Время и место занятий",
          "payload": buildPL(PL_LOCATION, group.id)
        },
        {
          "content_type":"text",
          "title":"Снаряжение для занятий",
          "payload": buildPL(PL_EQUIPMENT, group.id)
        },
        {
          "content_type":"text",
          "title":"Другая группа",
          "payload": PL_ACTIVATE
        }
      ]
    )
  },

  activated:  (groups) => {
    let quicks = groups.map(function (group) {
      return {
          "content_type":"text",
          "title":group.name,
          "payload": buildPL(PL_GROUP, group.id)
      }
    });
    return createSimple(
      "Какая группа Вас интересует?", quicks
    )
  },

  start: (name)=> {
    var message = "";
    if (name) {
      message = "Здравствуйте, " + name + ".\n";
    }
    message += "К нашей страничке подключен чат-бот, " +
      "который может помочь Вам с ответами на наиболее распространенные вопросы. " + "Хотите его активировать?"

    return createSimple(
      message, 
      [
        {
          "content_type":"text",
          "title":"Да",
          "payload": PL_ACTIVATE
        },
        {
          "content_type":"text",
          "title":"Нет, хочу общаться с человеком",
          "payload": PL_DEACTIVATE
        }
      ]
    )
  }

}
