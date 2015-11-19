var baudio = require('webaudio')
var Matter = require('matter-js')
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

  var canvas = document.querySelector('canvas')
  if (canvas) {
    canvas.width = WIDTH
    canvas.height = HEIGHT
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

// No bounds on the world (for accurate physics)
engine.world.bounds.min.x = -Infinity
engine.world.bounds.min.y = -Infinity
engine.world.bounds.max.x = Infinity
engine.world.bounds.max.y = Infinity

// Show textures
engine.render.options.wireframes = false

// if (debug.enabled) {
//   engine.render.options.showCollisions = true
//   engine.render.options.showVelocity = true
//   engine.render.options.showAngleIndicator = true
// }

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
  })
])

// run the engine
Matter.Engine.run(engine)

var lastPress
var soundVector
var channel = baudio(coolBeatz)

// http://studio.substack.net/bossa%2060?time=1442227405013
function coolBeatz (t) {
  var bpm = 50
  t = t % 1 + 2
  var flbeat=60;
       snbeat=60;
       hhbeat=60;
       rdbeat=60;

  return fl1()+fl2()+rd()+hh()+sn();

  function fl1() {
    return si(128*Math.PI*(t+1/4))*floor()
    function floor () { return ((t+1/4)/60*flbeat) % (4/4) < 2/bpm ? Math.random()^2 -1 : 0 }
}
  function fl2() {
    return si(128*Math.PI*(t))*floor()
    function floor () { return (t/60*flbeat) % (4/4) < 2/bpm ? Math.random()^2 -1 : 0 }
}
  function sn () {
   var s1=t/60*snbeat-0.5; s2=t/60*snbeat-1.25; s3=t/60*snbeat-2; s4=t/60*snbeat-2.75;
      s5=t/60*snbeat-3.5;
    return saw(16)*cos(8)*sna()
    function sna () {
      return (si(2*Math.PI*soundVector*10*t)*(drum(s1)+drum(s2)+drum(s3)+drum(s4)+drum(s5)))
      function drum (x) { return (x) % (16/ 4) < 3/bpm ? Math.random() -1 : 0 }
    }
    function cos (x) { return Math.cos(2* Math.PI * (t/60*snbeat) * x) }
    function saw (x) { return ((t/60*snbeat)%(1/x))*x-1 }
}

  function rd () {
    return saw(16)*cos(8)*sna()
    function sna () {
      return (si(2*Math.PI*1226*t)*drum())
      function drum () { return (t/60*rdbeat) % (1/4) < 4/bpm ? Math.random() -1 : 0 }
    }
    function cos (x) { return Math.cos(2* Math.PI * (t/60*rdbeat) * x) }
    function saw (x) { return ((t/60*rdbeat)%(1/x))*x-1 }
}

  function hh() {
    return 0.5*cos(4)*hihat()
    function hihat() { return (((t-0.5)/60*hhbeat)) % (4/4) < 4/bpm ? Math.random()*2 -1 : 0}
    function cos (x) { return Math.cos(2* Math.PI * ((t-0.5)/60*hhbeat) * x) }
}

  function sin (x) { return Math.sin(2 * Math.PI * t * x) }
  function si (x) { return Math.sin(x)}
}

document.body.addEventListener('keydown', function (e) {
  lastPress = Date.now()
  channel.play()
  soundVector = 100 - e.keyCode || 1

  var key = vkey[e.keyCode]

  if (key in KEYS_X) {
    var letter = Matter.Bodies.circle(KEYS_X[key], HEIGHT - 30, 30, {
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
      y: -0.22
    }

    Matter.Body.applyForce(letter, letter.position, vector)
    Matter.World.add(engine.world, [ letter ])
  }

  setTimeout(function () {
    if (Date.now() - lastPress > 100) channel.stop()
  }, 100)
}, false)

function getImagePath (key) {
  if (key === '.') key = 'dot'
  if (key === '/') key = 'slash'
  if (key === '\\') key = 'backslash'
  return './img/' + key + '.png'
}
