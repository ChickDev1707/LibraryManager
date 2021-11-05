
function dateDiff(first, second) {
  return Math.round((second-first)/(1000*60*60*24));
}
module.exports = {
  dateDiff
}