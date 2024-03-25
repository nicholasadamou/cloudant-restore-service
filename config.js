const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  environments: process.env,
  PORT: process.env.PORT || 3000
}
