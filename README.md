# StegSong (StegMP3 Gallery)

StegSong is a static gallery website that displays **MP3 data encoded PNG images** and plays the hidden audio directly in the browser.

It is designed to work with images produced by the StegMP3 encoder.

## How it works
- Each tile points at an encoded PNG in `./gallery/`.
- On click, the site fetches the PNG bytes, extracts the LSB payload, reads any trailing bytes after `IEND`, reconstructs the MP3, verifies SHAâ€‘256, and plays it.

## Run locally
From this folder:

```bat
python -m http.server 8000
```

Then open:
- http://localhost:8000/

## Add images (designâ€‘time)
Put encoded PNGs into:
- `gallery/`

Then sync the list into `index.html`:

```bat
sync-gallery.bat
```

This rewrites the `DESIGN_TIME_ITEMS` array in `index.html` to match the contents of `gallery/`.

## Notes
- Donâ€™t open the page via `file://` â€” the browser will block `fetch()` for local files.
- Donâ€™t use hosting/build steps that rewrite PNGs or strip trailing bytes.

## Files
- `index.html` â€” the gallery/player site.
- `sync-gallery.mjs` â€” sync script.
- `sync-gallery.bat` â€” Windows launcher for the sync script.

## License

Copyright (c) 2026 Adam Kingry. Licensed under the [MIT License](LICENSE).
