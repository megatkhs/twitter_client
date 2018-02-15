'use strict'
const ipc = require('electron').ipcRenderer
ipc.on('tweet', (event, tweets) => {
  const tweet = tweets
  const len = tweet.length
  console.log(tweet, len)
  for ( let i = 0; i < len; i++ )
    tweetList.tweets.push(createItem(tweet[i]))
})

ipc.on('streamtweet', (event, data) => {
  const tweet = data
  console.log(tweet)
  if ( data.user.screen_name )
    tweetList.tweets.unshift(createItem(tweet))
})

ipc.on('profile', (event,data) => {
  sidebar.profile = createProfile(data)
})

ipc.on('asyncReply', function(response) {
  tweetSend.tweet=''
});

const tweetSend = new Vue({
  el: '#tweetSendArea',
  data: {
    tweet: ''
  },
  methods: {
    tweetSend: function() {
      if ( this.tweet ) {
        const tweetMessage = this.tweet
        ipc.send('tweetSend', tweetMessage)
      }
    }
  }
})

const tweetList = new Vue({
  el: '#timeline',
  data: {
    tweets: []
  },
  created: function() {
    console.log(this.tweets)
  }
})

const sidebar = new Vue({
  el: '#sidebar',
  data: {
    profile: {}
  }
})

// プロフィール用のデータセットを作るやつ
function createProfile(data) {
  const obj = {}
  obj.userName = data.name
  obj.screenName = data.screen_name
  obj.profileUser = data.profile_image_url_https
  console.log(obj)
  return obj
}

// 必要なデータセットを作るやつ
function createItem(data) {
  const obj = {}
  let media
  console.log(data)
  obj.userName = data.user.name
  obj.screenName = data.user.screen_name
  if ( data.entities.media )
    media = data.entities.media
  else
    media = null
  obj.html = tweetTranser(data.text , media)
  obj.profileUser = data.user.profile_image_url_https
  obj.favoriteCount = data.favorite_count
  console.log(obj)
  return obj
}

// テキストをHTMLに変換するやつ
// RTの場合は.retweetで囲う
// ハッシュタグ、@ユーザー名、URLはリンクに置き換える
function tweetTranser(t, m) {
  let text = t
  const twitterPath = 'http://twitter.com/#!/'

  // 正規表現パターン
  const patternHash = /[#＃]+([^#＃、。\s<>]*)/gi
  const patternName = /@+([\w]*)/gi
  const patternRT = /RT +(@[\w]*)+:[\s]/gi
  const patternLink = /http(s)?:\/\/+([\w]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/gi

  // 改行する
  text = text.replace( /\r?\n/g, '<br>' )

  // RTを見つけたら 'RT @~ :'を削除して
  // .retweetで囲う
  const matchRT = text.match( patternRT )
  if ( matchRT !== null ) {
    // console.log('RT発見:',matchRT)
    text = text.replace( matchRT[0], '' )
    text = '<div class="retweet">' + text + '</div>'
  }

  const matchesLink = text.match( patternLink )
  if ( matchesLink !== null ) {
    // console.log('URL発見:',matchesLink)
    for ( let i = 0; i < matchesLink.length; i++ )
      text = text.replace( matchesLink[i], '<a href="' + matchesLink[i] + '" target="_blank" class="twitter-intext-link">' + matchesLink[i] + '</a>' )
  }

  const matchesHash = text.match( patternHash )
  if ( matchesHash !== null ) {
    // console.log('ハッシュタグ発見:', matchesHash)
    for ( let i = 0; i < matchesHash.length; i++ ) {
      // console.log(matchesHash[i], matchesHash[i].slice(1))
      text = text.replace( matchesHash[i], '<a href="' + twitterPath + 'search?q=%23' + matchesHash[i].slice(1) + '" target="_blank" class="twitter-intext-link">' + matchesHash[i] + '</a>' )
    }
  }

  const matchesName = text.match( patternName )
  if ( matchesName !== null ) {
    // console.log('ユーザーネーム発見:', matchesName)
    for ( let i = 0; i < matchesName.length; i++ ) {
      // console.log(matchesName[i], matchesName[i].slice(1))
      text = text.replace( matchesName[i], '<a href="' + twitterPath + matchesName[i].slice(1) + '" target="_blank" class="twitter-intext-link">' + matchesName[i] + '</a>' )
    }
  }
  
  if( m !== null )
    text = text + ('<img src="' + m[0].media_url + '">')


  console.log('生成したHTML:',text)

  return text
}
