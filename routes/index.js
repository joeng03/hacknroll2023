var express = require("express");
var router = express.Router();
const searchController = require("../controllers/searchController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/locations", searchController.getLocations);
router.get("/getprices/grab", searchController.getPrices);

module.exports = router;
