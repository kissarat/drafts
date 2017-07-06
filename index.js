const {app, BrowserWindow} = require('electron')

app.on('ready', function () {
  const w = new BrowserWindow({
    width: 1280,
    height: 1080,
    webPreferences: {
      // preload: '/Users/kissarat/gitlab/spydream/electron/public/inject.js'
    }
  })

  w.loadURL(`file://${__dirname}/index.html`)
})
