const A0 = 440 * 2 ** (-57 / 12)
const OCTAVE = [0, 2, 4, 5, 7, 9, 11]

function at(i) {
    return A0 * 2 ** (i / 12)
}

function octave(n = 0) {
    const r = []
    for (const m of OCTAVE) {
        r.push(2 ** n * A0 * 2 ** (m / 12))
    }
    return r
}

function range(n, m = 0) {
    const a = []
    for (let i = 0; i < n; i++) {
        a.push(i + m)
    }
    return a
}

function fill(n, m = 0) {
    const a = []
    for (let i = 0; i < n; i++) {
        a.push(m)
    }
    return a
}

function* primes(n = Number.MAX_SAFE_INTEGER) {
    for (const s of primes.stored) {
        if (s <= n) {
            yield s
        }
        else {
            break
        }
    }
    loop: for (let i = 2; i <= n; i++) {
        for (const s of primes.stored) {
            if (i % s === 0) {
                continue loop
            }
        }
        primes.stored.push(i)
        yield i
    }
}

primes.stored = []

function simplify(n) {
    const a = []
    for (const p of primes()) {
        while (n % p === 0) {
            a.push(p)
            n /= p
        }
        if (1 === n) {
            break
        }
    }
    return a
}

class Range extends Array {
    constructor(...array) {
        super(...array)
        this.audio = audio
        this.delay = 0
        this.duration = 1
        this.octave = 4
    }

    set delay(v) {
        if (v > 0) {
            this._delay = v + this.audio.pulse
        }
        else {
            this._delay = 0
        }
    }

    get delay() {
        return this._delay - this.audio.pulse
    }

    set duration(v) {
        this._duration = v + this.audio.pulse
    }

    get duration() {
        return this._duration - this.audio.pulse
    }

    get oscillator() {
        if (!this._oscillator) {
            this._oscillator = this.audio.context.createOscillator()
            this._oscillator.connect(this.audio.destination)
            this._oscillator.setPeriodicWave(this.audio.wave)
            this._oscillator.start(0)
            this.pause(0)
        }
        return this._oscillator
    }

    set oscillator(v) {
        this._oscillator = v
    }

    clone() {
        return this.slice()
    }

    tune(n) {
        for (let i = 0; i < this.length; i++) {
            this[i] += n
        }
        return this
    }

    scale(n) {
        for (let i = 0; i < this.length; i++) {
            this[i] *= n
        }
        return this
    }

    tone() {
        for (let i = 0; i < this.length; i++) {
            this[i] = OCTAVE[i % OCTAVE.length] + Math.floor(i / 7) * 12
        }
        return this
    }

    pause(time = 0) {
        this.oscillator.frequency.setValueAtTime(0, time + this.audio.context.currentTime)
    }

    play(time = 0) {
        const delay = this._delay > 0 ? 2 ** this._delay : 0
        const duration = 2 ** this._duration

        for (const note of this) {
            if (note >= 0) {
                this.oscillator.frequency.setValueAtTime(at(note + this.octave * 12), time + this.audio.context.currentTime)
            }
            else {
                this.pause(duration)
            }
            if (delay > 0) {
                time += delay
                this.pause(time)
            }
            time += duration
        }
        this.pause(time)
        return time
    }

    stop() {
        if (this._oscillator) {
            this._oscillator.stop()
            this.oscillator = null
        }
    }
}

class Parallel extends Range {
    play(time = 0) {
        return Math.max(...this.map(r => r.play(time)))
    }

    stop() {
        for (const range of this) {
            range.stop()
        }
    }

    clone() {
        return this.map(r => r.clone())
    }

    tune(n) {
        for (const range of this) {
            range.tune(n)
        }
        return this
    }
}

function good() {
    let m = []
    for (let i = 2; i < 1000; i++) {
        const s = simplify(i)
        m.push(...s)
    }

    const PRIMES = Array.from(primes(Math.max(...m)))
    return m.map(i => PRIMES.indexOf(i))
        .filter((a, i) => i > 32 ? a >= 1 : true)
        .filter((a, i) => i > 64 ? a >= 2 : true)
        .filter((a, i) => i > 128 ? a >= 3 : true)
        .filter((a, i) => i > 256 ? a >= 4 : true)
        .map(a => a % 35 + 1)
}

class Game extends Array {
    constructor(...array) {
        super(...array)
        this.loop = 1000
        this.index = 0
        this.melody = [0]
        this.time = 0
    }

    play(time = 0) {
        if (this.index < this.length) {
            let range = this[this.index++]
            const e = this.melody[this.time++ % this.melody.length]
            time = range.clone().tune(e).play(time)
            setTimeout(() => this.play(), time * 1000)
        }
        else if (--this.loop > 0) {
            this.index = 0
            this.play(time)
        }
        return time
    }

    stop() {
        for (const range of this) {
            range.stop()
        }
        this.index = 0
    }
}

const cv = document.getElementById('oscilloscope')
const g = cv.getContext('2d')

class Audio {
    constructor() {
        this.context = new AudioContext()
        this.pulse = -4
        this.analyser.connect(this.context.destination)
        this.initFilters()
    }

    initFilters() {
        this.destination = this.context.createGain()
        const processor = this.createScript(function (e) {
            const inp = e.inputBuffer.getChannelData(0)
            const out = e.outputBuffer.getChannelData(0)
            for (let i = 0; i < inp.length; i++) {
                out[i] = inp[i]
                // out[i] = inp[i] + (inp[i] * Math.random() * 0.01)
            }
        })
        processor.connect(this.analyser)
        this.destination.connect(processor)
        // const delays = range(7).map(a => 2 ** a)
        // for (const time of delays) {
        //     const delay = this.context.createDelay(time)
        //     this.destination.connect(delay)
        //     delay.connect(this.analyser)
        // }
        // this.destination.gain.setValueAtTime(1 / delays.length, 0)

    }

    createRange(array) {
        if ('number' === typeof array) {
            const n = array
            array = []
            for (let i = 0; i < n; i++) {
                array.push(i)
            }
        }
        const r = new Range(...array)
        r.audio = this
        return r
    }

    createGroup(...array) {
        return new Parallel(...array)
    }

    get decay() {
        return Math.exp(1 / (2 + this.context.sampleRate))
    }

    play(...array) {
        const game = new Game(...array)
        this.draw()
        return game
    }

    createScript(fun) {
        const processor = this.context.createScriptProcessor(16384, 1, 1)
        processor.addEventListener('audioprocess', fun)
        return processor
    }

    get wave() {
        if (!this._wave) {
            const a = new Float32Array([0, 1])
            const b = new Float32Array([0, 0])
            this._wave = this.context.createPeriodicWave(a, b)
        }
        return this._wave
    }

    get analyser() {
        if (!this._analyser) {
            this._analyser = this.context.createAnalyser()
            this._analyser.fftSize = 512
            // this._analyser.connect(this.context.destination)
        }
        return this._analyser
    }

    /*
        get destination() {
            return this._destination || this.context.destination
        }

        set destination(v) {
            if (v) {
                v.connect(this.destination)
            }
            else if (this._destination) {
                v = this._destination.context.destination
            }
            this._destination = v
        }
    */
    createAnalyserData() {
        const analyser = this.analyser
        const data = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(data)
        return data
    }

    draw() {
        const data = this.createAnalyserData()
        const bufferSize = this.analyser.fftSize
        // const median = data.reduce((a, b) => a + b) / data.length
        const min = Math.min(...data)

        g.fillStyle = 'rgb(200, 200, 200)'
        g.fillRect(0, 0, cv.width, cv.height)
        if (!this.timer) {
            g.lineWidth = 2
            g.strokeStyle = 'rgb(0, 0, 0)'
        }

        g.beginPath()
        const sliceWidth = cv.width * 1.0 / bufferSize
        let x = 0

        for (let i = 0; i < bufferSize; i++) {
            const v = data[i] - min
            const y = v * cv.height / 2
            if (0 === i) {
                g.moveTo(x, y)
            }
            else {
                g.lineTo(x, y)
            }
            x += sliceWidth
        }

        g.lineTo(cv.width, cv.height / 2)
        g.stroke()

        this.timer = setTimeout(() => this.draw(), 2000)

        // this.animationFrame = requestAnimationFrame(() => this.draw())
    }
}

const audio = new Audio()
const a = audio.createRange(4)
    .tone()
let b = audio.createRange(4).scale(1.5).tone()
// b.push(...audio.createRange(4).scale(2).tone())
const parallel = audio.createGroup(b)
const game1 = audio.play(parallel)

game1.melody = range(100).map(x => Math.round((Math.cos(x / Math.PI) + 1) * 10))
// game1.play()
// game2.play()
audio.destination.gain.setValueAtTime(0.4, 0)
// audio.draw()

// const iir = audio.context.createIIRFilter(
//     fill(2, 1),
//     fill(2, 1/40)
// )
//
// audio.destination.connect(iir)
// iir.connect(audio.destination)
