# Es FÜGT sich — website

Minimal site for a research project about connections/joints for reused concrete elements.

## Local preview
Open `index.html` in your browser, or use a simple static server (recommended):
```bash
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Replace models
Export your Rhino models as **.glb** (or .gltf) and put them in `/models`.
In `catalogue.html`, update the `<model-viewer>` `src` attributes to point at your files.

## Deploy to GitHub Pages
1. Create a repository (e.g., `es-fuegt-sich`).
2. Add/commit the files in this folder.
3. Push to the **main** branch.
4. In *Settings → Pages*, set **Source** to *Deploy from a branch*, branch **main**, folder **/** (root).
5. Your site will be live at `https://<your-username>.github.io/es-fuegt-sich/`.

