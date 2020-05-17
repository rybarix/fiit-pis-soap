const { soapRequest, wsdl } = require("../lib/soap");
const { validateEmail, validatePhone } = require("../helpers");
const config = require("../../config");

const login = async (email, password, done) => {
  // vytvori session
  console.log("tu som do riti");
  try {
    const { users } = await soapRequest(wsdl.user, "getByAttributeValue", {
      attribute_name: "email",
      attribute_value: email,
      ids: [0], // blbost, proste to zerie pole id na filtrovalie a nezoberie to array literal... asi  problem s xml
    });

    users.user[0].score += Math.floor(Math.random() * 10) + 10;
    console.log(users.user[0]);
    done(null, users.user[0]);
  } catch (error) {
    console.log(error.message);
    done(null, false, { message: "Incorrect password" });
  }
};

const create = async (req, res) => {
  try {
    const [
      { success: emailSuccess },
      { success: phoneSuccess },
    ] = await Promise.all([
      validateEmail(req.body.email),
      validatePhone(req.body.phone_number),
    ]);

    if (emailSuccess && phoneSuccess) {
      await soapRequest(wsdl.user, "insert", {
        user: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          phone_number: req.body.phone_number,
          country_code: req.body.country_code,
          score: 0,
          role: req.body.role || config.roles.USER,
        },
      });
      res.redirect("/");
    } else {
      res.redirect("/user/create");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/user/create')
  }
};

const showCreate = (req, res) => {
  res.render("pages/user/create", {
    roles: Object.keys(config.roles).map(
      (r) => r[0].toUpperCase() + r.slice(1).toLowerCase()
    ),
    trainer: req.query.trainer !== undefined,
  });
};

const showLogin = (req, res) => {
  res.render("pages/user/login");
};

module.exports = {
  showLogin,
  showCreate,
  create,
  login,
};
