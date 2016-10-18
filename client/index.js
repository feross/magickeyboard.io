var hexagons = require('./hexagons.json')
var Matter = require('matter-js/src/module/main')
var preload = require('preload-img')
var vkey = require('vkey')

var RESTITUTION = 0.9
var OFFSET = 1

var KEYS = [
  // Normal keys
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', null],
  [null, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  [null, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', null],
  [null, null, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', null, null],

  // Numpad keys
  [null, null, null, null, null, null, null, null, null, null, null, 'num-/', 'num-*', 'num--'],
  [null, null, null, null, null, null, null, null, null, null, 'num-7', 'num-8', 'num-9', 'num-+'],
  [null, null, null, null, null, null, null, null, null, null, 'num-4', 'num-5', 'num-6', null],
  [null, null, null, null, null, null, null, null, null, null, 'num-1', 'num-2', 'num-3', null],
  [null, null, null, null, null, null, null, null, null, null, null, 'num-0', null, 'num-.', null]
]

var WIDTH, HEIGHT, KEYS_X
var boundaries, engine, platform
var lastKeys = ''
var hexMode = false
var rainMode = false
var semiMode = false
var spinMode = false

function onResize () {
  WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

  KEYS_X = {}
  KEYS.forEach(function (row) {
    row.forEach(function (letter, i) {
      if (!letter) return // ignore meta keys
      KEYS_X[letter] = ((i / row.length) + (0.5 / row.length)) * WIDTH
      preload(getImagePath(letter))
    })
  })

  var $canvas = document.querySelector('canvas')
  if ($canvas) {
    $canvas.width = WIDTH
    $canvas.height = HEIGHT
  }

  if (!engine) {
    engine = createEngine()
  }

  // Remove old boundaries
  if (boundaries) {
    Matter.World.remove(engine.world, boundaries)
  }

  // Add static walls surrounding the world
  boundaries = generateBoundaries()
  platform = boundaries[2]
  Matter.World.add(engine.world, boundaries)
}

onResize()
window.addEventListener('resize', onResize)

function createEngine () {
  var engine = Matter.Engine.create(document.querySelector('.content'), {
    render: {
      options: {
        width: WIDTH,
        height: HEIGHT,
        background: '#222'
      }
    }
  })

  // Show textures
  engine.render.options.wireframes = false

  engine.enableSleeping = true

  // if (debug.enabled) {
  //   engine.render.options.showCollisions = true
  //   engine.render.options.showVelocity = true
  //   engine.render.options.showAngleIndicator = true
  // }
  return engine
}

function generateBoundaries () {
  return [
    // bottom (left)
    Matter.Bodies.rectangle(WIDTH / 4, HEIGHT + 30, WIDTH / 2, OFFSET, {
      angle: -0.1,
      isStatic: true,
      friction: 0.001,
      render: {
        visible: false
      }
    }),
    // bottom (right)
    Matter.Bodies.rectangle((WIDTH / 4) * 3, HEIGHT + 30, WIDTH / 2, OFFSET, {
      angle: 0.1,
      isStatic: true,
      friction: 0.001,
      render: {
        visible: false
      }
    }),
    // platform to catch letters that fall offscreen
    Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + 400, WIDTH * 4, OFFSET, {
      isStatic: true,
      friction: 1, // letters should stop sliding with sleeping=true
      render: {
        visible: false
      }
    })
  ]
}

// run the engine
Matter.Engine.run(engine)

document.body.addEventListener('keydown', function (e) {
  var key = vkey[e.keyCode]
  if (key == null) return

  // Remove '<' and '>' from numpad keys. Example: '<num-1>'  ->  'num-1'
  key = key.replace('<', '').replace('>', '')

  if (key in KEYS_X) {
    addLetter(key, KEYS_X[key], HEIGHT - 30)
  }
})

function addLetter (key, x, y) {
  if (rainMode) {
    playSound('type-drip')
  } else {
    playSound('type')
  }

  hideHelp()

  var body

  if (hexMode) {
    body = Matter.Bodies.polygon(x, y, 6, 105, {
      restitution: RESTITUTION,
      friction: 0.001,
      mass: 3.5,
      render: {
        sprite: {
          texture: randomHex()
        }
      }
    })
  } else {
    body = Matter.Bodies.circle(x, y, 30, {
      restitution: RESTITUTION,
      friction: 0.001,
      render: {
        sprite: {
          texture: semiMode ? '/img/;.png' : getImagePath(key)
        }
      }
    })
  }

  var vector = {
    x: (Math.floor((Date.now() / 200) % 10) / 200) - 0.025,
    y: -1 * (HEIGHT / 3200)
  }

  if (rainMode) {
    vector = {x: 0, y: 0}
    Matter.Body.setPosition(body, {x: body.position.x, y: -30})
  }

  Matter.Body.applyForce(body, body.position, vector)

  if (spinMode) {
    Matter.Body.setAngularVelocity(body, (Math.random() / 2) * (Math.random() < 0.5 ? -1 : 1))
  }

  Matter.World.add(engine.world, [ body ])

  secretWords(key)
}

Matter.Events.on(engine, 'collisionStart', onCollision)

function onCollision (e) {
  e.pairs.forEach(function (pair) {
    var bodyA = pair.bodyA
    var bodyB = pair.bodyB
    var AisPlatform = bodyA === platform
    var BisPlatform = bodyB === platform
    if (AisPlatform) Matter.World.remove(engine.world, [ bodyB ])
    if (BisPlatform) Matter.World.remove(engine.world, [ bodyA ])
  })
}

function getImagePath (key) {
  // Numpad -- make this for no repeat images
  if (key.indexOf('num-') === 0) {
    key = key.substring(4)
  }

  if (key === '*') key = 'star'
  if (key === '+') key = 'plus'
  if (key === '.') key = 'dot'
  if (key === '/') key = 'slash'
  if (key === '\\') key = 'backslash'

  return '/img/' + key + '.png'
}

function playSound (name) {
  var $sound = document.getElementById(name)
  $sound.currentTime = 0
  $sound.play()
}

function stopSound (name) {
  var $sound = document.getElementById(name)
  $sound.pause()
}

var helpHidden = false
var $help = document.querySelector('.help')

function hideHelp () {
  if (helpHidden) return
  helpHidden = true
  $help.style.display = 'none'
}

var touchActive = false
document.body.addEventListener('touchstart', function (e) {
  touchActive = true
  addTouchLetter(e)
  var interval = setInterval(function () {
    if (touchActive) addTouchLetter(e)
    else clearInterval(interval)
  }, 100)
})

function addTouchLetter (e) {
  var keys = Object.keys(KEYS_X)
  var key = keys[Math.floor(Math.random() * keys.length)]
  var x = e.touches[0].screenX
  var y = e.touches[0].screenY
  addLetter(key, x, y)
}

document.body.addEventListener('touchend', function (e) {
  touchActive = false
})

// Disable iOS rubber banding on scroll
document.body.addEventListener('touchmove', function (e) {
  e.preventDefault()
})

function secretWords (key) {
  lastKeys = lastKeys.slice(-5) + key
  var lastFourKeys = lastKeys.slice(-4)

  if (lastKeys === 'FEROSS') {
    spinMode = !spinMode
    if (spinMode) playSound('spin')
  } else if (lastKeys === 'HEXBIN') {
    hexMode = !hexMode
    semiMode = false
    if (hexMode) playSound('hexbin')
  } else if (lastFourKeys === 'RAIN') {
    rainMode = !rainMode
    if (rainMode) playSound('rain')
  } else if (lastFourKeys === 'SEMI' || lastFourKeys === 'FLET') {
    semiMode = !semiMode
    hexMode = false
    ;(semiMode ? playSound : stopSound)('trololo')
  }
}

function randomHex () {
  return hexagons[Math.floor(Math.random() * (hexagons.length))]
}
