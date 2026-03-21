# 🎵 Common Ground

A visualization tool that shows how your Spotify playlists connect through shared songs. See your music taste laid out in a beautiful, interactive grid where the most popular songs spiral out from the center.

![Common Ground Screenshot](screenshot.png)

## Features

- **Visual Grid Layout** — Songs arranged in a spiral pattern with the most cross-playlist songs at the center
- **Playlist Highlighting** — Hover over any playlist to see which songs it contains light up on the grid
- **Genre Classification** — Automatic categorization by artist into 12 genres (R&B, Hip-Hop, Pop, Rock, Electronic, etc.)
- **Taste Profile Analysis** — Get a "Focus Score" measuring how eclectic vs. cohesive your music taste is
- **Search** — Find any song or artist quickly
- **Zoom & Pan** — Navigate large libraries with scroll-to-zoom and click-drag panning

## Live Demo

Visit: [https://bnidevs.github.io/common-ground/](https://bnidevs.github.io/common-ground/)

---

## ⚠️ Spotify API Restrictions

### Why can't I log in?

Spotify's API operates in **Development Mode** by default, which has strict limitations:

1. **Only 5 authorized users** — Apps in development mode can only be used by accounts explicitly added to the app's allowlist
2. **Manual approval required** — Each user's Spotify email must be added by the app owner in the Spotify Developer Dashboard
3. **Extended Quota requires review** — To allow public access, the app must go through Spotify's [quota extension process](https://developer.spotify.com/documentation/web-api/concepts/quota-modes), which requires a detailed review

### What this means for you

If you try to log in and see an error, it's because your Spotify account hasn't been added to the allowlist. You have two options:

1. **Request access** — Contact the project owner to have your Spotify email added (limited to 5 users total)
2. **Host your own version** — Create your own Spotify API app and deploy this project yourself (see below)

---

## 🛠️ Host It Yourself

Want to run Common Ground for yourself or your own group of users? Here's how:

### 1. Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create App**
4. Fill in the details:
   - **App name:** Common Ground (or whatever you like)
   - **App description:** Playlist visualization tool
   - **Redirect URI:** `https://YOUR-USERNAME.github.io/common-ground/spotify-callback/`
   - **APIs used:** Check "Web API"
5. Click **Create**
6. Go to **Settings** and note your **Client ID**

### 2. Add Authorized Users

While in development mode:

1. Go to your app in the Spotify Dashboard
2. Click **Settings** → **User Management**
3. Add the Spotify email addresses of users who should have access (up to 5)

### 3. Fork & Configure the Code

1. Fork this repository to your GitHub account

2. Edit `app.js` and update these values at the top:

```javascript
const CLIENT_ID = 'your-client-id-here';
const REDIRECT_URI = 'https://YOUR-USERNAME.github.io/common-ground/spotify-callback/';
```

3. Edit `spotify-callback/index.html` and update the redirect URL:

```javascript
window.location.href = 'https://YOUR-USERNAME.github.io/common-ground/?code=' + encodeURIComponent(code);
```

### 4. Deploy to GitHub Pages

1. Go to your forked repository's **Settings**
2. Navigate to **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Wait a few minutes for deployment

Your app will be live at: `https://YOUR-USERNAME.github.io/common-ground/`

### 5. Alternative: Local Development

To run locally:

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/common-ground.git
cd common-ground

# Serve with any static file server
npx serve .
# or
python -m http.server 8000
```

For local development, update your Spotify app's Redirect URI to `http://localhost:8000/spotify-callback/` (or whatever port you're using), and update the constants in the code to match.

---

## Project Structure

```
common-ground/
├── index.html              # Main HTML structure
├── style.css               # All styles
├── app.js                  # Application logic
│   ├── Spotify OAuth (PKCE flow)
│   ├── Playlist/track fetching with retry logic
│   ├── Genre classification
│   └── Visualization rendering
├── spotify-callback/
│   └── index.html          # OAuth callback handler
└── README.md
```

---

## Technical Details

### Authentication

Uses Spotify's **Authorization Code with PKCE** flow — no backend server required. Tokens are stored in `localStorage` and automatically used on return visits until they expire.

### Rate Limiting

The Spotify API has rate limits. This app handles them with:
- **Retry with exponential backoff** — Automatically retries failed requests with increasing delays
- **Respects Retry-After header** — Uses Spotify's suggested wait time when provided
- **Controlled concurrency** — Limits parallel requests to avoid hitting limits

### Genre Classification

Songs are categorized by matching artist names against a curated list of ~300 artists across 12 genres. Artists not in the list are classified as "other".

---

## Privacy

- **No server-side storage** — All data stays in your browser
- **No tracking** — No analytics or data collection
- **Token security** — Access tokens are stored locally and never transmitted to any server other than Spotify's API

---

## License

MIT License — feel free to fork, modify, and use however you like.

---

## Contributing

Issues and pull requests welcome! Some ideas for improvements:
- More artists in the genre classification database
- Spotify's audio features API for better genre detection
- Cluster visualization by genre
- Export/share functionality
- Mobile touch support improvements
