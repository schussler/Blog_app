const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuarios");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
  res.render("layouts/usuarios/registro");
});

router.post("/registro", (req, res) => {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "nome invalido" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: "email invalido" });
  }
  if (req.body.senha.length < 4) {
    erros.push({ texto: "senha muito curta" });
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: "As senhas nao iguais" });
  }

  if (erros.length > 0) {
    res.render("layouts/usuarios/registro", { erros: erros });
  } else {
    Usuario.findOne({ email: req.body.email })
      .then((usuario) => {
        if (usuario) {
          req.flash("error_msg", "Email ja cadastrado");
          res.redirect("/usuarios/registro");
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
          });

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash("error_msg", "erro ao salvar o usuario");
                res.redirect("/");
              } else {
                novoUsuario.senha = hash;
                novoUsuario
                  .save()
                  .then(() => {
                    req.flash("success_msg", "Usuario cadastrado com sucesso");
                    res.redirect("/");
                  })
                  .catch((err) => {
                    req.flash("error_msg", "erro ao salvar o usuario");
                    res.redirect("/registro");
                  });
              }
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Erro interno" + err);
        res.redirect("/");
      });
  }
});
router.get("/login", (req, res) => {
  res.render("layouts/usuarios/login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
  })(req, res, next);
});

// router.get("/logout", (req, res) => {
//   req.logout();
//   req.flash("success_msg", "Deslogado com sucesso");
//   res.redirect("/");
// });
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");
  });
});
module.exports = router;
