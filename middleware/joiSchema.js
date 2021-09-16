const joi = require("joi");

//SCHEMA JOI QUI PERMET DE VERIFIER L'EMAIL ET LE PASSWORD DE L'UTILISATEUR COTÉ BACKEND
module.exports = joi.object().keys({
  email: joi.string().email().required(),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required(),
});
