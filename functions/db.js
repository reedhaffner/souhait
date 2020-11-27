const flatfile = require("flat-file-db");

var db = flatfile("/data/wishlist.db");

module.exports = db;
