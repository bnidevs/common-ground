const data = {};

const playlists = data['items'].map((e) => {
    return {
        name: e.name,
        songListLink: e.tracks.href,
    }
});