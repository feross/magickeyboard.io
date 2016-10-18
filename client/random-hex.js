module.exports = randomHex

var hexagons = require('./hexagons.json')
var total = hexagons.length

function randomHex () {
  return hexagons[Math.floor(Math.random() * (total))]
}
