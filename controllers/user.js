const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const schemaJoi = require("../middleware/joiSchema");
require("dotenv").config();

//CRÉATION DE L'UTILISATEUR
exports.signup = (req, res, next) => {
  const resultSchema = schemaJoi.validate(req.body);
  if (!resultSchema.error) {
    //***CONDITION SI LE MAIL OU PASSWORD CORRESPOND AU SCHEMA DE VALIDATION JOI
    bcrypt
      .hash(resultSchema.value.password, 10)
      .then((hash) => {
        const user = new User({
          email: resultSchema.value.email,
          password: hash,
        });

        user
          .save()
          .then(() => res.status(201).json({ message: "utilisateur créé !" }))
          .catch((error) => res.status(400).json(error));
      })

      .catch((error) => res.status(500).json({ error }));
  } else {
    //***CONDITION SI LE MAIL OU PASSWORD NE CORRESPOND PAS AU SCHEMA DE VALIDATION JOI
    res.status(400).json({ msg: resultSchema.error.message });
  }
};

//CONNEXION DE L'UTILISATEUR
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(400).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
