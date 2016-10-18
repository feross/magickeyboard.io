const get = require('simple-get')
const fs = require('fs')

const URL = 'http://hexb.in/assets/data.json'
const FILE_PATH = './client/hexagons.json'

get.concat({
  url: URL,
  json: true
}, function (err, res, data) {
  if (err) throw err
  const urls = data
    .map(element => element.raster)
    .filter(element => {
      // Too big!
      return ![
        'http://hexb.in/hexagons/metamask.png',
        'http://hexb.in/hexagons/nodeschool-osa.png'
      ].includes(element)
    })

  fs.writeFileSync(FILE_PATH, JSON.stringify(urls))
})
