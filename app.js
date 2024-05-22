var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");

// swagger
var swaggerUI = require("swagger-ui-express");
var swaggerSpec = require("./helpers/swagger");

// routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var goalExpensesRouter = require("./routes/goalExpense");
var transactionRouter = require("./routes/transaction");

var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes middleware
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/goal-expenses", goalExpensesRouter);
app.use("/transaction", transactionRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
