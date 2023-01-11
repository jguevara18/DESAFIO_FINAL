const express = require('express');
const app = express();
const { pool } = require("./dbconfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require ('express-flash');
const passport = require('passport');
const inizializePassport = require("./passportConfig");


inizializePassport(passport);
app.use(express.static('public'));
//middlewere
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(session({ //La sesión se guarda en un cookie en el cliente
    secret: "secret",
    resave: false,
    saveUninitialized: false,//La sesión se guarda en un cookie en el cliente
}));
app.use(flash()); // permiten comunicar al usuario información importante después de una redirección
app.use(passport.session());
app.use(passport.initialize());


app.get('/', (req, res) =>{
    res.render("login");
});

app.get('/users/register', (req, res) =>{
    res.render("register");
});

app.get('/users/login', (req, res) =>{
    res.render("login");
});

app.get('/users/modify', (req, res) =>{
    res.render("modify");
});

app.get('/users/dashboard', (req, res) =>{
    res.render("dashboard", {user: req.user.name});
});


app.post("/users/register", async (req, res)=>{
    let { name, email, password, password2 } = req.body;
    console.log({
        name,
        email,
        password,
        password2,

    });
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({
            message: "la contrasena debe tener mas de 6 caracteres"});
    }
    if(password.length<6) {
        errors.push({ message: "la contrasena debe tener mas de 6 caracteres"});
    }

    if (password != password2){
        errors.push({ message: "las contrasenas no son iguales"});
    }

    if(errors.length>0) {
        res.render('register', { errors});
    } else {
        let encriptPassword = await bcrypt.hash(password, 10);
        console.log(encriptPassword);

        pool.query(`SELECT * FROM users WHERE email = $1`, [email],
        (err, result) =>{
            if(err) {
                throw err;
            }
            console.log(result.rows);
            if(result.rows.length>0) {
                errors.push({ message: "el usuario ya existe, por favor inicie sesion" });
                res.render("register", {errors});
            } else {
                pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
                RETURNING id, password`, [name, email, encriptPassword],
                (err, result)=>{
                    if(err){
                        throw err;
                    }
                    console.log(result.rows);
                    req.flash('success_msg', 'cuenta creada con exito. Puede iniciar sesion');
                    res.redirect("/users/login");
                });
            }}
        )}  
    });



app.post("/users/modify", async (req, res)=>{
    let { email, password } = req.body;
    console.log({
        email,
        password,
        
    });
    let errors = [];
    
    if(password.length<6) {
        errors.push({ message: "la contrasena debe tener mas de 6 caracteres"});
    }
    
    if(errors.length>0) {
        res.render('modify', { errors});
    } else {
        let encriptPassword = await bcrypt.hash(password, 10);
        console.log(encriptPassword);
    pool.query(`UPDATE users SET password = $1 WHERE email = $2`,
    [encriptPassword, email],
    (err, result) =>{
        if(err) {
            throw err;
        }
        req.flash('success_msg', 'contrasena cambiada creada con exito. Puede iniciar sesion');
        res.redirect("/users/login");
    });
}}
);
  

app.post("/users/dashboard", async (req, res)=>{
    let { task } = req.body;
    console.log({
        task
            });
    let errors = [];
    
    if(task.length<0) {
        errors.push({ message: "INGRESE UNA TAREA"});
    }
    
    if(task.length>0) {
        res.render('dashboard', { errors});
    } else {
        pool.query(`UPDATE users SET task = $1 WHERE id = $2 `,
    [task, id],
    (err, result) =>{
        if(err) {
            throw err;
        }
        res.redirect("/users/dashboard");
    });
}}
);

app.post(
    "/users/login",
    passport.authenticate('local',{ 
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
     })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server listening on port ${PORT}`);
});