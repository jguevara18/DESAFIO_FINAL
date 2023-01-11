require('dotenv').config(); // almacenar valores como credenciales de base de datos

const { Pool }  = require('pg');//permite conectarse y interactuar con una base de datos PostgreSQL.

const config = {
    user: "postgres",
    host: "localhost",
    password: "14953478",
    database: "loginusuario"
};
const pool = new Pool(config);

module.exports = { pool };