// CARREGANDO MODULOS
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require("./routes/admin");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagens");
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const db = require("./config/db");
//CONFIGS
// SESSAO
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);
app.unsubscribe(passport.initialize());
app.use(passport.session());
app.use(flash());
// MIDDLEWARE
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
//body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

app.set("view engine", "handlebars");
//mongoose
mongoose
  .connect(
    "mongodb+srv://schussler855:QWzXse5rWYSxTHkN@cluster0.tzjlkuv.mongodb.net/"
  )
  .then(() => {
    console.log("conectado com sucesso ao mongodb...");
  })
  .catch((err) => {
    console.log("erro ao se conectador ao mongodb" + err);
  });
// PUBLIC
app.use(express.static(path.join(__dirname, "public")));

// app.use("/mid", (req, res, next) => {
//   console.log("oi, eu sou o um middleware");
//   res.send("douglas");
//   next();
// });
//ROTAS
app.get("/", (req, res) => {
  Postagem.find()
    .populate({ path: "categoria", strictPopulate: false })
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("layouts/users/index_user", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao exibir as postagens");
      res.redirect("/404");
    });
});
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then((postagem) => {
      if (postagem) {
        res.render("layouts/postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Erro ao achar postagem");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "houve um erro interno");
      res.redirect("/");
    });
});
app.get("/404", (req, res) => {
  res.send("Erro 404");
});
// app.get("/posts", (req, res) => {
//   res.render("layouts/users/posts_user");
// });
app.get("/categorias", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("layouts/categorias/categorias_user", {
        categorias: categorias,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "erro interno ao listar categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("layouts/categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Erro ao listar os posts");
            res.render("/");
          });
      } else {
        req.flash("error_msg", "Essa categoria nao existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Erro interno ao carregar a categoria");
      res.redirect("/");
    });
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);
//OUTROS
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("servidor rodando... http://localhost:8081");
});
