'use strict'
const ipc = require('electron').ipcRenderer
ipc.on('tweet', (event, tweets) => {
  const tweet = tweets
  const len = tweet.length
  console.log(tweet, len)
  for(let i = 0; i < len; i++)
    tweetList.tweets.push(createItem(tweet[i]))
})

const tweetList = new Vue({
  el: '#timeline',
  data: {
    tweets: []
  },
  components: {
    'tweet-list': {
      template: '<li v-html="tweet.html"></li>',
      props: ['tweet']
    }
  },
  created: function() {
    console.log(this.tweets)
  }
})

// 必要なデータセットを作るやつ
function createItem(data) {
  const obj = {}
  obj.userName = data.user.name
  obj.screenName = '@' + data.user.screenName
  obj.html = tweetTranser(data.text)
  obj.profileUser = data.user.profile_image_url_https
  return obj
}

// テキストをHTMLに変換するやつ
// RTの場合は.retweetで囲う
// ハッシュタグ、@ユーザー名、URLはリンクに置き換える
function tweetTranser(t) {
  let text = t
  const twitterPath = 'http://twitter.com/#!/'

  // 正規表現パターン
  const patternHash = /[#＃]+([^#＃、。\s<>]*)/g
  const patternName = /(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_\/>]+)@([a-zA-Z0-9_]+)/
  const patternRT = /RT +(@[\w]*)+:+[\s]/gi
  const patternLink = /(http(s)?:\/\/)?([\w]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/gi

  // 改行する
  text = text.replace( /\r?\n/g, '<br>' )

  // RTを見つけたら 'RT @~ :'を削除して
  // .retweetで囲う
  const matchRT = text.match( patternRT )
  if ( matchRT !== null ) {
    console.log('RT発見:',matchRT)
    text = text.replace( matchRT[0], '' )
    text = '<div class="retweet">' + text + '</div>'
  }

  const matchesLink = text.match( patternLink )
  if ( matchesLink !== null ) {
    console.log('URL発見:',matchesLink)
    for ( let i = 0; i < matchesLink.length; i++ )
      text = text.replace( matchesLink[i], '<a href="' + matchesLink[i] + '" target="_blank" class="twitter-intext-link">' + matchesLink[i] + '</a>' )
  }

  const matchesHash = text.match( patternHash )
  if ( matchesHash !== null ) {
    console.log('ハッシュタグ発見:', matchesHash)
    for ( let i = 0; i < matchesHash.length; i++ ) {
      console.log(matchesHash[i], matchesHash[i].match(/[^#＃、。\s<>]*/gi))
      text = text.replace( matchesHash[i], '<a href="' + twitterPath + 'search?q=%23' + matchesHash[i].match(/[^#＃]*/gi)[1] + '" target="_blank" class="twitter-intext-link">' + matchesHash[i] + '</a>' )
    }
  }


  console.log('生成したHTML:',text)

  return text
}
