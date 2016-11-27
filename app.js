var onMovement = null;
var slidingWindowSizeTime = 5000; // 5 seconds

var BPM_avg = 0;
var constant_BPM_time = 0;
var song_playing = false;
var audio = null;
var app_id = "459c7d640c8d4857a93cca27b7e7a6d1";

var indexCode = document.location.href.indexOf("access_token=");

if(!sessionStorage.getItem('spotify_token') && indexCode === -1) {
	var uri = encodeURIComponent(document.location.protocol + "//" + document.location.host + document.location.pathname);
	document.location="https://accounts.spotify.com/authorize?client_id="+app_id+"&response_type=token&redirect_uri=" + uri;
}

$(document).ready(function() {

	var spotifyApi = new SpotifyWebApi();
	var bpmChangeThresholdPercentage = 10;


	var indexCode = document.location.href.indexOf("access_token=");

	if(!sessionStorage.getItem('spotify_token') && indexCode !== -1) {

		var matches = /access_token=([^&#=]*)/.exec(window.location.hash);
		var access_token  = matches[1];
		sessionStorage.setItem('spotify_token', access_token);
		launchApp(access_token);
	} else if(sessionStorage.getItem('spotify_token')) {
		launchApp(sessionStorage.getItem('spotify_token'));
	}

	function launchApp(access_token) {
		console.log(access_token);

		spotifyApi.setAccessToken(access_token);
		spotifyApi.setPromiseImplementation(Promise);
	}

	onMovement = function onMovement(movements) {

		var newBpm = getBpm(movements);
	    if (newBpm == null) {
	      newBpm = 0;
	    }

	    var d = new Date();
	    var n = d.getTime();
	    BPM_avg = (BPM_avg + newBpm) / 2;
	    var bpm_change = abs(BPM_avg - newBpm);

			console.log('New BPM: ', newBpm, ' BPM average:', BPM_avg);
	    if (constant_BPM_time == 0 || bpm_change > 20 || BPM_avg < 25 || newBpm == null) {
	      // BPM changed, reset last constant BPM time
	      constant_BPM_time = n;
	      if (audio && song_playing) {
	        audio.pause();
	        song_playing = false;
	      }
	    }

	    if ((n - constant_BPM_time) > 5000 && !song_playing) {
	      song_playing = true;
	      // Held a roughly constant BPM for 3 seconds, it's time for a matching song!
	      console.log('Time for a song at ', round(BPM_avg), ' BPM');
	      spotifyApi.getRecommendations({
	        "seed_genres": ["dance", "disco"],
	        "danceability": 1.0,
	        "tempo": round(BPM_avg)
	      }).then(function(data) {
	        console.log('Recommendations', data.tracks);
	        var preview_url = null;
	        for(var i = 0; i < data.tracks.length; i++) {
	          if (data.tracks[i].preview_url != null) {
	            preview_url = data.tracks[i].preview_url;
	            break;
	          }
	        }
	        if (preview_url == null) {
	          console.log('NO SONG WITH PREVIEW URL!!!');
	        } else {
	          console.log(preview_url);
	          audio = new Audio(preview_url);
	          audio.play();
	        }
	      }, function(err) { //If unauthorized reset ssssion storage token
		      if(err.status == 401) {
			      sessionStorage.removeItem('spotify_token');
			      document.location.href = document.location.protocol + "//" + document.location.host + document.location.pathname;
		      }
		      console.error(err);
	      });
	    }
	}
});

function movementsListener(movements) {
	if(typeof onMovement === 'function') onMovement(movements);
}

function hover_logo(element) {
      element.setAttribute('src', 'assets/logo2.png');
}
function unhover_logo(element) {
      element.setAttribute('src', 'assets/logo.png');
}
