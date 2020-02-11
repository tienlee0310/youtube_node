var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var service = google.youtube('v3');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'client-secret.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

  authorize(JSON.parse(content), getPlaylistItems);
  authorize(JSON.parse(content), listVideoChannel);
  authorize(JSON.parse(content), subscribeYoutube);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function subscribeYoutube(auth) {
  channelSub = 'UClyA28-01x4z60eWQ2kiNbA';
  var service = google.youtube('v3');
  service.subscriptions.insert({
    "auth": auth,
    "part": "snippet",
    "resource": {
      "snippet": {
        "resourceId": {
          "kind": "youtube#channel",
          "channelId": channelSub
        }
      }
    }
  })
  .then(function(response) {
      console.log('Subscribed channel: ' + channelSub)
  },
  function(err) { console.error("Execute error", err); });
}

function getPlaylistItems(auth) {
  channelId = 'UCWe3kkV742_VwUJCHOiCw1A';
  var service = google.youtube('v3');
  service.channels.list({
    "auth": auth,
    "part": "snippet,contentDetails",
    "id": channelId
  })
  .then(function(response) {
      playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
      console.log('PlaylistId: ' + playlistId)
  },
  function(err) { console.error("Execute error", err); });
}

let channelListVideo = [];

function listVideoChannel(auth, pageToken = '') {
  playlistId = 'UUWe3kkV742_VwUJCHOiCw1A';
  var params = {
    "auth": auth,
    "part": "snippet,contentDetails",
    "maxResults": 50,
    "playlistId": playlistId
  };
  pageToken ? params['pageToken'] = pageToken : '';
  service.playlistItems.list(params)
  .then(function(response) {
    channelListVideo = channelListVideo.concat(response.data.items); 
    if(response.data.nextPageToken) {
      let pageToken = response.data.nextPageToken;
      listVideoChannel(auth, pageToken);
    } else {
      console.log(channelListVideo[200])
    }
  },
  function(err) { console.error("Execute error", err); });
}