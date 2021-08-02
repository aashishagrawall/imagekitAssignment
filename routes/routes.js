var express = require("express");
var router = express.Router();

var controller = require("../controllers/controller");

router.post("/upload", controller.uploadFile);
router.get("/search", controller.searchFile);
router.delete("/deleteFolder", controller.deleteFolder);

module.exports = router;
