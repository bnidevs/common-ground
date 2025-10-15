if (window.location.search) {
    const params = new URLSearchParams(window.location.search);

    const codeVal = params.get('code');

    window.localStorage.setItem('code', codeVal);

    window.location.href = 'https://bnidevs.github.io/common-ground/';
}

const data = {};

const playlists = data['items'].map((e) => {
    return {
        name: e.name,
        songListLink: e.tracks.href,
    }
});