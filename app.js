const express = require('express')
const app = express()

const { PORT } = require('./config');
const { restoreDatabases } = require('./db');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

app.post(`/db/restore`, async (req, res) => {
  const databases = req.body.databases
  const result = await restoreDatabases(databases);
  
  res.status(result.status).send(result.message);
})

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`)
})
