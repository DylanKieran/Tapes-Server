let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()

//Redirect uri that needs to be added to Spotify devloper console
let redirect_uri = 'http://localhost:8888/callback'

//Login functionality that send user to Spotify authorization along with the scope
app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-recently-played user-follow-read user-modify-playback-state user-library-read user-library-modify user-top-read user-read-private playlist-modify-public playlist-read-collaborative streaming user-read-playback-state app-remote-control playlist-modify-private user-follow-modify user-read-currently-playing user-read-birthdate playlist-read-private user-read-email',
      redirect_uri
    }))
})

//Upon callback retrieve api access token, callback to applicatio and add it to address bar 
app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:8081'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)