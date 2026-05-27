# ImageRestore — Digital Image Processing Studio

**Live:** https://imagerestoreproject.vercel.app/

A web-based Digital Image Processing application covering Exercises 1, 4, 5, 6, 7, 8, 9, 11, 12, and 13.

## Quick Start

### 1. Start the Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 2. Start the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## Features & DIP Exercise Mapping

| Module | Exercise | Description |
|---|---|---|
| Contrast Enhancement | Exercise 4 | Histogram equalization, contrast stretching |
| Image Smoothing | Exercise 8 | Mean filter, Median filter, Gaussian filter |
| Image Sharpening | Exercise 9 | Laplacian sharpen, Unsharp masking |
| Edge Detection | Exercise 9 & 13 | Sobel, Prewitt, Canny edge detection |
| Artistic Effects | (Creative) | Pencil sketch, Painting effect, Vintage/Sepia |
| Image Negative | Exercise 1 | Binary & grayscale negative |
| Image Restoration | Exercise 11 | Noise add/remove, Wiener deblur, Binarization, Thinning |
| Image Analysis | Exercise 7 | Mean, Std Dev, Correlation Coefficient, per-channel stats |
| FFT Visualization | Exercise 6 | 2D spectrum + 1D row slice chart |
| Intensity Slicing | Exercise 12 | Highlight a specific intensity range |
| Bit Plane Slicing | Exercise 5 | Extract individual bit planes (0–7) |

## Project Structure

```
DIP Final Project/
├── backend/
│   ├── app.py          Flask REST API
│   ├── filters.py      All OpenCV image processing functions
│   ├── analysis.py     Stats computation + Matplotlib histogram generation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         Upload / Download bar
│   │   │   ├── Sidebar.jsx        Category + tool selection
│   │   │   ├── ImageCanvas.jsx    Side-by-side before/after view
│   │   │   ├── ControlPanel.jsx   Dynamic sliders & Apply button
│   │   │   ├── AnalysisPanel.jsx  Stats table + histograms
│   │   │   └── FFTChart.jsx       Recharts 1D FFT line chart
│   │   ├── toolsConfig.js  Central tool/parameter definitions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js  (proxies /api → localhost:5000)
└── README.md
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/contrast` | Histogram equalization / Contrast stretching |
| POST | `/api/filter` | Smoothing, sharpening, edge detection, artistic |
| POST | `/api/restore` | Noise, deblur, binarize, thinning |
| POST | `/api/analyze` | Stats + histogram for original image |
| POST | `/api/fft` | 2D spectrum image or 1D array |
| POST | `/api/intensity-slice` | Intensity range highlighting |
| POST | `/api/bitplane` | Bit plane extraction |
| GET  | `/api/health` | Server health check |

All POST endpoints accept `{ "image": "<base64 data URL>", "method": "...", "params": {...} }`  
and return `{ "processed": "<base64>", "stats_original": {...}, "stats_processed": {...}, "histogram_original": "<base64>", "histogram_processed": "<base64>" }`.
