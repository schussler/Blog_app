if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI:
      "URL_BD_LINK-AQUI",
  };
} else {
  module.exports = { mongoURI: "mongodb://127.0.0.1/blogapp" };
}
