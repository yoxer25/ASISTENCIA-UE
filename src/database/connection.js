import mysql from "mysql2/promise";

const configMysql = {
  host: process.env.HOSTDB,
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  database: process.env.NAMEDB,
  port: process.env.PORTDB,
};
const pool = mysql.createPool(configMysql);

try {
  const connection = await pool.getConnection();
  // ... some query

  if (connection) {
    connection.release();
    console.log("CONECTADO A LA BASE DE DATOS");
  }
} catch (err) {
  console.log(err);
}

export default pool;
