'use strict'

// Twitterユーザーストリーム受け取り用モジュール
const twitter = require('twitter')
const client = new twitter({
  consumer_key: 'R9zOcnsoH4VQwZnr2rCmaWzZw',
  consumer_secret: 'd2m7L7ghNA5ucVtERLtc1D9on2cYTe98cgBFIMmS3bPKTCKyAQ',
  access_token_key: '848537607340343296-7tVtuwyNca8fA3IUqnNXvvcY3hqFUnt',
  access_token_secret: 'Eimm14s1SJok5jkY9KMMUm5rZI4aCEFIyN1rO5KX0YqXo'
})

const electron = require('electron')
const ipc = electron.ipcMain

// 分割代入
// app アプリケーションをコントロールするモジュール
// BrowserWindow ウィンドウを作成するモジュール
const {app, BrowserWindow} = electron
// ウィンドウの情報を格納
let win = null

const createWindow = () => {
  // ウィンドウの作成
  win = new BrowserWindow({width: 800, height: 600})

  // ページの読み込み
  win.loadURL('file://' + __dirname + '/app/index.html')

  // デベロッパーツール起動
  win.webContents.openDevTools()

  // ログイン中のユーザーの情報を取得？
  client.get('account/settings', (error, data) => {
    if(error) throw error
    client.get('users/show', {screen_name: data.screen_name}, (error,profile) => {
      if(error) throw error
      win.webContents.send('profile', profile)
    })
  })

  // レンダラープロセスからツイート内容を受け取り送信
  ipc.on('tweetSend', (event, arg) => {
    client.post('statuses/update', {status: arg}, (error, tweet, response) => {
      if (!error)
        event.sender.send('asyncReply', response)
      console.log('メッセージ送信成功', arg)
    })
  })
  
  // ログインしている場合、その人のツイート一覧を取得して表示
  // 30個のツイートを取得
  client.get('statuses/home_timeline', {count: 30}, (error, tweets) => {
    if(error) throw error
    win.webContents.send('tweet', tweets)
  })

  // ストリームデータを受信しレンダーに受け渡し
  client.stream('user', {}, stream => {
    stream.on('data', data => {
      console.log(data)
      const {text} = data // ツイートのテキスト
      console.log(text)
      win.webContents.send('streamtweet', data)
    })
  })

  // クローズした場合の処理
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)