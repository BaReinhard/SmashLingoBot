const Snoowrap = require('snoowrap');
const { CommentStream } = require('snoostorm');
var CronJob = require('cron').CronJob;
const SMASH_LINGO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMcJ1eKY_F0BCLR_MnN5pqPC7P6nQcjjp0UriDPD99lg9sU3jBFivgL29sommZ4EmfDfHrNhZglyU_/pub?gid=0&single=true&output=tsv";
const BOT_START = Date.now() / 1000;
const axios = require("axios");
const RedditAPI = require('reddit-wrapper-v2');
const { tsvJSON, canSummon, calculateSmashLingoKnowledge } = require("./helper.js")
const { USER_AGENT, CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD, SUBREDDIT } = require("./.secrets.js");
let SMASH_TERMS = [];
let commentStreams = [];
var job = new CronJob(
	'0 */1 * * * *',
	function() {
		loadSmashTerms(false);
	},
	null,
	true,
	'America/Los_Angeles'
);

loadSmashTerms(true);
logDetails();
const client = new Snoowrap({
    userAgent: USER_AGENT,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    username: USERNAME,
    password: PASSWORD
});

const redditConn = new RedditAPI({
	    username: USERNAME,
	    password: PASSWORD,
	    app_id: CLIENT_ID,
	    api_secret: CLIENT_SECRET,
	    user_agent: USER_AGENT,
		retry_on_wait: true,
		retry_on_server_error: 5,
		retry_delay: 1,
		logs: true
});

SUBREDDIT.split(",").forEach(sub => {
    commentStreams.push(new CommentStream(client, {
        subreddit: sub,
        limit: 10,
        pollTime: 10000
    }))
})

commentStreams.forEach(comments => {
    comments.on('item', handleComment)
})

function handleComment(item) {
    if(item.created_utc < BOT_START) return;
    if(!canSummon(item.body)) return;
    redditConn.api.get(`/api/info.json?id=${item.parent_id}`,{}).then(response => {
        let respData = response[1];
        let text = respData.data.children[0].data.body.toLowerCase();
        item.reply(calculateSmashLingoKnowledge(text, SMASH_TERMS));
    })
}

function loadSmashTerms(initialLoad) {
    axios.get(SMASH_LINGO_URL).then(resp=>{
        SMASH_TERMS = tsvJSON(resp.data);
        return;
    }).then(d=>{
        if(initialLoad)
            console.log("SMASH TERMS HAVE BEEN LOADED");
        else
            console.log("SMASH TERMS HAVE BEEN RELOADED");
    })
}

function logDetails() {
    console.log(`
Current Subreddits: ${SUBREDDIT.split(",")}
Current Username: ${USERNAME}`)
}