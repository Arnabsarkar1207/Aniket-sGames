# Toddler Games

Open `index.html` for the home screen. Tiles lead to `cars.html` and `animals.html`.

## Put it online (free, about 5 minutes)

**Easiest: Netlify Drop**
1. On a computer, unzip this folder.
2. Go to app.netlify.com/drop and drag the whole folder onto the page.
3. You get a link like `https://something.netlify.app`.

**Or GitHub Pages**
1. Create a new public repo and upload all these files to the top level.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Your link is `https://YOUR-NAME.github.io/REPO-NAME/`.

## Install on the phone
- **iPhone (Safari):** Share > Add to Home Screen.
- **Android (Chrome):** menu > Install app (or Add to Home screen).

After the first open it works offline.

## Parent corner
Press and hold the house button (top-left) until the ring fills to go back to the home screen. On Cars, press and hold the small camera (top-right) to add real photos from the phone.

## Sounds
Real recordings live in `sounds/` (credits in `sounds/CREDITS.md`). To swap one, replace the mp3 with the same name and bump `VERSION` in `sw.js`.

## Adding a game later
1. Add `mygame.html` to the folder.
2. Add one line to the `GAMES` list in `index.html`.
3. Add `'mygame.html'` to `CORE` in `sw.js` and bump `VERSION` (v1 to v2) so phones update.

## Renaming the app
Change `name` and `short_name` in `manifest.webmanifest`, plus the `<title>` in `index.html`.
