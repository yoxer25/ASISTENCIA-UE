import mysql from 'mysql'
import { promisify } from 'util'
const configMysql = {
    host: "localhost",
    user: 'root',
    password: '',
    database: 'asistenciaugel'
}
const pool = mysql.createPool(configMysql);
pool.getConnection((err, connection) => {
    if (err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('LA CONEXIÓN DE LA BASE DE DATOS SE CERRÓ');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('LA BASE DE DATOS TIENE MUCHAS CONEXIONES');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('LA CONEXIÓN A LA BASE DE DATOS FUE RECHAZADA')
        }
    }

    if (connection) connection.release();
    console.log('CONECTADO A LA BASE DE DATOS');
    return;
});

pool.query = promisify(pool.query);

export default pool