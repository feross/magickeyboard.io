var baudio = require('webaudio')
var Matter = require('matter-js')
var preload = require('preload-img')
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
  Bodies.rectangle(width / 4, height + 30, width / 2, offset, {
    angle: -0.1,
    isStatic: true,
    friction: 0.01,
    render: {
      visible: false
    }
  }),
  // bottom (right)
  Bodies.rectangle((width / 4) * 3, height + 30, width / 2, offset, {
    angle: 0.1,
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

var keysX = {}
keys.forEach(function (row) {
  row.forEach(function (letter, i) {
    if (!letter) return
    keysX[letter] = (i / row.length) + (0.5 / row.length)
    preload(getImagePath(letter))
  })
})

document.body.addEventListener('keydown', function (e) {
  lastPress = Date.now()
  channel.play()
  soundVector = 100 - e.keyCode || 1
  var key = vkey[e.keyCode]

  if (key in keysX) {
    var x = keysX[key] * width

    var letter = Bodies.circle(x, height - 30, 30, {
      restitution: restitution,
      friction: 0.01,
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

    World.add(engine.world, [ letter ])
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
