const get = require('simple-get')
const fs = require('fs')

const URL = 'http://hexb.in/assets/data.json'
const FILE_PATH = './client/hexagons.json'

get.concat({
  url: URL,
  json: true
}, function (err, res, data) {
  if (err) throw err
  const urls = data.map(element => element.raster)
  fs.writeFileSync(FILE_PATH, JSON.stringify(urls))
})
