import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import ejs from "ejs";
import bodyParser from "body-parser";
import fs from "fs";
import * as util from "./utilities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

var user_database = JSON.parse(
  fs.readFileSync(__dirname + "/user_database.json")
);

const validateUser = (username, password) => {
  for (const user of user_database) {
    if (
      username == user.username &&
      util.hash(password, user.salt) == user.hash
    )
      return user;
  }
  return false;
};

const usernameInUse = (username) => {
  for (const user of user_database) {
    if (username == user.username) return true;
  }
  return false;
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

console.log(__dirname);

app.get("/", (req, res) => {
  //check if the cookies return a valid user
  if (req.cookies.user == undefined) {
    //send user to login
    res.redirect("/login");
  } else {
    //send user to chat
    res.redirect("/chat")
  }
  //res.sendFile('public/pages/index.ejs', {root: __dirname });
});

//manage login
app.get("/login", (req, res) => {
  //check if the cookies return a valid user
  if (req.cookies.user == undefined) {
    console.log("no cookies found at get login")
    //login
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
        {
          error_message: "",
        }
      )
    );
  } else {
    console.log("cookies found, user is", req.cookies.user);
    //send user to chat
    res.redirect("/chat");
  }
});
app.post("/login", (req, res) => {
  //check data to avoid injection
  var username = util.sanitizeString(req.body.username_login, 3, 30);
  var password = util.sanitizeString(req.body.password_login, 6, 30);
  if (username.length == 0) {
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
        {
          error_message: "Invalid username",
        }
      )
    );
  } else if (password.length == 0) {
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
        {
          error_message: "Invalid password",
        }
      )
    );
  } else {
    var user = validateUser(username, password);
    if (user != false) {
      //set cookies
      res.cookie("user", user);
      //send user to chat
      res.redirect("chat");
    } else {
      res.send(
        ejs.render(
          fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
          {
            error_message: "Wrong username or password",
          }
        )
      );
    }
  }
});

//manage signup
app.get("/signup", (req, res) => {
  //check if the cookies return a valid user
  if (req.cookies.user == undefined) {
    //login
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/signup.ejs", "utf-8"),
        {
          error_message: "",
        }
      )
    );
  } else {
    console.log("cookies found, user is", req.cookies.user);
    //send user to chat
    res.redirect("/chat");
  }
});
app.post("/signup", (req, res) => {
  //check data to avoid injection
  var username = util.sanitizeString(req.body.username_signup, 3, 30);
  var password = util.sanitizeString(req.body.password_signup, 6, 30);
  if (username.length == 0) {
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
        {
          error_message: "Invalid username",
        }
      )
    );
  } else if (password.length == 0) {
    res.send(
      ejs.render(
        fs.readFileSync(__dirname + "/public/pages/login.ejs", "utf-8"),
        {
          error_message: "Invalid password",
        }
      )
    );
  } else {
    //check if username is already in use. if not, create user
    if (!usernameInUse(username)) {
      //create user object and add it to database
      var user = util.createUser(username, password);
      user_database.push(user);
      fs.writeFileSync(
        __dirname + "/user_database.json",
        JSON.stringify(user_database)
      );
      //set cookies
      res.cookie("user", user);
      //send user to chat
      res.redirect("chat");
    } else {
      res.send(
        ejs.render(
          fs.readFileSync(__dirname + "/public/pages/signup.ejs", "utf-8"),
          {
            error_message: "Username already in use",
          }
        )
      );
    }
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("listening\nhttp://localhost:3000/")
);
