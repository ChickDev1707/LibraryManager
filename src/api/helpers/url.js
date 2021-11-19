
const path = require('path')

function getEncodedMessageUrl(url, mess){
  let query = `?message=${encodeURIComponent(mess.message)}&type=${encodeURIComponent(mess.type)}`
  return url+query
}
// format input {message: '', type: ''}
module.exports = {
  getEncodedMessageUrl
}