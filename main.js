// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const url = require('url')
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1200, height: 800 })

    //and load the index.html of the app.
    //mainWindow.loadURL('www/index.html')
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'www/index.html'),
    //     protocol: 'file:',
    //     slashes: false
    //   }))
    var url = 'file://' + __dirname + '/www/index.html';
    var Args = process.argv.slice(2);
    Args.forEach(function(val) {
        if (val === "dist") {
            url = 'file://' + __dirname + '/www/index.html'
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // if (localStorage.key("POS_USER")) {
        //     console.log(localStorage.getItem("POS_USER"));
        //     alert('1');
        // }
        mainWindow = null;
    })
    mainWindow.onbeforeunload = (e) => {
        var answer = confirm('Do you really want to close the application?');
        e.returnValue = answer; // this will *prevent* the closing no matter what value is passed
        if (answer) { win.destroy(); } // this will close the app
    };
    // 

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
// app.on('window-all-closed', function() {
//     // On OS X it is common for applications and their menu bar
//     // to stay active until the user quits explicitly with Cmd + Q


//     if (process.platform !== 'darwin') {
//         app.quit()
//     }
// })

// Prevent Closing when work is running


app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.