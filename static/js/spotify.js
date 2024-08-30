// CHANGE ME!
const IJSBOL_SPOTIFY_NOW_PLAYING_API_URL = "https://api.1sabelle.dev/spotify/now-playing"


const NO_SONG_PLAYING = "No song playing";
var template = function (nowPlaying) {
    let playerState = '';
    let secondsPlayed = 0, minutesPlayed = 0, secondsTotal = 0, minutesTotal = 0;
    let albumImageUrl = '/static/images/spotify/default-album-cover.png';
    let title = '';
    let artist = '';
    if (nowPlaying != null && nowPlaying.title) {
        nowPlaying.isPlaying ? playerState = 'PLAY' : playerState = 'PAUSE';
        secondsPlayed = Math.floor(nowPlaying.timePlayed/1000);
        minutesPlayed = Math.floor(secondsPlayed/60);
        secondsPlayed = secondsPlayed % 60;
        secondsTotal = Math.floor(nowPlaying.timeTotal/1000);
        minutesTotal = Math.floor(secondsTotal/60);
        secondsTotal = secondsTotal % 60;
        albumImageUrl = nowPlaying.albumImageUrl;
        title = nowPlaying.title;
        artist = nowPlaying.artist;
    } else {
        title = 'Failed to';
        artist = 'fetch song';
    }

    const pad = (n) =>{
      return (n < 10) ? ("0" + n) : n;
    }
    return `
        <a
            style="textDecoration: 'none', color: 'black'""
            href=${playerState === 'PLAY' || playerState === 'PAUSE' ? nowPlaying.songUrl : ''}
            target="_blank"
        >
            <div class='nowPlayingCard'>
                <div class='nowPlayingImage'>
                    ${playerState === 'PLAY'
                        || playerState === 'PAUSE'
                        ? `<a href=${nowPlaying.songUrl}><img src=${albumImageUrl} alt="Album" /></a>`
                            : `<img src=${albumImageUrl} alt="Album" />`
                    }
                </div>
                <div id='nowPlayingDetails'>
                    <div class=${`nowPlayingTitle ${title.length > 15 ? 'marquee-content' : ' '}`}>
                        ${playerState === 'PLAY'
                            || playerState === 'PAUSE'
                            ? `<a href=${nowPlaying.songUrl} target="_blank">${title}</a>`
                                : title
                        }
                    </div>
                    <div class='nowPlayingArtist'>
                        ${playerState === 'PLAY'
                            || playerState === 'PAUSE'
                            ? `<a href=${nowPlaying.artistUrl} target="_blank">${artist}</a>`
                                : artist
                        }
                    </div>
                    <div class='nowPlayingTime'>
                        ${pad(minutesPlayed)}:${pad(secondsPlayed)} / ${pad(minutesTotal)}:${pad(secondsTotal)}
                    </div>
                </div>
                <div class='nowPlayingState'>
                    ${playerState === 'PLAY'
                        ? `<img class="invert" alt='soundbar' src='/static/images/spotify/icon-soundbar.gif' title='Now Listening'/>`
                            : playerState === 'PAUSE'
                        ? `<img alt='soundbar' src='/static/images/spotify/icon-pause.png' title='Now Listening'/>`
                            : playerState === 'OFFLINE'
                        ? `` : ``
                    }
                </div>
                <div class="break"></div>
                <div class="lyrics">
                    🎵 ${nowPlaying.lyricsSynced === false ? '<div class="tooltip">⏰<span class="tooltiptext">Unsynced lyrics</span></div>' : ''} ${nowPlaying.currentLyric}
                </div>
            </div>
        </a>
    `;
};

async function updateSpotifyData() {
    headers = new Headers()
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');
    data = await fetch(IJSBOL_SPOTIFY_NOW_PLAYING_API_URL, {method: 'GET', headers: headers});
    if (data.status == 412 || data.status == 422) {
        setTimeout(updateSpotifyData, 5000);
        return;
    }
    let song = await data.json();
    let status = song.song_data.status;
    let albumImageUrl = song.song_data.item.album.images[0].url;
    let artist = song.song_data.item.artists.map((artist) => artist.name).join(', ');
    let isPlaying = song.song_data.is_playing;
    let songUrl = song.song_data.item.external_urls.spotify;
    let title = song.song_data.item.name;
    let timePlayed = song.song_data.progress_ms;
    let timeTotal = song.song_data.item.duration_ms;
    let artistUrl = song.song_data.item.album.artists[0].external_urls.spotify;
    let currentLyric = song.current_lyric
    let lyricsSynced = song.lyric_synced

    spotifyNowPlaying.innerHTML = template({
        albumImageUrl, artist, isPlaying,
        songUrl, title, timePlayed, timeTotal,
        artistUrl, currentLyric, lyricsSynced
    });
    setTimeout(updateSpotifyData, 950);
}
window.onload = updateSpotifyData;
