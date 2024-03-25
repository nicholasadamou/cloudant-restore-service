const { cloudantClient, getAllDatabases } = require('../cloudant/index')

const COSService = require('../cos')

const restoreAllDatabases = async () => {
  console.log(`Restoring all databases...`)

  const databases = await getAllDatabases()

  console.log(
    `Found ${databases.length} databases to restore at ${new Date().toISOString()}`,
  )
  console.log('Will restore the following databases:', databases.join(', '))

  try {
    for (const db of databases) {
      await restoreDatabase(db)
    }

    console.log('Restoration of all databases completed.')
  } catch (error) {
    console.error(`Error restoring all databases: `, error)
  }
}

const handleError = (errorMessage, error) => {
  console.error(errorMessage, error)
}

const restoreDatabase = async (db) => {
  console.log(`Restoring database ${db}...`)
  const cosService = new COSService()
  let data, documents

  const doesDatabaseExist = await cosService.doesDatabaseExist(db)
  if (!doesDatabaseExist) {
    throw new Error(`Database ${db} does not exist in S3.`)
  }

  try {
    data = await cosService.pullFromS3(db)
    documents = JSON.parse(data)
  } catch (error) {
    handleError(`Error during retrieval of database ${db}: `, error)
    return
  }

  console.log(
    `Retrieved ${data.length} bytes and ${documents.length} documents for database ${db} from S3.`,
  )

  try {
    await createDatabase(db)
    await insertDocuments(db, documents)
  } catch (error) {
    handleError(
      `Error while creating or inserting documents to the database ${db}: `,
      error,
    )
    return
  }

  console.log(`Database ${db} restored.`)
}

const createDatabase = async (db) => {
  console.log(`Creating database ${db}...`)

  try {
    const result = await cloudantClient.putDatabase({
      db,
    })

    if (result.result === 'created') {
      console.log(`Database ${db} has been successfully created.`)

      return
    }

    if (result.result === 'exists') {
      console.log(`Database ${db} already exists.`)
      console.log(`Deleting database ${db}...`)

      await deleteDatabase(db)
      await createDatabase(db)
    }
  } catch (error) {
    console.error(`Database creation error for ${db}: `, error)
  }
}

const insertDocuments = async (db, documents) => {
  console.log(`Inserting documents into ${db} database...`)

  try {
    await cloudantClient.postBulkDocs({
      db,
      bulkDocs: documents,
    })

    console.log(`Documents inserted into ${db} database.`)
  } catch (error) {
    console.error(`Issue inserting documents to ${db}: `, error)
  }
}

const deleteDatabase = async (db) => {
  console.log(`Deleting database ${db}...`)

  try {
    await cloudantClient.deleteDatabase({
      db,
    })

    console.log(`Database ${db} deleted.`)
  } catch (error) {
    console.error(`Error deleting database ${db}: `, error)
  }
}

module.exports = { restoreAllDatabases, restoreDatabase }
