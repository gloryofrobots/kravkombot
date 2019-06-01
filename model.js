

const { Pool } = require('pg');

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
  return [
    {id:1, name:"Krav Maga", price:1300, equipment:["gloves", "mouth-piece"]},
    {id:2, name:"Kombatives", price:1100, equipment:["gloves", "mouth-piece", "shin guards"]},
  ];
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