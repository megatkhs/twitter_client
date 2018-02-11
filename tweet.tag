<tweet>
<ul>
  <li each={ tweetlist }>
    <img src={ plofileUser }>
    <div>
      <div class="account_info">
        { userName }
        <span>{ screenName }</span>
      </div>
      <tweetArticle content="{ html }"/>
    </div>
  </li>
</ul>
<script>
var self=this
const ipc = require('electron').ipcRenderer;

// "tweet" channelからメッセージを読み込む
  self.tweetlist = []
  ipc.on('tweet', (event, tweets) => {
    let tweet=tweets
    //console.log(tweet)
      for(i=0; i<=tweet.length-1  ; i = i+1 ){
        self.tweetlist.push(createItem(tweet[i]));
      }
      console.log(self.tweetlist);
      //console.log(tweets[0].text);  // JSON.stringify() メソッドは JavaScript の値を JSON 文字列に変換
      self.update();
    });

    //ストリーミングのデータを受け取り
    ipc.on('streamtweet', (event, data) => {
      let tweet=data
      console.log(tweet)
      if(data.user.screen_name){
      self.tweetlist.unshift(createItem(data))
      self.update();
      }
      });

  function createItem(e){
    let obj={}
    obj.userName = e.user.name;
    obj.screenName = '@'+ e.user.screen_name;
    obj.html =tweetTrimer(e.text);
    obj.plofileUser =e.user.profile_image_url_https;
    return obj
  }

//ハッシュタグ、@ユーザー名、URLをリンクにする関数

  function tweetTrimer(t){
	var text = t;
	var twitterPath = 'http://twitter.com/#!/';

	var patternHash = /(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_\/>]+)[#＃]([ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)/;
	var patternName = /(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_\/>]+)@([a-zA-Z0-9_]+)/;
	var patternLink = /(http[s]?:\/\/)?([a-zA-Z0-9_]+)(\.[a-zA-Z0-9_\/\.?=]+)/g;

	var matchesLink = text.match( patternLink );
	if ( matchesLink != null ) {
		for ( var i = 0; i < matchesLink.length; i++ ) {
			text = text.replace( matchesLink[i], '<a href="' + ( ( RegExp.$1 != null ) ? '' : 'http://' ) + matchesLink[i] + '" target="_blank" class="twitter-intext-link">' + matchesLink[i] + '</a>' );
		}
	}
	var matchesHash;
	var matchesName;
	while ( true ) {
		var flgAllReplaced = true;
		if ( ( matchesHash = patternHash.exec( text ) ) != null ) {
			text = text.replace( patternHash, ' <a href="' + twitterPath + 'search?q=%23' + RegExp.$1 + '" target="_blank" class="twitter-intext-link">#' + RegExp.$1 + '</a>' );
			flgAllReplaced = false;
		}
		if ( ( matchesName = patternName.exec( text ) ) != null ) {
			text = text.replace( patternName, ' <a href="' + twitterPath + RegExp.$1 + '" target="_blank" class="twitter-intext-link">@' + RegExp.$1 + "</a>" );
			flgAllReplaced = false;
		}
		if ( flgAllReplaced ) break;
	}

	return text;
}

//RiotデフォルトだとHTMLタグがエスケープされてしまうので、エスケープしないようにするための独自タグと処理
riot.tag('tweetArticle', '<span></span>',　function(opts) {
    this.root.innerHTML = opts.content;
});
riot.mount('tweetArticle')

</script>
<style>
ul {
  margin:0 0 0 10px;
  padding: 30px;
  list-style-type:none;
  font-family:sans-serif;
  background-color: #a4b9d0;
}
li {
  padding: 20px;
  margin: 10px 0;
  background-color: #fafafa;
  border-radius: 5px;
}
li:after {
  content: "";
  display: block;
  clear: both;
}

li > img {
  float: left;
}
li > div {
  margin-left: 60px;
}

.account_info {
  font-size: 16px;
  margin-bottom: 10px;
  line-height: 16px;
}
.account_info span {
  font-size: 0.8em;
}
</style>

</tweet>
