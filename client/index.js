var Matter = require('matter-js')
var vkey = require('vkey')

// Matter.js module aliases
var Engine = Matter.Engine
var World = Matter.World
var Bodies = Matter.Bodies

var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

// create a Matter.js engine
var engine = Engine.create(document.querySelector('.content'), {
  render: {
    options: {
      width: width,
      height: height,
      background: '#222'
    }
  }
})

// No bounds on the world (for accurate physics)
engine.world.bounds.min.x = -10000
engine.world.bounds.min.y = -10000
engine.world.bounds.max.x = 10000
engine.world.bounds.max.y = 10000

var renderOptions = engine.render.options
renderOptions.wireframes = false
// renderOptions.showCollisions = true
// renderOptions.showVelocity = true
// renderOptions.showAngleIndicator = true

var world = engine.world

// Add static walls surrounding the world
var offset = 1
World.add(world, [
  // bottom (left)
  Bodies.rectangle(width / 4, height + 17, width / 2, offset, {
    angle: -0.05,
    isStatic: true,
    friction: 0.01,
    render: {
      visible: false
    }
  }),
  // bottom (right)
  Bodies.rectangle((width / 4) * 3, height + 17, width / 2, offset, {
    angle: 0.05,
    isStatic: true,
    friction: 0.01,
    render: {
      visible: false
    }
  })
])

var restitution = 0.9

// run the engine
Engine.run(engine)

var keys = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', null],
  [null, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  [null, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', null],
  [null, null, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', null, null]
]

var keysY = {}
keys.forEach(function (row) {
  row.forEach(function (letter, i) {
    if (!letter) return
    keysY[letter] = (i / row.length) + (0.5 / row.length)
  })
})

document.body.addEventListener('keydown', function (e) {
  var key = vkey[e.keyCode]
  console.log(key)
  if (key in keysY) {
    var x = keysY[key] * width
    var letter = Bodies.circle(x, height - 30, 30, {
      restitution: restitution,
      friction: 0.01,
      render: {
        sprite: {
          texture: './img/' + key + '.png'
        }
      }
    })

    var vector = {
      x: (Math.floor((Date.now() / 200) % 10) / 200) - 0.025,
      y: -0.2
    }

    Matter.Body.applyForce(letter, letter.position, vector)

    World.add(engine.world, [ letter ])
  }
}, false)
