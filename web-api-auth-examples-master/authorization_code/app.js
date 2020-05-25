var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = 'c5a5170f00bf40e2a89be3510402947c'; // Your client id
var client_secret = '034a83d99249425d98b21cf3c228eac5'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var user_id = '';
var auth_token = '';

var topArtists = [];
var topSongs = [];
var playlist = [];

var qDefault = {value: 0, include: false};

//0.0 to 1.0
var queryParameters = {
  "acousticness" : qDefault,
  "danceability" : qDefault,
  "energy" : qDefault,
  "instrumentalness" : qDefault,
  "liveness" : qDefault,
  "loudness" : qDefault,
  "speechiness" : qDefault,
  "valence" : qDefault,
  "tempo" : qDefault
}

var answerMap = {
  "q1" : {
    feature : "energy",
    values : {
      "Lager" : 2,
      "APA" : 6,
      "IPA" : 13,
      "Stout" : 30
    }
  },
  "q2" : {
    feature : "valence"
  },
  "q3" : {
    feature : "loudness"
  }
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .use(bodyParser.urlencoded({ extended: true })); 

// *******************************
// LOGIN
// *******************************
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-library-modify playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

// *******************************
// PAGE LOAD FROM LOGIN
// *******************************
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        auth_token = body.access_token;

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          client_id = body["id"];
          console.log(client_id);
          test();
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

// *******************************
// GET A NEW REFRESH TOKEN
// *******************************
app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      console.log("get a new access token", access_token);
      res.send({
        'access_token': access_token
      });
    }
  });
});

// console.log('Listening on 8888');
app.listen(8888);

// ================================
// CALLED FROM FORMS
// ================================

app.post('/', function(req, res) {
  // key = question number (q1, q2, q3...)
  var key = Object.keys(req.body)[0]
  var inputValue = req.body[key]

  // get answer map
  var map = answerMap[key];

  // set into query parameters
  var queryValue = map.values? map.values[inputValue] : inputValue;
  setQueryParameter(map.feature, queryValue);
  
  res.send(204);
});

function setQueryParameter(feature, value) {
  queryParameters[feature].value = value;
  queryParameters[feature].include = true;

  console.log("set", queryParameters[feature])
}

// ================================
// SPOTIFY API QUERIES
// ================================

function test() {
  // get('https://api.spotify.com/v1/browse/categories', "categories");
  get("https://api.spotify.com/v1/me/top/artists", "topArtists");
}

function parseCategories(body) {
  if (!body.categories) return;
  var c = body.categories.items;
  for (var i=0; i<c.length; i++) {
    console.log(i, c[i].name);
  }
}

function parseArtists(body) {
  if (!body.items) return;
  topArtists = body.items;

  // to do edge case if top artists list is less than 5
  getRecommendations();
}

function parseRecommendations(body) {
  if (!body.tracks) return;
  var playlist = body.tracks;
  // console.log(playlist);
}

function getRecommendations(){
  var count = 5;
  var query = "https://api.spotify.com/v1/recommendations?seed_artists=";

  for (var i=0; i<count; i++) {
    // console.log(topArtists[i]);
    query += topArtists[i].id;
    if (i < count-1) {
      query += ","
    }
  }

  // query += "&seed_tracks=0c6xIDDpzE81m2q797ordA";

  // console.log(query);
  get(query, "recommendations")
}

function createPlaylist() {
  post("https://api.spotify.com/v1/users/{user_id}/playlists")
}

async function parseListing(body, key) {
  console.log("key", key);
  console.log("body", body);
}

// ================================
// HELPER FUNCTIONS
// ================================

async function get(url, key) {
  var p = new Promise((res, rej) => {
    var options = {
      url: url,
      headers: { 'Authorization': 'Bearer ' + auth_token },
      json: true
    }
  
    request.get(options, function(error, response, body) {
      console.log(response.statusCode);

      switch(key) {
        case "categories":
          parseCategories(body);
          break;
        case "topArtists":
          parseArtists(body)
          break;
        case "recommendations":
          parseRecommendations(body)
          break;
        default:
          console.log("default");
          // code block
      }
    });
  });

  // var r = await p; 
  // return r;
}

async function post(url, key) {
  var p = new Promise((res, rej) => {
    var options = {
      url: url,
      headers: { 'Authorization': 'Bearer ' + auth_token },
      json: true
    }
  
    request.post(options, function(error, response, body) {
      console.log(response.statusCode);

      // switch(key) {
      //   case "categories":
      //     parseCategories(body);
      //     break;
      //   case "topArtists":
      //     parseArtists(body)
      //     break;
      //   case "recommendations":
      //     parseRecommendations(body)
      //     break;
      //   default:
      //     console.log("default");
      //     // code block
      // }
    });
  });

  // var r = await p; 
  // return r;
}