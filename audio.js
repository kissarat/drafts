
const a = document.querySelector('audio')
const source = c.createMediaElementSource(a)
const compressor = c.createDynamicsCompressor()
source.connect(compressor)
for(const name of ['threshold', 'knee', 'ratio', 'attack', 'release']) {
  const input = document.createElement('input')
  const n = compressor[name]
  input.type = 'range'
  input.value = n.defaultValue
  input.min = n.minValue
  input.max = n.maxValue
  if (1 == n.maxValue) {
    input.setAttribute('step', 0.01)
  }
  input.addEventListener('mousemove', function (e) {
    n.value = +e.target.value
    console.log(name, n.value)
  })
  const div = document.createElement('div')
  div.appendChild(input)
  div.appendChild(document.createTextNode(name))
  document.body.appendChild(div)
}
compressor.connect(c.destination)


const analyser = c.createAnalyser()
const bufferLength = analyser.fftSize = 2048
const data = new Uint8Array(bufferLength)

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

analyser.getByteTimeDomainData(data)

function draw() {
  const WIDTH = 10
  const HEIGHT = 10
  const drawVisual = requestAnimationFrame(draw)
  analyser.getByteTimeDomainData(data)
  ctx.fillStyle = 'rgb(200, 200, 200)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgb(0, 0, 0)'
  ctx.beginPath()
  const sliceWidth = WIDTH / bufferLength
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    const v = data[i] / 128.0
    const y = v * HEIGHT / 2
    if (0 === i) {
      ctx.moveTo(x, y)
    }
    else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }

  ctx.lineTo(canvas.width, canvas.height)
  ctx.stroke()
}

draw()