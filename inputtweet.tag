<inputtweet>
  <form>
    <textarea name="kanso" rows="4" cols="40"></textarea>
    <button onclick={ asyncMessage }>ツイートする</button>
  </form>
<script>

let self=this;
const ipc = require('electron').ipcRenderer;

asyncMessage(e) {
  if(self.kanso.value){
      let tweetmessage = self.kanso.value;
      ipc.send('async-message', tweetmessage);
    }
}

ipc.on('asyncReply', function(response) {
          //console.log("asyncMessage response : " + response);
          //console.log(response);
        self.kanso.value=''
});

</script>

<style>
form{
  margin:0 0 0 10px;
}
textarea{
  width:100%;
  background-color:#EFEFEF;
}
button{
  background-color: #1b95e0;
border: 1px solid transparent;
color: #fff;
display: block;
padding: 9px 16px 8px 17px;
text-align: center;
background-color: #009999;
background: rgba(0,153,153,.8);
}
</style>
</inputtweet>
