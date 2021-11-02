const { Pool } = require('pg')
const dbConfig = {
  user:"postgres",
  password:"961129",
  database:"gis1",
  host:"localhost",
  port:"5432"
}
const pool = new Pool(dbConfig)

module.exports = pool