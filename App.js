const tmi = require('tmi.js');
require('dotenv').config()
// Define configuration options
const client = new tmi.Client({
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  channels: [process.env.USERNAME],
});
//Weighted average
function weightedaverage(input) {
  var array = []; // Just Checking...
  for (var item in input) {
    if (input.hasOwnProperty(item)) { // Safety
      for (var i = 0; i < input[item]; i++) {
        array.push(item);
      }
    }
  }
  // Probability Fun
  return array[Math.floor(Math.random() * array.length)];
}
//Get Random Key
var randomKey = function (array) {
  return array[Math.floor(Math.random() * array.length)];
};
//Class for each word Node
class WordNode {
  constructor(word) {
    this.word = word
    this.nextWordList = {}
  }
  appendWord(nextword) {
    //word in list
    if (nextword in this.nextWordList) {
      this.nextWordList[nextword] = this.nextWordList[nextword] + 1;
    }
    else {
      //Next word not in list
      this.nextWordList[nextword] = 1
    }
  }
  nextWord() {
    return (weightedaverage(this.nextWordList))
  }
}
//Initialize WordMap
let wordMap = {}

// Create a client with our options
client.connect().catch(console.error);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
onMessageHandler = (target, context, msg, self) =>{
  //Skip if self, but also check username as self glitches
  if (self || context.username === process.env.USERNAME) {
    return;
  }
  else {
    let words = msg.split(" ")
    words.push("\n")
    words.forEach((word, index) => {
      if (!(word in wordMap)) {
        wordMap[word] = new WordNode(word);
        wordMap[word].appendWord(words[index + 1])
      }
      else if (word == "\n") {
        //skip
      }
      else {
        wordMap[word].appendWord(words[index + 1])
      }
    });
  }
}
//once  a minute
setInterval(() => {
  let currWord = randomKey(Object.keys(wordMap));
  let myMsg = [];
  while (currWord !== "\n") {
    myMsg.push(currWord);
    currWord = wordMap[currWord].nextWord();
  }
  console.log(myMsg)
  client.say(process.env.USERNAME, myMsg.join(" "))
  wordMap = {};
}, 30000)
// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

