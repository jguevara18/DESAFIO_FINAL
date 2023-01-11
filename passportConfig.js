const LocalStrategy = require("passport-local").Strategy;
// permite autenticar usuarios utilizando un nombre de usuario y una contraseña
const { pool } = require ("./dbconfig.js");
const bcrypt = require ("bcrypt");
const passport = require("passport");


function inizialize(passport){
//se encarga de configurar las estrategias de autenticación y serialización/deserialización de usuarios.
    const authUser = (email, password, relize) =>{
        pool.query(
            `SELECT * FROM users WHERE email = $1`, [email],
            (err, result) => {
                if (err) {
                    throw err;
                }
                console.log(result.rows);
                if (result.rows.length >0) {
                    const user = result.rows[0]

                    bcrypt.compare(password, user.password, (err, isMatch)=>{
                        if(err) {
                            throw err;
                        }
                        if (isMatch) {
                            return relize(null, user)
                        }else{
                            return relize (null, false, {
                                message: "contrasena invalida",
                            });
                        }
                    });
                }else {
                    return relize(null, false, {
                        message: "Correo Electtronico  no registrado",
                    });
                }
            }

        )
    };


    passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    authUser
    )
    );
    
    passport.serializeUser((user, relize) => relize(null, user.id));
    passport.deserializeUser((id, relize)=>{
      pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, result)=>{
            if (err){
                throw err;
            }
            return relize(null, result.rows[0]);
        });
    });

};

module.exports = inizialize;

//serializeUser se encarga de tomar un objeto de usuario y 
//convertirlo en una información que pueda ser almacenada en una sesión, 
//mientras que deserializeUser hace lo contrario, toma esa información y la convierte en un objeto de usuario. Estas dos funciones son necesarias para poder 
//almacenar y recuperar información de usuario en sesión.