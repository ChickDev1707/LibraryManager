
const Reader = require('../../models/reader.js')

async function getCurrentReader(username){
  const reader = await Reader.findOne({email: username})
  return reader
}

module.exports = {
  getCurrentReader
}