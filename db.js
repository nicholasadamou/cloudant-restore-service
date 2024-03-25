async function restoreDatabase(database) {
    const { restoreDatabase } = require('./cloudant/restore');
    
    try {
      await restoreDatabase(database);
      return { status: true, database };
    } catch (error) {
      console.error(`Error restoring ${database}`, error);
      return { status: false, database, error };
    }
  }
  
  async function restoreDatabases(databases = []) {
    let restoreErrors = [];
    let restoreSuccesses = [];
  
    for (let database of databases) {
      const { status, error } = await restoreDatabase(database);
      status ? restoreSuccesses.push(database) : restoreErrors.push(database);
    }
  
    if (restoreErrors.length === 0) {
      return { status: 200, message: `Restore of ${restoreSuccesses.join(', ')} complete` }
    } else {
      return { status: 500, message: `Error restoring ${restoreErrors.join(', ')}` }
    }
  }
  
  module.exports = { restoreDatabases }
  