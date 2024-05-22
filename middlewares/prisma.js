const bcrypt = require("bcrypt");

function hashPasswordMiddleware({ args, query }) {
  if (args.data.password) {
    args.data.password = bcrypt.hashSync(args.data.password, 10);
  }
  return query(args);
}

module.exports = hashPasswordMiddleware;
