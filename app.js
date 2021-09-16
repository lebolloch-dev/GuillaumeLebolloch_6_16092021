const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const helmet = require("helmet");

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require("path");

//CONNEXION A LA BASE DE DONNÉ MONGO_DB
mongoose
  .connect(process.env.DB_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

//MIDDLEWARE C.O.R.S
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));

//TRANSFORMER LE CORPS DE LA REQUÉTE EN json (bodyParse N'EST PLUS UTILE DEPUIS PEUT)
app.use(express.json());

//MODULE DE SÉCURITÉ D'EN-TÊTE HTTP
app.use(helmet());

//ROUTE POUR RÉCUPERER LES IMAGES DANS LE DOSSIER IMAGE EN STATIC
app.use("/images", express.static(path.join(__dirname, "images")));

//ROUTE SPÉCIFIQUE POUR LES SAUCES
app.use("/api/sauces", sauceRoutes);

//ROUTE SPÉCIFIQUE POUR L'UTILISATEUR
app.use("/api/auth", userRoutes);

module.exports = app;
