# The Last Rebound — 2D prototype

A top-down cinematic survival-horror prototype built with Phaser 3 and JavaScript.

## Run it

Because browsers restrict local asset loading, run a small local server from this folder:

**Option 1 — VS Code**
1. Open this folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` → **Open with Live Server**.

**Option 2 — Python**
1. Open a terminal in this folder.
2. Run `python -m http.server 8000`.
3. Visit `http://localhost:8000`.

The Phaser library is loaded from jsDelivr, so an internet connection is needed on first load.

## Controls
- WASD / arrow keys — move
- Shift — run
- F — flashlight on/off
- E — interact with trampolines, memories, and exit
- Esc — pause / resume

## Current playable slice
- Title screen and art direction
- Top-down trampoline park layout, collision, player movement and camera follow
- Flashlight vignette / halo lighting treatment
- Past/present trampoline switching with a 24-second memory timer
- Three memory objects and an exit objective
- A shadow copy that begins following after repeated timeline changes
- Win and lose states

This is the first playable foundation, not the finished 15–20 minute game. The generated title/reference images are mood artwork; the playable level is currently drawn in-engine. Next production passes should replace placeholder character art with authored animated sprites, add a true directional flashlight cone, richer environmental art, sound, dialogue/cutscenes, and expanded puzzle/chase sequences.
