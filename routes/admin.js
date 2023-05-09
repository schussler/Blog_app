const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagens");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

// CRIANDO ROTAS

// painel admin
router.get("/", eAdmin, (req, res) => {
  res.render("layouts/admin/index");
});
// pagina de posts
router.get("/postagem", eAdmin, (req, res) => {
  Postagem.find()
    .populate({ path: "categoria", strictPopulate: false })
    .sort("desc")
    .then((postagens) => {
      res.render("layouts/admin/postagem", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao ao listar as postagens" + err);
      res.redirect("/admin");
    });
});
router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ _id: "desc" })
    .then((categorias) => {
      res.render("layouts/admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Nao existe nenhuma categoria");
      res.redirect("/admin");
    });
});
router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Cateogiria invalida, registre uma categoria" });
  }
  if (erros.length < 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect("/admin/postagem");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar a Postagem" + err);
        res.redirect("/admin/postagem");
      });
  }
});
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("layouts/admin/editpostagens", {
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Erro ao carregar o formulario de ediçao" + err
          );
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao carregar o formuladorio de ediçao" + err);
      res.redirect("/admin/postagens");
    });
});
router.post("/postagem/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      (postagem.titulo = req.body.titulo),
        (postagem.slug = req.body.slug),
        (postagem.titulo = req.body.titulo),
        (postagem.descricao = req.body.descricao),
        (postagem.conteudo = req.body.conteudo),
        (postagem.categoria = req.body.categoria),
        postagem
          .save()
          .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/postagem");
          })
          .catch((err) => {
            console.log(err);
            req.flash("error_msg", "Erro ao editar a postagem");
            res.redirect("/admin/postagem");
          });
    })
    .catch((err) => {
      console.log(err);

      req.flash("error_msg", "Erro ao atualizar a postagem");
      res.redirect("/admin/postagem");
    });
});

// router.get("/postagens/deletar/:id", (req, res) => {
//   Postagem.deleteOne({ _id: req.params.id })
//     .then(() => {
//       req.flash("error_msg", "Erro ao deletar a postagem");

//       res.redirect("layouts/admin/postagens");
//     })
//     .catch((err) => {
//       req.flash("error_msg", "Erro ao deletar a postagem");
//       res.redirect("layouts/admin/postagens");
//     });
// });
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.findOneAndDelete({ _id: req.params.id })
    .then((postagem) => {
      req.flash(
        "success_msg",
        "A postagem " + postagem.titulo + " foi excluída com sucesso"
      );

      res.redirect("/admin/postagem");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao deletar a postagem");
      res.redirect("/layouts/admin/postagem");
    });
});
//=========================================== CATEGORIAS ===========================================================
//=========================================== CATEGORIAS ===========================================================
//=========================================== CATEGORIAS ===========================================================
// pagina de categorias
router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("layouts/admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("layouts/admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }

  if (!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
    erros.push({ texto: "Slug inválido" });
  }

  if (req.body.nome.length < 2) {
    // Correção da condição de tamanho do nome
    erros.push({ texto: "Nome da categoria muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("layouts/admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria cadastrada com sucesso!");
        res.redirect("/admin/categorias"); // Adição da resposta de redirecionamento
      })
      .catch((err) => {
        req.flash(("error_msg", "ERRO ao cadastrar a categoria"));
        res.redirect("/admin");
      });
  }
});
// ROTA DE EDIÇAO DE CATEGORIAS

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("layouts/admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria nao Exite");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um interno ao salvar a ediçao da categoria"
      );
      res.redirect("layouts/admin/categorias");
    });
});

//rota post do EDIT

router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria.save().then(() => {
        req.flash("success_msg", "categoria deletada com sucesso");
        res.redirect("/admin/categorias");
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categorias" + err);
      res.redirect("/admin/categorias");
    });
});
// ROTA DE DELETAR CATEGORIAS
router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao deletar categoria");
      res.redirect("/admin/categorias");
    });
});
// CODIGO A BAIXO DELATA TAMBEM
// router.get("/categorias/del/:id", (req, res) => {
//   Categoria.findOne({ _id: req.params.id })
//     .then((categoria) => {
//       categoria.deleteOne().then(() => {
//         req.flash("success_msg", "categoria deletada com sucesso");
//         res.redirect("/admin/categorias");
//       });
//     })
//     .catch((err) => {
//       req.flash("error_msg", "Falha ao deletar categoria ");
//       res.redirect("/admin/categorias");
//     });
// });

module.exports = router;
