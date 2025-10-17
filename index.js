let playlists;
let songs;

const getToken = async () => {
    const codeVerifier = window.localStorage.getItem('code_verifier');
    const code = window.localStorage.getItem('code');

    const url = "https://accounts.spotify.com/api/token";
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: "054e13aa07214d4094f6b01f265ae1fb",
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://bnidevs.github.io/common-ground/spotify-callback/',
            code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(url, payload);
    const response = await body.json();

    window.localStorage.setItem('access_token', response.access_token);
    return response.access_token;
}

const main = async () => {
    const token = await getToken();
    await getplaylists(token);
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
            console.log(playlists);

            playlists = {
                ...playlists,
                ...data['items'].map((e) => {
                    return {
                        name: e.name,
                        songListLink: e.tracks.href
                    }
                })
            };

            console.log(playlists);
            
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