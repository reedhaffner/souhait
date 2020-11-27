var express = require("express");
var router = express.Router();
var path = require("path");
var auth = require("../functions/auth");

router.get("/", auth.requireAuth, (req, res) => {
    res.render("bruh", {
        user: req.user,
    });
});

module.exports = router;
