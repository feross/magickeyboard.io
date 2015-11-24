var Matter = require('./matter.min.js')
var preload = require('preload-img')
var vkey = require('vkey')

var RESTITUTION = 0.9
var OFFSET = 1

var KEYS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', null],
  [null, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  [null, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', null],
  [null, null, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', null, null]
]

var WIDTH, HEIGHT, KEYS_X

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
}

onResize()
window.addEventListener('resize', onResize)

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

// platform to catch letters that fall offscreen
var platform = Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + 400, WIDTH * 4, OFFSET, {
  isStatic: true,
  friction: 1, // letters should stop sliding with sleeping=true
  render: {
    visible: false
  }
})

// Add static walls surrounding the world
Matter.World.add(engine.world, [
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
  platform
])

// run the engine
Matter.Engine.run(engine)

document.body.addEventListener('keydown', function (e) {
  var key = vkey[e.keyCode]

  if (key in KEYS_X) {
    addLetter(key, KEYS_X[key], HEIGHT - 30)
  }
})

function addLetter (key, x, y) {
  playSound()
  hideHelp()

  var body = Matter.Bodies.circle(x, y, 30, {
    restitution: RESTITUTION,
    friction: 0.001,
    render: {
      sprite: {
        texture: getImagePath(key)
      }
    }
  })

  var vector = {
    x: (Math.floor((Date.now() / 200) % 10) / 200) - 0.025,
    y: -1 * (HEIGHT / 3200)
  }

  Matter.Body.applyForce(body, body.position, vector)
  Matter.World.add(engine.world, [ body ])
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
  if (key === '.') key = 'dot'
  if (key === '/') key = 'slash'
  if (key === '\\') key = 'backslash'
  return './img/' + key + '.png'
}

var $audio = document.createElement('audio')
$audio.src = '/type.mp3'
$audio.autoplay = true
document.body.appendChild($audio)

function playSound () {
  if ($audio.currentTime) $audio.currentTime = 0
  $audio.play()
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

document.body.addEventListener('click', onFirstClick)
function onFirstClick () {
  playSound()
  document.body.removeEventListener('click', onFirstClick)
}
