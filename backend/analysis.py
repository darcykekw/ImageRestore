import cv2
import numpy as np
import base64
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def compute_stats(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()
    flat = gray.flatten().astype(np.float64)
    mean   = float(np.mean(flat))
    std_dev = float(np.std(flat))

    n = len(flat) // 2
    if n > 1 and np.std(flat[:n]) > 0 and np.std(flat[n:2*n]) > 0:
        corr = float(np.corrcoef(flat[:n], flat[n:2*n])[0, 1])
    else:
        corr = 0.0

    channels = {}
    if len(img.shape) == 3:
        for i, name in enumerate(['Blue', 'Green', 'Red']):
            ch = img[:, :, i].flatten().astype(np.float64)
            channels[name] = {
                'mean': round(float(np.mean(ch)), 3),
                'std':  round(float(np.std(ch)),  3),
            }

    return {
        'mean':        round(mean,    3),
        'std_dev':     round(std_dev, 3),
        'correlation': round(corr,    4),
        'channels':    channels,
    }


def compute_histogram(img):
    histograms = {}
    if len(img.shape) == 3:
        for i, color in enumerate(['blue', 'green', 'red']):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            histograms[color] = hist.flatten().tolist()
    else:
        hist = cv2.calcHist([img], [0], None, [256], [0, 256])
        histograms['gray'] = hist.flatten().tolist()
    return histograms


def generate_histogram_image(img, title=''):
    """Light-theme histogram for inline display."""
    fig, ax = plt.subplots(figsize=(5, 2.2), facecolor='#ffffff')
    ax.set_facecolor('#ffffff')

    if len(img.shape) == 3:
        pairs = [('#3b82f6', 0, 'B'), ('#16a34a', 1, 'G'), ('#ef4444', 2, 'R')]
        for color, ch, label in pairs:
            hist = cv2.calcHist([img], [ch], None, [256], [0, 256]).flatten()
            ax.plot(hist, color=color, alpha=0.65, linewidth=1, label=label)
        ax.legend(
            fontsize=7, facecolor='#ffffff', edgecolor='#e5e7eb',
            labelcolor='#6b7280', framealpha=1, loc='upper right',
        )
    else:
        hist = cv2.calcHist([img], [0], None, [256], [0, 256]).flatten()
        ax.fill_between(range(256), hist, alpha=0.12, color='#3b82f6')
        ax.plot(hist, color='#3b82f6', linewidth=1)

    if title:
        ax.set_title(title, color='#6b7280', fontsize=8, fontweight='normal', pad=3)

    ax.set_xlim([0, 255])
    ax.tick_params(colors='#9ca3af', labelsize=7)
    for spine in ['top', 'right']:
        ax.spines[spine].set_visible(False)
    for spine in ['bottom', 'left']:
        ax.spines[spine].set_color('#e5e7eb')
    ax.set_xlabel('Intensity', color='#9ca3af', fontsize=7)
    ax.set_ylabel('Count',     color='#9ca3af', fontsize=7)
    ax.grid(False)
    plt.tight_layout(pad=0.4)

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=96, bbox_inches='tight',
                facecolor='#ffffff', edgecolor='none')
    plt.close(fig)
    buf.seek(0)
    return 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('utf-8')
