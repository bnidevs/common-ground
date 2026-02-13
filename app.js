// ==================== SPOTIFY AUTH ====================
const CLIENT_ID = '054e13aa07214d4094f6b01f265ae1fb';
const REDIRECT_URI = 'https://bnidevs.github.io/common-ground/spotify-callback/';
const SCOPES = 'playlist-read-private playlist-read-collaborative user-read-private';

// Genre classification by artist name
const ARTIST_GENRES = {
  'r&b': ['sza','daniel caesar','frank ocean','the weeknd','brent faiyaz','summer walker','jhené aiko','h.e.r.','kehlani','6lack','bryson tiller','dvsn','partynextdoor','jacquees','ella mai','ari lennox','lucky daye','giveon','snoh aalegra','victoria monét','chloe x halle','tinashe','teyana taylor','jeremih','trey songz','chris brown','usher','r. kelly','aaliyah','mariah carey','whitney houston','janet jackson','mary j. blige','alicia keys','beyoncé','rihanna','ciara'],
  'soul': ['erykah badu','lauryn hill','d\'angelo','maxwell','musiq soulchild','jill scott','india.arie','anthony hamilton','raphael saadiq','leon bridges','anderson .paak','tom misch','jacob collier','moonchild','hiatus kaiyote'],
  'hip-hop': ['drake','kendrick lamar','j. cole','travis scott','kanye west','jay-z','nas','future','21 savage','metro boomin','lil uzi vert','playboi carti','lil baby','gunna','young thug','migos','offset','quavo','takeoff','post malone','juice wrld','xxxtentacion','lil peep','trippie redd','roddy ricch','dababy','jack harlow','tyler, the creator','asap rocky','asap ferg','joey bada$$','denzel curry','jid','earthgang','bas','amine','vince staples','mac miller','schoolboy q','ab-soul','isaiah rashad','baby keem','don toliver','sza'],
  'pop': ['taylor swift','ariana grande','dua lipa','billie eilish','olivia rodrigo','doja cat','harry styles','the kid laroi','justin bieber','shawn mendes','charlie puth','ed sheeran','bruno mars','the chainsmokers','marshmello','halsey','bebe rexha','ava max','zara larsson','anne-marie','mabel','rita ora','little mix','fifth harmony','selena gomez','miley cyrus','demi lovato','nick jonas','jonas brothers','one direction','5 seconds of summer','why don\'t we','lauv','jeremy zucker','chelsea cutler','alec benjamin','conan gray','gracie abrams','phoebe bridgers','clairo'],
  'rock': ['arctic monkeys','tame impala','the strokes','red hot chili peppers','foo fighters','nirvana','pearl jam','green day','blink-182','fall out boy','panic! at the disco','twenty one pilots','imagine dragons','onerepublic','coldplay','u2','radiohead','the 1975','glass animals','cage the elephant','the black keys','queens of the stone age','muse','the killers'],
  'electronic': ['flume','disclosure','kaytranada','jamie xx','four tet','floating points','bicep','ross from friends','mall grab','lo-fi house','fred again','skrillex','diplo','major lazer','calvin harris','david guetta','kygo','avicii','zedd','illenium','odesza','rufus du sol','lane 8','above & beyond','deadmau5','eric prydz','carl cox','fisher','chris lake','dom dolla'],
  'latin': ['bad bunny','j balvin','daddy yankee','ozuna','anuel aa','farruko','nicky jam','maluma','rauw alejandro','jhay cortez','myke towers','sech','lunay','tainy','karol g','becky g','rosalía','anitta','shakira'],
  'indie': ['mac demarco','steve lacy','rex orange county','boy pablo','men i trust','khruangbin','mild high club','homeshake','her\'s','peach pit','wallows','dayglow','gus dapperton','benee','beabadoobee','girl in red','mxmtoon','chloe moriondo','remi wolf','role model','dominic fike'],
  'jazz': ['robert glasper','kamasi washington','thundercat','flying lotus','terrace martin','badbadnotgood','snarky puppy','cory henry','jacob collier','louis cole','knower','vulfpeck','fearless flyers','theo croker','christian scott'],
  'country': ['morgan wallen','luke combs','chris stapleton','zach bryan','tyler childers','kacey musgraves','maren morris','kane brown','luke bryan','jason aldean','thomas rhett','florida georgia line','dan + shay'],
  'dancehall': ['popcaan','vybz kartel','alkaline','masicka','skillibeng','spice','shenseea','koffee','protoje','chronixx']
};

function classifyGenre(artistName) {
  const artist = artistName.toLowerCase();
  for (const [genre, artists] of Object.entries(ARTIST_GENRES)) {
    if (artists.some(a => artist.includes(a) || a.includes(artist))) {
      return genre;
    }
  }
  return 'other';
}

// PKCE helpers
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function startAuth() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
  
  localStorage.setItem('code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  });
  
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function getToken(code) {
  const codeVerifier = localStorage.getItem('code_verifier');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
  }
  return data.access_token;
}

async function fetchSpotify(endpoint, token) {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Spotify API error: ${response.status}`);
  return response.json();
}

async function fetchAllPlaylists(token) {
  const playlists = [];
  let offset = 0;
  let total = 1;
  
  while (offset < total) {
    const data = await fetchSpotify(`/me/playlists?limit=50&offset=${offset}`, token);
    total = data.total;
    playlists.push(...data.items);
    offset += 50;
    updateLoadingProgress(`Fetching playlists... ${playlists.length}/${total}`);
  }
  
  return playlists;
}

async function fetchPlaylistTracks(playlistId, token) {
  const tracks = [];
  let offset = 0;
  const limit = 100;
  let total = Infinity;
  
  while (offset < total) {
    const data = await fetchSpotify(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, token);
    total = data.total;
    
    // Push ALL items - we'll filter later with better debugging
    if (data.items) {
      tracks.push(...data.items);
    }
    
    offset += limit;
  }
  
  return tracks;
}

async function fetchUserProfile(token) {
  return await fetchSpotify('/me', token);
}

function updateLoadingProgress(text) {
  document.getElementById('loading-progress').textContent = text;
}

async function loadSpotifyData(token) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('loading').classList.add('visible');
  document.getElementById('loading-text').textContent = 'Loading your music...';
  
  try {
    // Fetch user profile
    const user = await fetchUserProfile(token);
    localStorage.setItem('user_name', user.display_name || user.id);
    localStorage.setItem('user_image', user.images?.[0]?.url || '');
    
    // Fetch all playlists
    const playlistsRaw = await fetchAllPlaylists(token);
    
    // Fetch tracks for all playlists in parallel (with concurrency limit)
    let completed = 0;
    const total = playlistsRaw.length;
    const CONCURRENCY = 6; // Spotify rate limit friendly
    
    // Process playlists in batches - return raw data, merge later
    const processPlaylist = async (p) => {
      try {
        const tracks = await fetchPlaylistTracks(p.id, token);
        const playlistTracks = [];
        
        let skippedNull = 0, skippedLocal = 0, skippedEpisode = 0;
        
        for (const item of tracks) {
          const track = item.track;
          
          // Debug: count what we're skipping
          if (!track || !track.id) { skippedNull++; continue; }
          if (track.is_local) { skippedLocal++; continue; }
          if (track.type === 'episode') { skippedEpisode++; continue; }
          
          playlistTracks.push({
            id: track.id,
            name: track.name,
            artist: track.artists?.[0]?.name || 'Unknown',
            img: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || '',
          });
        }
        
        // Log if we skipped anything
        if (skippedNull + skippedLocal + skippedEpisode > 0) {
          console.log(`Playlist "${p.name}": ${playlistTracks.length} tracks kept, skipped ${skippedNull} null, ${skippedLocal} local, ${skippedEpisode} episodes`);
        }
        
        // Return playlist even if empty (so we can debug)
        return { id: p.id, name: p.name, tracks: playlistTracks, totalFromApi: tracks.length };
      } catch (e) {
        console.warn(`Failed to load playlist ${p.name}:`, e);
        return null;
      }
    };
    
    // Run with concurrency limit
    const runWithConcurrency = async (items, fn, limit) => {
      const results = [];
      const executing = new Set();
      
      for (const item of items) {
        const promise = fn(item).then(result => {
          executing.delete(promise);
          completed++;
          updateLoadingProgress(`Loading playlists... ${completed}/${total}`);
          return result;
        });
        
        executing.add(promise);
        results.push(promise);
        
        if (executing.size >= limit) {
          await Promise.race(executing);
        }
      }
      
      return Promise.all(results);
    };
    
    updateLoadingProgress(`Loading playlists... 0/${total}`);
    const playlistResults = await runWithConcurrency(playlistsRaw, processPlaylist, CONCURRENCY);
    
    // Now merge all results into songs and playlists (single-threaded, no race conditions)
    const songs = {};
    const playlists = [];
    
    let totalTracksFromApi = 0;
    let totalTracksAfterFilter = 0;
    
    for (const result of playlistResults) {
      if (!result) continue;
      
      totalTracksFromApi += result.totalFromApi;
      totalTracksAfterFilter += result.tracks.length;
      
      const songIds = [];
      for (const track of result.tracks) {
        songIds.push(track.id);
        
        if (!songs[track.id]) {
          songs[track.id] = {
            i: track.id,
            n: track.name,
            a: track.artist,
            img: track.img,
            c: classifyGenre(track.artist)
          };
        }
      }
      
      // Always add playlist (even if empty, for debugging)
      playlists.push({ i: result.id, n: result.name, s: songIds });
    }
    
    console.log(`=== LOADING SUMMARY ===`);
    console.log(`Playlists fetched: ${playlistResults.filter(r => r).length}`);
    console.log(`Total tracks from API: ${totalTracksFromApi}`);
    console.log(`Total tracks after filtering: ${totalTracksAfterFilter}`);
    console.log(`Unique songs: ${Object.keys(songs).length}`);
    
    // Build MUSIC_DATA
    window.MUSIC_DATA = {
      songs: Object.values(songs),
      playlists: playlists
    };
    
    console.log(`Final: ${MUSIC_DATA.songs.length} songs from ${MUSIC_DATA.playlists.length} playlists`);
    
    // Initialize visualization
    document.getElementById('loading').classList.remove('visible');
    init();
    
  } catch (error) {
    console.error('Error loading Spotify data:', error);
    document.getElementById('loading-text').textContent = 'Error loading data. Please try again.';
    document.getElementById('loading-progress').innerHTML = `<span style="color:#ff6b6b">${error.message}</span><br><br><a href="${window.location.pathname}" style="color:#4ecdc4">Retry</a>`;
  }
}

function logout() {
  localStorage.clear();
  window.location.href = window.location.pathname;
}

// ==================== VISUALIZATION ====================
const categoryColors = {
  'r&b': '#f39c12', 'hip-hop': '#1abc9c', 'pop': '#ff6b81', 'rock': '#e74c3c',
  'electronic': '#00d2d3', 'soul': '#9b59b6', 'latin': '#fd79a8', 'indie': '#a29bfe',
  'jazz': '#fdcb6e', 'country': '#d35400', 'dancehall': '#00b894', 'other': '#636e72'
};

const playlistColorPalette = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#dda0dd', '#f7dc6f',
  '#87ceeb', '#ff9f43', '#a29bfe', '#fd79a8', '#00cec9', '#e17055',
  '#74b9ff', '#55efc4', '#ffeaa7', '#fab1a0', '#81ecec', '#dfe6e9'
];

const categoryOrder = ['r&b', 'soul', 'hip-hop', 'pop', 'rock', 'electronic', 'latin', 'indie', 'jazz', 'country', 'dancehall', 'other'];

let zoom = 0.35, panX = 0, panY = 0, isPanning = false, panStartX = 0, panStartY = 0;
let hoveredPlaylist = null, hoveredCategory = null, hoveredPlaylistIdx = -1;
let playlistColors = {}, playlistColorIdx = {}, songPopularity = {}, sortedSongs = [], songElements = new Map();

const catToClass = {
  'r&b': 'rb', 'hip-hop': 'hiphop', 'pop': 'pop', 'rock': 'rock',
  'electronic': 'electronic', 'soul': 'soul', 'latin': 'latin', 'indie': 'indie',
  'jazz': 'jazz', 'country': 'country', 'dancehall': 'dancehall', 'other': 'other'
};

let songToPlaylists = {};

function generateSpiralPositions(count, gridSize) {
  const positions = [];
  const center = Math.floor(gridSize / 2);
  let x = center, y = center, dx = 0, dy = -1;
  for (let i = 0; i < gridSize * gridSize && positions.length < count; i++) {
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) positions.push({ row: y, col: x });
    if (x === y || (x < center && x === -y + center * 2) || (x > center && x === -y + center * 2 + 1)) { const t = dx; dx = -dy; dy = t; }
    x += dx; y += dy;
  }
  return positions;
}

function analyzeTaste() {
  const playlists = MUSIC_DATA.playlists;
  const songs = MUSIC_DATA.songs;
  
  let totalPairs = 0, overlapSum = 0;
  
  for (let i = 0; i < playlists.length; i++) {
    for (let j = i + 1; j < playlists.length; j++) {
      const set1 = new Set(playlists[i].s);
      const set2 = new Set(playlists[j].s);
      const intersection = [...set1].filter(x => set2.has(x)).length;
      const minSize = Math.min(set1.size, set2.size);
      if (minSize > 0) {
        overlapSum += intersection / minSize;
        totalPairs++;
      }
    }
  }
  
  const avgOverlap = totalPairs > 0 ? overlapSum / totalPairs : 0;
  const multiPlaylistSongs = songs.filter(s => songPopularity[s.i] > 1).length;
  const genresUsed = new Set(songs.map(s => s.c)).size;
  const focusScore = Math.min(100, Math.max(0, Math.round(avgOverlap * 100 * 2.5)));
  
  let label, color;
  if (focusScore < 20) { label = "🦄 Wildly Eclectic"; color = "#a29bfe"; }
  else if (focusScore < 35) { label = "🎨 Diverse Explorer"; color = "#74b9ff"; }
  else if (focusScore < 50) { label = "🎧 Balanced Listener"; color = "#00cec9"; }
  else if (focusScore < 65) { label = "🎯 Curated Taste"; color = "#55efc4"; }
  else if (focusScore < 80) { label = "💎 Focused Collector"; color = "#ffeaa7"; }
  else { label = "🔥 Ultra Cohesive"; color = "#ff6b6b"; }
  
  document.getElementById('taste-label').textContent = label;
  document.getElementById('taste-label').style.color = color;
  
  const bar = document.getElementById('taste-bar');
  bar.style.width = focusScore + '%';
  bar.style.background = `linear-gradient(90deg, #a29bfe, ${color})`;
  
  document.getElementById('taste-stats').innerHTML = `
    <div class="taste-stat"><div class="taste-stat-value" style="color:${color}">${focusScore}%</div><div class="taste-stat-label">Focus Score</div></div>
    <div class="taste-stat"><div class="taste-stat-value">${multiPlaylistSongs}</div><div class="taste-stat-label">Crossover Songs</div></div>
    <div class="taste-stat"><div class="taste-stat-value">${Math.round(avgOverlap * 100)}%</div><div class="taste-stat-label">Avg Overlap</div></div>
    <div class="taste-stat"><div class="taste-stat-value">${genresUsed}</div><div class="taste-stat-label">Genres</div></div>
  `;
}

function init() {
  console.log(`Initializing with ${MUSIC_DATA.songs.length} songs...`);
  
  // Update user info
  const userName = localStorage.getItem('user_name') || 'User';
  const userImage = localStorage.getItem('user_image');
  document.getElementById('user-name').textContent = userName;
  if (userImage) {
    document.getElementById('user-avatar').innerHTML = `<img src="${userImage}" alt="">`;
  } else {
    document.getElementById('user-avatar').textContent = userName[0].toUpperCase();
  }
  
  // Build indexes
  MUSIC_DATA.songs.forEach(s => { songPopularity[s.i] = 0; songToPlaylists[s.i] = []; });
  MUSIC_DATA.playlists.forEach((p, i) => { 
    playlistColors[p.i] = playlistColorPalette[i % playlistColorPalette.length];
    playlistColorIdx[p.i] = i % playlistColorPalette.length;
    p.s.forEach(songId => {
      if (songToPlaylists[songId] !== undefined) {
        songToPlaylists[songId].push(p.i);
        songPopularity[songId]++;
      }
    });
  });
  
  sortedSongs = [...MUSIC_DATA.songs].sort((a, b) => (songPopularity[b.i] - songPopularity[a.i]) || (categoryOrder.indexOf(a.c) - categoryOrder.indexOf(b.c)));
  
  // Adjust zoom based on song count
  if (sortedSongs.length > 2000) zoom = 0.3;
  else if (sortedSongs.length > 1000) zoom = 0.4;
  else if (sortedSongs.length > 500) zoom = 0.5;
  else zoom = 0.6;
  
  document.getElementById('song-count').textContent = MUSIC_DATA.songs.length;
  document.getElementById('playlist-count').textContent = MUSIC_DATA.playlists.length;
  
  renderGenres();
  renderPlaylists();
  renderGrid();
  analyzeTaste();
  setupEventListeners();
  
  document.getElementById('app').classList.add('ready');
}

function renderGenres() {
  const cats = {}; MUSIC_DATA.songs.forEach(s => { cats[s.c] = (cats[s.c] || 0) + 1; });
  const container = document.getElementById('genres');
  container.innerHTML = Object.entries(cats)
    .sort((a, b) => categoryOrder.indexOf(a[0]) - categoryOrder.indexOf(b[0]))
    .map(([c, n]) => `<div class="genre-item" data-category="${c}"><div class="genre-dot" style="background:${categoryColors[c]}"></div><span class="genre-name">${c}</span><span class="genre-count">${n}</span></div>`).join('');
  
  container.onmouseover = e => {
    const item = e.target.closest('.genre-item');
    if (item && hoveredCategory !== item.dataset.category) { hoveredCategory = item.dataset.category; updateHighlights(); }
  };
  container.onmouseleave = () => { hoveredCategory = null; updateHighlights(); };
}

function renderPlaylists() {
  const container = document.getElementById('playlists');
  container.innerHTML = MUSIC_DATA.playlists.map((p, i) => 
    `<div class="playlist-item" data-playlist="${p.i}" data-idx="${i % playlistColorPalette.length}"><div class="playlist-dot" style="background:${playlistColors[p.i]}"></div><div class="playlist-info"><div class="playlist-name">${p.n}</div><div class="playlist-count">${p.s.length} songs</div></div></div>`
  ).join('');
  
  container.onmouseover = e => {
    const item = e.target.closest('.playlist-item');
    if (item && hoveredPlaylist !== item.dataset.playlist) { hoveredPlaylist = item.dataset.playlist; updateHighlights(); }
  };
  container.onmouseleave = () => { hoveredPlaylist = null; updateHighlights(); };
}

function renderGrid() {
  const gridSize = Math.ceil(Math.sqrt(sortedSongs.length));
  const positions = generateSpiralPositions(sortedSongs.length, gridSize);
  const grid = document.getElementById('grid');
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 52px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 52px)`;
  
  const fragment = document.createDocumentFragment();
  sortedSongs.forEach((song, idx) => {
    const pos = positions[idx]; if (!pos) return;
    const tile = document.createElement('div');
    tile.className = 'song-tile';
    tile.dataset.song = song.i;
    tile.dataset.category = song.c;
    tile.style.cssText = `grid-row:${pos.row+1};grid-column:${pos.col+1};background:${categoryColors[song.c]}`;
    tile.innerHTML = `<img src="${song.img}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="fallback" style="display:none;background:${categoryColors[song.c]}">${song.n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div><div class="category-bar" style="background:${categoryColors[song.c]}"></div>${songPopularity[song.i]>1?`<div class="popularity-badge">${songPopularity[song.i]}</div>`:''}`;
    tile.onmouseenter = e => showTooltip(e, song.i);
    tile.onmouseleave = hideTooltip;
    tile.onmousemove = moveTooltip;
    fragment.appendChild(tile);
    songElements.set(song.i, tile);
  });
  grid.appendChild(fragment);
  updateTransform();
}

function updateHighlights() {
  const shouldDim = hoveredPlaylist || hoveredCategory;
  let highlightedSongs, hlClass = '';
  
  if (hoveredPlaylist) {
    const playlist = MUSIC_DATA.playlists.find(p => p.i === hoveredPlaylist);
    highlightedSongs = playlist ? new Set(playlist.s) : new Set();
    hlClass = 'hl-' + playlistColorIdx[hoveredPlaylist];
  } else if (hoveredCategory) {
    highlightedSongs = new Set();
    MUSIC_DATA.songs.forEach(s => { if (s.c === hoveredCategory) highlightedSongs.add(s.i); });
    hlClass = 'hl-cat-' + catToClass[hoveredCategory];
  } else {
    highlightedSongs = new Set();
  }
  
  requestAnimationFrame(() => {
    songElements.forEach((el, songId) => {
      const isHighlighted = highlightedSongs.has(songId);
      el.className = 'song-tile' + (shouldDim && !isHighlighted ? ' dimmed' : '') + (isHighlighted ? ' highlighted ' + hlClass : '');
    });
  });
}

function showTooltip(e, songId) {
  const song = MUSIC_DATA.songs.find(s => s.i === songId); if (!song) return;
  const playlistIds = songToPlaylists[songId] || [];
  const pls = playlistIds.map(pid => MUSIC_DATA.playlists.find(p => p.i === pid)).filter(Boolean);
  document.getElementById('tooltip-song').textContent = song.n;
  document.getElementById('tooltip-artist').textContent = song.a;
  const cb = document.getElementById('tooltip-category');
  cb.textContent = song.c; cb.style.background = categoryColors[song.c]+'35'; cb.style.color = categoryColors[song.c];
  document.getElementById('tooltip-playlists').innerHTML = pls.slice(0,5).map(p => `<span class="playlist-tag" style="background:${playlistColors[p.i]}25;color:${playlistColors[p.i]}">${p.n.length>16?p.n.slice(0,16)+'...':p.n}</span>`).join('');
  document.getElementById('tooltip').classList.add('visible');
  moveTooltip(e);
}

function moveTooltip(e) {
  const t = document.getElementById('tooltip'), r = t.getBoundingClientRect();
  t.style.left = Math.min(e.clientX+15, innerWidth-r.width-10)+'px';
  t.style.top = Math.max(10, Math.min(e.clientY-10, innerHeight-r.height-10))+'px';
}

function hideTooltip() { document.getElementById('tooltip').classList.remove('visible'); }

function updateTransform() {
  document.getElementById('grid-container').style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
  document.getElementById('zoom-level').textContent = Math.round(zoom * 100);
}

function adjustZoom(d) { zoom = Math.max(0.1, Math.min(2, zoom + d)); updateTransform(); }
function resetZoom() { zoom = 0.35; panX = 0; panY = 0; updateTransform(); }

function setupEventListeners() {
  const app = document.getElementById('app');
  app.onmousedown = e => {
    if (e.target.closest('.control-panel,.song-tile')) return;
    isPanning = true; panStartX = e.clientX - panX; panStartY = e.clientY - panY; app.classList.add('panning');
  };
  onmousemove = e => { if (isPanning) { panX = e.clientX - panStartX; panY = e.clientY - panStartY; updateTransform(); } };
  onmouseup = () => { isPanning = false; app.classList.remove('panning'); };
  app.onwheel = e => { if (!e.target.closest('.control-panel')) { e.preventDefault(); adjustZoom(e.deltaY > 0 ? -0.05 : 0.05); } };
  
  let st; document.getElementById('search').oninput = e => {
    clearTimeout(st); st = setTimeout(() => {
      const q = e.target.value.toLowerCase().trim(), res = document.getElementById('search-results');
      if (!q) { res.innerHTML = ''; return; }
      const m = MUSIC_DATA.songs.filter(s => s.n.toLowerCase().includes(q) || s.a.toLowerCase().includes(q)).slice(0,12);
      res.innerHTML = m.map(s => `<div class="search-result" data-song="${s.i}"><div>${s.n}</div><div class="artist">${s.a}</div></div>`).join('');
      res.querySelectorAll('.search-result').forEach(el => {
        el.onclick = () => { const t = songElements.get(el.dataset.song); if(t){ t.scrollIntoView({behavior:'smooth',block:'center'}); t.style.boxShadow='0 0 30px #fff'; setTimeout(()=>t.style.boxShadow='',1500); } };
      });
    }, 150);
  };
  
  document.getElementById('logout-btn').onclick = logout;
}

// ==================== INITIALIZATION ====================
(async function() {
  // Check for callback code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Exchange code for token
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('loading').classList.add('visible');
    document.getElementById('loading-text').textContent = 'Connecting to Spotify...';
    
    try {
      const token = await getToken(code);
      if (token) {
        await loadSpotifyData(token);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (e) {
      console.error(e);
      localStorage.clear();
      document.getElementById('loading-text').textContent = 'Authentication failed';
      document.getElementById('loading-progress').innerHTML = `<a href="${window.location.pathname}" style="color:#4ecdc4">Try again</a>`;
    }
    return;
  }
  
  // Check for existing valid token
  const token = localStorage.getItem('access_token');
  const expiry = localStorage.getItem('token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    await loadSpotifyData(token);
    return;
  }
  
  // Show login screen
  document.getElementById('login-btn').onclick = startAuth;
})();