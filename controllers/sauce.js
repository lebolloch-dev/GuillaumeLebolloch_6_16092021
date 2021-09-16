const Sauce = require("../models/sauce");
const fs = require("fs");

// RECUPERATION DE TOUTES LES SAUCES
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(500).json({ error }));
};

//RECUPERATION D'UNE SEUL SAUCE
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//CREATION D'UNE SAUCE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
  });

  sauce
    .save()
    .then(() => res.status(200).json({ message: "objet enregistré !" }))
    .catch((error) => res.status(500).json({ error }));
};

//MODIFICATION D'UNE SAUCE
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    //CONDITION SI L'IMAGE EST MODIFIÉ
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "objet modifié" }))
            .catch((error) => res.status(400).json({ error }));
        });
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    //CONDITION SI L'IMAGE RESTE LA MEME
    const sauceObject = { ...req.body };
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "objet modifié" }))
      .catch((error) => res.status(500).json({ error }));
  }
};

//SUPPRESSION D'UNE SAUCE
exports.deleteSauce = (req, res, next) => {
  if (!req.params && !req.params.id)
    return res.status(400).json({ message: "paramètre id non spécifié" });
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "objet supprimé !" }))
          .catch((error) => res.status(400).jason({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// LIKE OU DISLIKE D'UNE SAUCE
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const sauceId = req.params.id;

  switch (req.body.like) {
    case 1: //***LIKE
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            //***CONDITION POUR QU'UN UTILISATEUR NE VOTE QU'UNE SEUL FOIS PART PRODUIT
            return res
              .status(400)
              .json({ message: "L'utilisateur à déjà liké" });
          } else {
            Sauce.updateOne(
              { _id: sauceId },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: userId },
                _id: sauceId,
              }
            )
              .then(() => res.status(201).json({ message: "produit liké !" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    case -1: //***DISLIKE
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersDisliked.includes(userId)) {
            //***CONDITION POUR QU'UN UTILISATEUR NE VOTE QU'UNE SEUL FOIS PART PRODUIT
            return res
              .status(400)
              .json({ message: "L'utilisateur à déjà disliké" });
          } else {
            Sauce.updateOne(
              { _id: sauceId },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: userId },
                _id: sauceId,
              }
            )
              .then(() =>
                res.status(201).json({ message: "produit disliké !" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));

      break;

    case 0: //***ANNULATION DU LIKE OU DISLIKE
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            //***ANNULATION DU LIKE
            Sauce.updateOne(
              { _id: sauceId },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: userId },
                _id: sauceId,
              }
            )
              .then(() =>
                res.status(201).json({ message: "like mis à jour !" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(userId)) {
            //***ANNULATION DU DISLIKE
            Sauce.updateOne(
              { _id: sauceId },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: userId },
                _id: sauceId,
              }
            )
              .then(() =>
                res.status(201).json({ message: "dislike mis à jour !" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;

    default:
      console.error(error);
  }
};
