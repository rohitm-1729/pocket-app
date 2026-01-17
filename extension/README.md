# Pocket App Chrome Extension

Save articles to your Pocket App with one click.

## Installation

1. **Generate icons** (required):
   ```bash
   # Option 1: Use an online converter
   # Convert extension/icons/icon.svg to PNG at 16x16, 48x48, and 128x128
   # Save as icon16.png, icon48.png, icon128.png

   # Option 2: Use ImageMagick (if installed)
   convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
   convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
   convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Make sure the backend is running**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

## Usage

1. Click the extension icon while on any article page
2. Log in with your Pocket App credentials (first time only)
3. Click "Save Article" to save the current page
4. Click "Open Pocket App" to view your saved articles

## Development

The extension connects to `http://localhost:8000` by default.

To change the API URL for production, update the `API_URL` in `popup.js` and add your domain to `host_permissions` in `manifest.json`.

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI
- `popup.js` - Popup logic and API calls
- `icons/` - Extension icons
