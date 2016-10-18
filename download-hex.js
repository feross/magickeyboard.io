(function () {
  var http = require('http')
  var fs = require('fs')

  var url = 'hexb.in'
  var path = '/assets/data.json'
  var filePath = './client'
  var fileName = 'hexagons.json'

  http.get({
    host: url,
    path: path,
    headers: {
      'Content-Type': 'application/json'
    }
  }, function (response) {
    var body = ''
    response.on('data', function (data) {
      body += data
    })

    response.on('end', function () {
      var parsed = JSON.parse(body)
      var urls = parsed.map(function (element) {
        return element.raster ? element.raster : null
      })

      if (urls && urls.length) {
        var json = JSON.stringify(urls)
        fs.writeFile(filePath + '/' + fileName, json, function (error) {
          if (error) throw error
        })
      }
    })
  })
})()
