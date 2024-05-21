var express = require("express");
var router = express.Router();
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */
router.get("/", function (req, res, next) {
  res.send("It should work from here!");
});

router.post("/create-user", (req, res) => {
  const userDetails = req.body;
});
router.delete("/delete-user/:id", (req, res) => {});

router.put("/update-user/:id", (req, res) => {});

module.exports = router;
