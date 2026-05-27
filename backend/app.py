from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import os
import filters as f
import analysis as a

app = Flask(__name__)
CORS(app, origins='*')


def _stats_and_hist(orig, proc):
    return {
        'stats_original':      a.compute_stats(orig),
        'stats_processed':     a.compute_stats(proc),
        'histogram_original':  a.generate_histogram_image(orig, 'Before'),
        'histogram_processed': a.generate_histogram_image(proc, 'After'),
        'hist_data_original':  a.compute_histogram(orig),
        'hist_data_processed': a.compute_histogram(proc),
    }


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})


# ─── Exercise 4: Contrast Enhancement ────────────────────────────────────────
@app.route('/api/contrast', methods=['POST'])
def contrast():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        method = data.get('method', 'histogram_equalization')
        params = data.get('params', {})

        if method == 'histogram_equalization':
            result = f.histogram_equalization(img)
        elif method == 'contrast_stretching':
            result = f.contrast_stretching(
                img,
                float(params.get('low_percentile', 2)),
                float(params.get('high_percentile', 98)),
            )
        else:
            result = img

        return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercises 8 & 9: Filters ────────────────────────────────────────────────
@app.route('/api/filter', methods=['POST'])
def apply_filter():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        method = data.get('method', 'mean')
        p = data.get('params', {})

        dispatch = {
            'mean':          lambda: f.mean_filter(img, int(p.get('kernel_size', 5))),
            'median':        lambda: f.median_filter(img, int(p.get('kernel_size', 5))),
            'gaussian':      lambda: f.gaussian_filter(img, int(p.get('kernel_size', 5)), float(p.get('sigma', 1.0))),
            'laplacian':     lambda: f.laplacian_sharpen(img, float(p.get('strength', 1.0))),
            'unsharp':       lambda: f.unsharp_mask(img, int(p.get('kernel_size', 5)), float(p.get('sigma', 1.0)), float(p.get('strength', 1.5))),
            'sobel':         lambda: f.sobel_edge(img, int(p.get('ksize', 3))),
            'prewitt':       lambda: f.prewitt_edge(img),
            'canny':         lambda: f.canny_edge(img, float(p.get('threshold1', 100)), float(p.get('threshold2', 200))),
            'pencil_sketch': lambda: f.pencil_sketch(img),
            'painting':      lambda: f.painting_effect(img),
            'vintage':       lambda: f.vintage_effect(img),
            'negative':      lambda: f.image_negative(img),
        }

        result = dispatch[method]() if method in dispatch else img
        return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercise 11: Restoration ─────────────────────────────────────────────────
@app.route('/api/restore', methods=['POST'])
def restore():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        method = data.get('method', 'remove_gaussian_noise')
        p = data.get('params', {})

        dispatch = {
            'add_gaussian_noise':    lambda: f.add_gaussian_noise(img, float(p.get('mean', 0)), float(p.get('std', 25))),
            'remove_gaussian_noise': lambda: f.remove_gaussian_noise(img, int(p.get('kernel_size', 5))),
            'add_salt_pepper':       lambda: f.add_salt_pepper_noise(img, float(p.get('density', 0.05))),
            'remove_salt_pepper':    lambda: f.remove_salt_pepper_noise(img, int(p.get('kernel_size', 5))),
            'deblur':                lambda: f.deblur_wiener(img, int(p.get('kernel_size', 5)), float(p.get('noise_var', 0.01))),
            'binarize':              lambda: f.binarize(img, float(p.get('threshold', 127)), p.get('method', 'otsu')),
            'thinning':              lambda: f.image_thinning(img),
        }

        result = dispatch[method]() if method in dispatch else img
        return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercise 7: Image Analysis ──────────────────────────────────────────────
@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        return jsonify({
            'stats': a.compute_stats(img),
            'histogram_image': a.generate_histogram_image(img),
            'histogram_data': a.compute_histogram(img),
        })
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercise 6: FFT ──────────────────────────────────────────────────────────
@app.route('/api/fft', methods=['POST'])
def fft():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        fft_type = data.get('type', '2d')
        if fft_type == '2d':
            result = f.fft_2d(img)
            return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
        else:
            fft_data = f.fft_1d(img)
            return jsonify({'fft_data': fft_data})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercise 12: Intensity Slicing ──────────────────────────────────────────
@app.route('/api/intensity-slice', methods=['POST'])
def intensity_slice():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        low = data.get('low', 100)
        high = data.get('high', 200)
        color = data.get('color', [0, 255, 0])
        result = f.intensity_slice(img, low, high, color)
        return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


# ─── Exercise 5: Bit Plane ────────────────────────────────────────────────────
@app.route('/api/bitplane', methods=['POST'])
def bitplane():
    try:
        data = request.json
        img = f.decode_image(data['image'])
        bit = int(data.get('bit', 7))
        result = f.extract_bit_plane(img, bit)
        return jsonify({'processed': f.encode_image(result), **_stats_and_hist(img, result)})
    except Exception:
        return jsonify({'error': traceback.format_exc()}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
