const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail,getUserById) {
  const authenticateUser = async (username, password, done) => {
    const user = getUserByEmail(username);
    if (!user) {
      return done(null, false, { message: "No user with that username" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user); // Pass the user object
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    } catch (error) {
      return done(error);
    }
  };
  
  passport.use(new LocalStrategy({ usernameField: "username" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) =>{ return done(null,getUserById(id))
  });
}

module.exports = initialize;
