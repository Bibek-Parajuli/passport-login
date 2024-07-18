const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const initPass = require("./passport-conf");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const method = require("method-override");
const users = [];

initPass(
  passport,
  (username) => users.find((user) => user.username === username),
  (id) => users.find((user) => user.id === id)
);

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "nothing", // secret to store data as session
    resave: false, // don't resave if nothing is saved
    saveUninitialized: false, // don't save uninitialized
  })
);

app.use(flash());
app.use(passport.initialize()); // function inside passport
app.use(passport.session()); // function inside passport
app.use(method("_method"));
app.set("view engine", "ejs");

app.get("/", checkNotAuth, (req, res) => {
  res.render("index");
});

app.get("/login", checkNotAuth, (req, res) => {
  res.render("login", { name: "bibek" });
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new Error("Missing required fields");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: Date.now().toString(),
      username: username,
      email: email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.redirect("/register");
  } finally {
    console.log(users);
  }
});

app.get("/register", checkNotAuth, (req, res) => {
  res.render("register");
});
app.get("/profile", checkAuth, (req, res) => {
  res.render("profile", { name: req.user.username });
  console.log(`req.user is${req.user.username}`);
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.delete("/logout", (req, res) => {
  req.logOut((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/login");
  });
});


function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  next();
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});