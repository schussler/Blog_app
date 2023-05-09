if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI:
      "mongodb+srv://schussler855:QWzXse5rWYSxTHkN@cluster0.tzjlkuv.mongodb.net/",
  };
} else {
  module.exports = { mongoURI: "mongodb://127.0.0.1/blogapp" };
}
