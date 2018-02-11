'use strict';


// Twitterユーザストリーム受け取り用モジュール
let twitter = require('twitter');
const client = new twitter({
  consumer_key: 'R9zOcnsoH4VQwZnr2rCmaWzZw',
  consumer_secret: 'd2m7L7ghNA5ucVtERLtc1D9on2cYTe98cgBFIMmS3bPKTCKyAQ',
  access_token_key: '848537607340343296-7tVtuwyNca8fA3IUqnNXvvcY3hqFUnt',
  access_token_secret: 'Eimm14s1SJok5jkY9KMMUm5rZI4aCEFIyN1rO5KX0YqXo'
});

const electron = require('electron');
// アプリケーションをコントロールするモジュール
const {app} = electron; //←かっこを外すとエラーになる
// ウィンドウを作成するモジュール
const {BrowserWindow} = electron;

const ipc = require('electron').ipcMain;
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

/* お気に入りを取得する場合
  client.get('favorites/list', function(error, tweets){
  if(error) throw error;
    win.webContents.send('tweet', tweets);
});
*/
//ログインしている場合、その人のツイート一覧を取得して表示
//15秒に15回の制限があるため、実際の実装時にhome_timelineは使えない

client.get('statuses/home_timeline', function(error, tweets){
if(error) throw error;
  win.webContents.send('tweet', tweets);
});

client.stream('user', {},  function(stream) {
    stream.on( 'data', function( data ) {
        var text = data.text; // ツイートのテキスト
        console.log( text );
        win.webContents.send('streamtweet', data);
    });
});




// 同期でレンダラープロセスからのメッセージを受信し、tweetする
ipc.on('async-message', function (event, arg) {
  client.post('statuses/update', {status: arg}, function(error, tweet, response) {
    if (!error) {
      event.sender.send('asyncReply', 'レスポンスメッセージ');
    }
  });
    console.log("メッセージ送信成功→ " + arg);
});

  // closedイベントをキャッチしたらBrowserWindowオブジェクトを消す
win.on('closed', function() {
   win = null;
 });
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
