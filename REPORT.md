# Digital Image Processing — Final Project Report 2024

| | |
|---|---|
| **Name** | Darcy |
| **Email** | 202380018@psu.palawan.edu.ph |
| **Course/Block** | __________________ |
| **Semester/SY** | 2nd Semester 2024 |
| **Project Title** | ImageRestore |
| **Live App** | https://imagerestoreproject.vercel.app/ |

---

## Part I

### A. Software/Application

**ImageRestore** — a browser-based Digital Image Processing tool for image enhancement, analysis, and restoration.

---

### B. Project Description

ImageRestore is a web application that lets users upload any image and apply a range of image processing techniques in real time. It features a before/after split-view comparison, live parameter controls, and a statistics/histogram panel at the bottom. No installation needed — it runs entirely in the browser.

Built with:
- **Frontend:** React (Vite + Tailwind CSS) deployed on Vercel
- **Backend:** Python Flask + OpenCV deployed on Render

---

### C. Procedure / Algorithm

#### 1. Image Upload
- User uploads an image via drag-and-drop or file picker
- Image is read as a Base64 data URL and sent to the Flask backend on each Apply

#### 2. Preprocessing (all exercises)
- Backend decodes the Base64 string to a NumPy array via `cv2.imdecode`
- Output is re-encoded as a Base64 PNG and returned to the frontend

#### 3. Contrast Enhancement *(Exercise 4)*
- **Histogram Equalization:** Image is converted to YCrCb color space. Only the Y (luminance) channel is equalized using `cv2.equalizeHist`, then converted back to BGR. This preserves color while improving contrast.
- **Contrast Stretching:** Per-channel linear stretching. Low and high percentile values are computed (`np.percentile`), then pixel values are scaled to fill the full 0–255 range.

#### 4. Image Negative *(Exercise 1)*
- Straightforward pixel inversion: `result = 255 - img`
- Works on both grayscale and color images

#### 5. Smoothing Filters *(Exercise 8)*
- **Mean Filter:** `cv2.blur(img, (k, k))` — averages each pixel with its neighbors
- **Median Filter:** `cv2.medianBlur(img, k)` — replaces each pixel with the median of neighbors; effective against salt-and-pepper noise
- **Gaussian Filter:** `cv2.GaussianBlur(img, (k, k), sigma)` — weighted average giving more influence to nearby pixels

#### 6. Sharpening & Edge Detection *(Exercise 9)*
- **Laplacian Sharpen:** Computes the Laplacian (`cv2.Laplacian`) and subtracts it from the original to enhance edges
- **Unsharp Mask:** Blurs the image first, then blends: `result = original × (1 + strength) - blurred × strength`
- **Sobel:** Computes X and Y gradients separately, combines as magnitude: `√(Sx² + Sy²)`
- **Prewitt:** Same principle as Sobel but uses a different kernel (equal weights per direction)

#### 7. Canny Edge Detection *(Exercise 13)*
- Converts to grayscale, then applies `cv2.Canny(gray, threshold1, threshold2)`
- Uses double thresholding and edge tracking by hysteresis

#### 8. FFT Visualization *(Exercise 6)*
- **2D FFT:** Converts to grayscale → `np.fft.fft2` → `np.fft.fftshift` → log magnitude → normalized → COLORMAP_VIRIDIS colormap applied for visualization
- **1D FFT:** Takes the middle row of the grayscale image → `np.fft.fft` → `fftshift` → normalized magnitude → returned as a data array and plotted as a line chart on the frontend using Recharts

#### 9. Image Statistics *(Exercise 7)*
- **Mean & Std Dev:** `np.mean`, `np.std` on the grayscale-flattened image
- **Correlation Coefficient:** `np.corrcoef` computed on the first and second halves of the pixel array
- **Per-channel stats:** Mean and std calculated individually for Blue, Green, and Red channels
- Results are shown in the Analysis tab of the bottom panel

#### 10. Image Restoration *(Exercise 11)*
- **Add Gaussian Noise:** `np.random.normal(mean, std, img.shape)` added to pixel values
- **Remove Gaussian Noise:** `cv2.GaussianBlur` with a tunable kernel size
- **Add Salt & Pepper Noise:** Random pixels set to 0 or 255 based on a density value
- **Remove Salt & Pepper:** `cv2.medianBlur` — median filter is ideal for this noise type
- **Wiener Deblur:** Motion blur kernel constructed, then Wiener filter applied in the frequency domain using `np.fft.fft2` and conjugate: `H* / (|H|² + noise_var)`
- **Binarization:** Supports Otsu (`cv2.THRESH_OTSU`), Adaptive (`cv2.adaptiveThreshold`), and manual thresholding
- **Thinning:** Iterative morphological skeletonization using erosion + dilation until no pixels remain

#### 11. Intensity Slicing *(Exercise 12)*
- Converts to grayscale, creates a boolean mask for pixels within [low, high]
- Matching pixels are replaced with a user-selected highlight color (default: green)

#### 12. Bit Plane Slicing *(Exercise 5)*
- Converts to grayscale, extracts bit plane n: `plane = ((gray >> n) & 1) * 255`
- Bit 7 (MSB) contains most of the visual structure; Bit 0 (LSB) is mostly noise

#### 13. Artistic Effects *(Additional)*
- **Pencil Sketch:** Grayscale → invert → blur → divide original by blurred
- **Painting Effect:** Three passes of `cv2.bilateralFilter` + adaptive threshold for edge overlay
- **Vintage/Sepia:** Sepia matrix transform + Gaussian vignette applied to corners

---

### D. Code Implementation

The full source code is available at: https://github.com/darcykekw/ImageRestore

**Stack summary:**

| Layer | Technology |
|---|---|
| Image processing | Python, OpenCV, NumPy, SciPy, Matplotlib |
| API server | Flask + flask-cors, deployed on Render |
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts (histogram + FFT chart) |
| Deployment | Vercel (frontend) + Render (backend) |

**Key files:**
- `backend/filters.py` — all image processing functions
- `backend/analysis.py` — stats and histogram generation
- `backend/app.py` — Flask API endpoints
- `frontend/src/toolsConfig.js` — tool definitions and parameters
- `frontend/src/App.jsx` — main state and API logic
- `frontend/src/components/` — UI components

---

### E. Output Images

> **Note:** Take screenshots from https://imagerestoreproject.vercel.app/ using a test image.

---

**[IMAGE 1] — App Overview**
> Screenshot of the full app with an image loaded, showing the sidebar, before/after canvas, and bottom panel.

---

**[IMAGE 2] — Exercise 4: Histogram Equalization**
> Apply "Histogram Equalization" on a low-contrast image. Show the before/after split and the histogram comparison in the Histogram tab.

---

**[IMAGE 3] — Exercise 4: Contrast Stretching**
> Apply "Contrast Stretching" with low=2, high=98. Show the before/after result.

---

**[IMAGE 4] — Exercise 1: Image Negative**
> Apply "Image Negative." Show the inverted color result.

---

**[IMAGE 5] — Exercise 8: Smoothing Filters**
> Apply "Mean Filter," "Median Filter," and "Gaussian Filter" (can be three separate screenshots or a collage). Show the softening/blur effect.

---

**[IMAGE 6] — Exercise 9: Sharpening**
> Apply "Laplacian Sharpen" and "Unsharp Mask." Show the enhanced edge sharpness.

---

**[IMAGE 7] — Exercise 9 & 13: Edge Detection**
> Apply "Sobel," "Prewitt," and "Canny" edge detection. Three screenshots showing edge maps.

---

**[IMAGE 8] — Exercise 6: FFT 2D**
> Apply "FFT 2D." Show the frequency spectrum output (the colormap visualization).

---

**[IMAGE 9] — Exercise 6: FFT 1D**
> Select "FFT 1D" and click the FFT tab in the bottom panel. Show the frequency spectrum line chart.

---

**[IMAGE 10] — Exercise 7: Image Statistics**
> Click "Analyze" with an image loaded. Show the Analysis tab with Mean, Std Dev, Correlation, and per-channel stats.

---

**[IMAGE 11] — Exercise 11: Noise & Restoration**
> Apply "Add Gaussian Noise," then "Remove Gaussian Noise." Two screenshots showing before/after noise removal.

---

**[IMAGE 12] — Exercise 11: Binarization & Thinning**
> Apply "Binarize (Otsu)" then "Image Thinning." Show the binary and skeletonized result.

---

**[IMAGE 13] — Exercise 12: Intensity Slicing**
> Apply "Intensity Slicing" with a mid-range selection. Show the highlighted intensity band.

---

**[IMAGE 14] — Exercise 5: Bit Plane Slicing**
> Apply "Bit Plane Slicing" on Bit 7 and Bit 0. Two screenshots showing the difference between MSB and LSB planes.

---

## Part II

### 1. Significance

Most DIP tools are either too complex (MATLAB, heavy desktop apps) or too basic (single-purpose scripts). ImageRestore puts everything in one place — accessible from any browser, no setup needed. It's genuinely useful for studying DIP concepts visually, since you can see the exact effect of each algorithm in real time.

### 2. Technology Relation

Every algorithm in this project has a real-world counterpart:

| Feature | Real-world use |
|---|---|
| Histogram Equalization | Medical imaging (X-ray/MRI contrast) |
| Noise removal | Camera firmware, satellite imagery |
| Wiener Deblur | Forensic image recovery |
| Canny Edge Detection | Autonomous vehicles, object detection |
| FFT | Signal analysis, image compression (JPEG uses DCT, a cousin of FFT) |
| Binarization + Thinning | OCR, fingerprint recognition |

### 3. Learning Enhancement

Building this pushed me to go beyond just understanding the theory — I had to actually implement each algorithm from scratch and debug it on real images. The full-stack aspect (Python backend + React frontend) also taught me how to design a clean API and manage state across components. The before/after comparison especially helped me understand what each filter actually does to an image.

### 4. Innovation and Application

What makes this different from a typical command-line DIP project is the drag-and-compare interface — you can slide between before and after in real time. The parameter sliders let you fine-tune values and immediately see the impact, which turns abstract equations into something you can actually feel. It's also the only tool in this project batch that's live on the web and usable by anyone with a browser.

### 5. Problem-Solving

The main challenges:

- **OpenCV on a server:** `opencv-python` was too large for Vercel's serverless limit. Switched to `opencv-python-headless` and moved the backend to Render, which has no size restrictions.
- **Base64 image transfer:** Sending full images as Base64 strings over HTTP was slow for large images. Addressed by encoding to PNG (lossless but smaller than BMP) before sending.
- **Thinning loop:** The morphological thinning loop had no exit guard, causing infinite loops on solid-color images. Fixed by checking `cv2.countNonZero(temp) == 0` to break early.
- **Slider feel:** Float params like sigma needed proper rounding to avoid React re-render jitter. Fixed by separating float vs. integer params and rounding only integers.
