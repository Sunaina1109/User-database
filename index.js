const { faker } = require('@faker-js/faker');
const mysql= require("mysql2");
const express= require("express");
const app= express();
const path= require("path");
const methodOverride= require("method-override");
const { v4: uuidv4 } = require("uuid");


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Jeet@a207',
  });

//to create random data
  let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.password(),
      faker.internet.email(),
    ];
  };
 
  //for insert new data
  // let q = "INSERT INTO user (id, username, password, email) VALUES ?"
  // let data = [];
  // for (let i=1; i<=100; i++){
  //  data.push(getRandomUser());
  // };

  //connection.end();

//home page route
app.get("/", (req, res)=>{
  let q= `SELECT count(*) from user`
  try{
    connection.query(q, (err, result) =>{
        if (err) throw err;
        let count= result[0] ["count(*)"];
        res.render("index.ejs", {count});
      });
  }catch (err) {
    console.log(err);
    res.send("err in DB");
  };
});
  
  app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;

    connection.query(q, (err, users) => {
        if (err) {
            console.log(err);
            res.send("Error in DB");
            return;
        }
        res.render('user.ejs', { users: users });
    });
});


//edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
      connection.query(q, (err, result) => {
          if (err) {
              console.log(err);
              res.send("Error in DB");
              return;
          }
          let user = result[0];
          res.render("edit.ejs", { user });
      });
  } catch (err) {
      console.log(err);
      res.send("Error in DB");
  }
});

//update in database route:
app.patch("/user/:id",  (req, res) => {
  let { id } = req.params;
  let {password: formPass, username: newUsername}=req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err, result) =>{
        if (err) throw err;
        let user= result[0];
        if (formPass != user.password){
        res.send("worng password")
        } else{
          let q2= `Update user set username= '${newUsername}' where id = '${id}'`;
          connection.query(q2, (err, result) =>{
          if (err) throw err;
            res.redirect("/user");
          });  
        }
      });

    }catch (err) {
    console.log(err);
    res.send("err in DB");
  };
});

//post request for new-user
app.get("/user/:id/new", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
      connection.query(q, (err, result) => {
          if (err) {
              console.log(err);
              res.send("Error in DB");
              return;
          }
          let user = result[0];
          res.render("new.ejs");
      });
  } catch (err) {
      console.log(err);
      res.send("Error in DB");
  }
});
app.post("/user/new", (req, res) => {
  let { username, password, email } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, password, email) VALUES ('${id}','${username}','${password}','${email}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});
//for delete data in db
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


app.listen("8081", ()=>{
  console.log("port is listing")
});