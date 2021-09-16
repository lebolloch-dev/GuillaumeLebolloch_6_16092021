const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

//DIFFERENTE ROUTES POUR SE CONNECTER OU CREER UN UTILISATEUR.
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;

// REQUÉTE 201 uniquement valable pour un put mais la nous utilisons un post ?????
