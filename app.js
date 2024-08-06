const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const port = 80;
const localhost = "127.0.0.1";
var bcrypt = require('bcryptjs')

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded());

const index = fs.readFileSync("./index.html");

app.get("/index", (req, res) => {
  res.end(index);
});

mongoose.connect("mongodb://localhost/usernames", { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : 50"));
db.once("open", () => {
  console.log("Connection to the database succeded");
});

var schema = new mongoose.Schema({
  userName: String,
  Email: String,
  Phone: Number,
  Password: String,
});

var user = mongoose.model("user", schema);

app.post("/signup", (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var phone = req.body.phone;
  var password = req.body.password;
  var salt = bcrypt.genSaltSync(10);
  let hashedPassword = bcrypt.hashSync(password,salt);
  var client = new user({
    userName: username,
    Email: email,
    Phone: phone,
    Password: hashedPassword,
  });

  client
    .save()
    .then((user) => {
      console.log("User saved");
    })
    .catch((err) => {
      console.error(err);
    });

  res.end(index);
});
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  user
    .findOne({ Email: email })
    .then(
      (users) => {
        let login = bcrypt.compareSync(password, users.Password); // true
        if(login){res.end("Login successful")}
        else{res.end("Incorrect Credentials")}
      }
    )
    .catch((err)=>{
      res.end("Server error");
    })
});

app.listen(port, () => {
  console.log("Server started");
});
