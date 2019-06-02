

const { Pool } = require('pg');

const GROUPS = [
    {
      id:1, name:"Крав мага с нуля",
      price:1300,
      equipment:["Перчатки для рукопашного боя", "Капа"],
      address: `
        г. Киев, ст. метро Университет, Вокзальная
        ул. Жилянская, 75
      `
    },
    {
      id:2,
      name:"Комбативз",
      price:1300,
      equipment:["Перчатки для рукопашного боя", "Капа", "Жесткие щитки на ноги"],
      address: `
        г. Киев, ст. метро Олимпийская, Институт Физкультуры
        ул. Физкультуры, 1
      `
    }
];

const pool = new Pool({
  "connectionString": process.env.DATABASE_URL,
  "ssl": true
});

async function loadTest() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    var data = result.rows;
    client.release();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function loadGroups() {
  return GROUPS;
}

async function loadGroup(id){
  let groups  = await loadGroups();
  return groups[id - 1];
}

module.exports = {
  loadTest:loadTest,
  loadGroup:loadGroup,
  loadGroups:loadGroups
}