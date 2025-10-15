let playlists;
let songs;

const main = async () => {
    const token = window.localStorage.getItem('code');
    await getplaylists();
}

const getplaylists = async (token) => {
    const playlistlink = (offset) => {
        return `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`;
    }

    let page = 0;
    let pagesize = 50;
    while (pagesize > 0) {
        pagesize = await fetch(playlistlink(page), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
        .then(response => response.json())
        .then(data => {
            playlists = {
                ...playlists,
                ...data['items'].map((e) => {
                    return {
                        name: e.name,
                        songListLink: e.tracks.href
                    }
                })
            };
            
            return data['items'].length;
        })

        page += 50;
    };

    console.log(playlists);
}

const getsongs = async () => {

}

if (window.localStorage.getItem('code_verifier') && window.localStorage.getItem('code')) {
    main();
}