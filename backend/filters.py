import cv2
import numpy as np
import base64


def decode_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_bytes = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return img


def encode_image(img):
    _, buffer = cv2.imencode('.png', img)
    return 'data:image/png;base64,' + base64.b64encode(buffer).decode('utf-8')


# ex. 4 - contrast enhancement

def histogram_equalization(img):
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)


def contrast_stretching(img, low_percentile=2, high_percentile=98):
    result = np.zeros_like(img, dtype=np.float32)
    for i in range(img.shape[2] if len(img.shape) == 3 else 1):
        ch = img[:, :, i].astype(np.float32) if len(img.shape) == 3 else img.astype(np.float32)
        p_lo = np.percentile(ch, low_percentile)
        p_hi = np.percentile(ch, high_percentile)
        if p_hi > p_lo:
            stretched = (ch - p_lo) / (p_hi - p_lo) * 255.0
        else:
            stretched = ch
        if len(img.shape) == 3:
            result[:, :, i] = np.clip(stretched, 0, 255)
        else:
            result = np.clip(stretched, 0, 255)
    return result.astype(np.uint8)


# ex. 1 - image negative

def image_negative(img):
    return 255 - img


# ex. 8 - smoothing filters

def mean_filter(img, kernel_size=5):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    return cv2.blur(img, (k, k))


def median_filter(img, kernel_size=5):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    return cv2.medianBlur(img, k)


def gaussian_filter(img, kernel_size=5, sigma=1.0):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    return cv2.GaussianBlur(img, (k, k), sigma)


# ex. 9 - sharpening and edge detection

def laplacian_sharpen(img, strength=1.0):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    lap_norm = np.uint8(np.clip(np.absolute(lap), 0, 255))
    lap_3ch = cv2.cvtColor(lap_norm, cv2.COLOR_GRAY2BGR)
    return np.clip(img.astype(np.float32) - strength * lap_3ch.astype(np.float32), 0, 255).astype(np.uint8)


def unsharp_mask(img, kernel_size=5, sigma=1.0, strength=1.5):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    blurred = cv2.GaussianBlur(img, (k, k), sigma)
    sharpened = cv2.addWeighted(img, 1.0 + strength, blurred, -strength, 0)
    return sharpened


def sobel_edge(img, ksize=3):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=ksize)
    sy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=ksize)
    mag = np.sqrt(sx ** 2 + sy ** 2)
    mag_max = mag.max()
    if mag_max > 0:
        mag = (mag / mag_max * 255).astype(np.uint8)
    else:
        mag = mag.astype(np.uint8)
    return cv2.cvtColor(mag, cv2.COLOR_GRAY2BGR)


def prewitt_edge(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    kx = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    ky = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    px = cv2.filter2D(gray, -1, kx)
    py = cv2.filter2D(gray, -1, ky)
    mag = np.sqrt(px ** 2 + py ** 2)
    mag_max = mag.max()
    if mag_max > 0:
        mag = (mag / mag_max * 255).astype(np.uint8)
    else:
        mag = mag.astype(np.uint8)
    return cv2.cvtColor(mag, cv2.COLOR_GRAY2BGR)


def canny_edge(img, threshold1=100, threshold2=200):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1, threshold2)
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)


# artistic effects (not really an exercise but added for fun)

def pencil_sketch(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = 255 - gray
    blur = cv2.GaussianBlur(inv, (21, 21), 0)
    sketch = cv2.divide(gray, 255 - blur, scale=256.0)
    sketch = np.clip(sketch, 0, 255).astype(np.uint8)
    return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)


def painting_effect(img):
    result = img.copy()
    for _ in range(3):
        result = cv2.bilateralFilter(result, 9, 75, 75)
    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    edges_3ch = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    painting = cv2.bitwise_and(result, edges_3ch)
    return painting


def vintage_effect(img):
    img_f = img.astype(np.float32) / 255.0
    sepia = np.array([[0.272, 0.534, 0.131],
                      [0.349, 0.686, 0.168],
                      [0.393, 0.769, 0.189]], dtype=np.float32)
    result = cv2.transform(img_f, sepia)
    result = np.clip(result, 0, 1)
    rows, cols = img.shape[:2]
    kx = cv2.getGaussianKernel(cols, int(cols * 0.6))
    ky = cv2.getGaussianKernel(rows, int(rows * 0.6))
    mask = ky * kx.T
    mask = (mask / mask.max()).astype(np.float32)
    for ch in range(3):
        result[:, :, ch] *= mask
    return (result * 255).astype(np.uint8)


# ex. 11 - image restoration

def add_gaussian_noise(img, mean=0, std=25):
    noise = np.random.normal(mean, std, img.shape).astype(np.float32)
    noisy = img.astype(np.float32) + noise
    return np.clip(noisy, 0, 255).astype(np.uint8)


def remove_gaussian_noise(img, kernel_size=5):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    return cv2.GaussianBlur(img, (k, k), 0)


def add_salt_pepper_noise(img, density=0.05):
    noisy = img.copy()
    h, w = img.shape[:2]
    n = int(h * w * density)
    coords_salt = (np.random.randint(0, h, n), np.random.randint(0, w, n))
    coords_pepper = (np.random.randint(0, h, n), np.random.randint(0, w, n))
    noisy[coords_salt] = 255
    noisy[coords_pepper] = 0
    return noisy


def remove_salt_pepper_noise(img, kernel_size=5):
    k = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
    return cv2.medianBlur(img, k)


def deblur_wiener(img, kernel_size=5, noise_var=0.01):
    kernel = np.zeros((kernel_size, kernel_size), dtype=np.float32)
    kernel[kernel_size // 2, :] = 1.0 / kernel_size

    result = np.zeros_like(img, dtype=np.float32)
    for ch in range(img.shape[2]):
        channel = img[:, :, ch].astype(np.float32) / 255.0
        img_fft = np.fft.fft2(channel)
        k_fft = np.fft.fft2(kernel, s=channel.shape)
        k_conj = np.conj(k_fft)
        wiener = k_conj / (np.abs(k_fft) ** 2 + noise_var)
        restored = np.fft.ifft2(img_fft * wiener).real
        result[:, :, ch] = np.clip(restored * 255, 0, 255)
    return result.astype(np.uint8)


def binarize(img, threshold=127, method='otsu'):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if method == 'otsu':
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    elif method == 'adaptive':
        binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY, 11, 2)
    else:
        _, binary = cv2.threshold(gray, int(threshold), 255, cv2.THRESH_BINARY)
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


def image_thinning(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    skel = np.zeros_like(binary)
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    temp = binary.copy()
    while True:
        eroded = cv2.erode(temp, element)
        opened = cv2.dilate(eroded, element)
        diff = cv2.subtract(temp, opened)
        skel = cv2.bitwise_or(skel, diff)
        temp = eroded.copy()
        if cv2.countNonZero(temp) == 0:
            break
    return cv2.cvtColor(skel, cv2.COLOR_GRAY2BGR)


# ex. 6 - FFT visualization

def fft_2d(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fshift = np.fft.fftshift(np.fft.fft2(gray))
    magnitude = np.log1p(np.abs(fshift))
    normalized = (magnitude / magnitude.max() * 255).astype(np.uint8)
    colored = cv2.applyColorMap(normalized, cv2.COLORMAP_VIRIDIS)
    return colored


def fft_1d(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    row = gray[gray.shape[0] // 2, :].astype(np.float64)
    spectrum = np.abs(np.fft.fftshift(np.fft.fft(row)))
    if spectrum.max() > 0:
        spectrum = spectrum / spectrum.max()
    return spectrum.tolist()


# ex. 12 - intensity slicing

def intensity_slice(img, low=100, high=200, highlight_color=None):
    if highlight_color is None:
        highlight_color = [0, 255, 0]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    result = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    mask = (gray >= int(low)) & (gray <= int(high))
    result[mask] = [int(highlight_color[0]), int(highlight_color[1]), int(highlight_color[2])]
    return result


# ex. 5 - bit plane slicing

def extract_bit_plane(img, bit=7):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    plane = ((gray >> int(bit)) & 1) * 255
    return cv2.cvtColor(plane.astype(np.uint8), cv2.COLOR_GRAY2BGR)
