DIGITAL IMAGE PROCESSING - FINAL PROJECT REPORT 2024

Name: Darcy                                    Course/Block: _______________
Email Add: 202380018@psu.palawan.edu.ph        Semester/Sy: 2nd Semester 2024

Project Title: Art of Image Processing


Part I:

A. Software/Application:

ImageRestore - a browser-based image processing tool accessible at:
https://imagerestoreproject.vercel.app/


B. Project Description:

ImageRestore is a digital image processing tool that allows users to upload any image
and apply a range of enhancement, analysis, and restoration techniques. The project
integrates Exercises 1, 4, 5, 6, 7, 8, 9, 11, 12, and 13, covering image negative,
contrast enhancement, bit plane slicing, FFT visualization, statistical analysis,
smoothing filters, sharpening, edge detection, image restoration, and intensity slicing.
The goal is to demonstrate how these techniques affect image quality and structure, and
to provide a visual comparison between the original and processed output for each method.


C. Procedure/Algorithm:

1. Image Acquisition
   - An image is loaded into the application for processing
   - The image is decoded and prepared as a pixel array for algorithm input

2. Preprocessing
   - The appropriate processing technique is selected based on the desired exercise
   - Configurable parameters such as kernel size, threshold, or strength are set
   - For color images, channel separation is applied where needed (e.g., YCrCb for
     histogram equalization, per-channel processing for contrast stretching)

3. Image Processing

   Exercise 1 - Image Negative:
   - Pixel inversion applied to all channels: result = 255 - img

   Exercise 4 - Contrast Enhancement:
   - Histogram Equalization: convert to YCrCb, equalize Y channel, convert back to BGR
   - Contrast Stretching: compute low/high percentiles per channel, scale linearly to 0-255

   Exercise 5 - Bit Plane Slicing:
   - Convert to grayscale, extract bit n: plane = ((gray >> n) & 1) * 255
   - Bit 7 (MSB) contains the most structure; Bit 0 (LSB) is mostly noise

   Exercise 6 - FFT Visualization:
   - 2D FFT: grayscale -> fft2 -> fftshift -> log magnitude -> VIRIDIS colormap
   - 1D FFT: extract middle row -> fft -> fftshift -> normalize -> returned as chart data

   Exercise 7 - Image Statistics:
   - Mean and Std Dev computed using numpy on the grayscale pixel array
   - Correlation Coefficient computed using numpy corrcoef on two halves of pixel array
   - Per-channel (R, G, B) mean and std also computed separately

   Exercise 8 - Smoothing Filters:
   - Mean Filter: cv2.blur with user-defined kernel size
   - Median Filter: cv2.medianBlur - effective against salt-and-pepper noise
   - Gaussian Filter: cv2.GaussianBlur with adjustable kernel size and sigma

   Exercise 9 - Sharpening and Edge Detection:
   - Laplacian Sharpening: compute Laplacian, subtract from original scaled by strength
   - Unsharp Mask: result = original * (1 + strength) - blurred * strength
   - Sobel: compute X and Y gradients, combine as magnitude = sqrt(Sx^2 + Sy^2)
   - Prewitt: same as Sobel but using Prewitt directional kernels

   Exercise 11 - Image Restoration:
   - Add/Remove Gaussian Noise: numpy random normal noise added or removed via Gaussian blur
   - Add/Remove Salt & Pepper Noise: random pixels set to 0 or 255; removed via median filter
   - Wiener Deblur: motion blur kernel applied in frequency domain using FFT conjugate filter
   - Binarization: supports Otsu, Adaptive, and manual threshold methods
   - Thinning: iterative morphological skeletonization using erosion and dilation loop

   Exercise 12 - Intensity Slicing:
   - Convert to grayscale, mask pixels in range [low, high]
   - Matching pixels replaced with user-selected highlight color

   Exercise 13 - Canny Edge Detection:
   - Grayscale conversion followed by cv2.Canny with adjustable threshold1 and threshold2
   - Uses double thresholding and hysteresis edge tracking

4. Output and Analysis
   - The processed image is displayed alongside the original for direct visual comparison
   - Statistical measures (mean, standard deviation, correlation coefficient) are computed
     for both the original and processed images to quantify the effect of each technique
   - Histogram comparison shows how pixel intensity distribution changes after processing


D. Code Implementation:

The image processing functions are implemented in Python using OpenCV, NumPy, SciPy,
and Matplotlib. OpenCV is used for spatial filtering, edge detection, morphological
operations, histogram computation, and color space conversions. NumPy handles matrix
operations, FFT computation, and noise generation. Matplotlib is used to generate
histogram plots. The user interface is built as a web application to make the tool
accessible without any local installation.

Source code: https://github.com/darcykekw/ImageRestore


E. Output Images:

[IMAGE 1 - App Overview]
Screenshot of the full application with an image loaded.

[IMAGE 2 - Exercise 1: Image Negative]
Result of applying Image Negative on a color photo.

[IMAGE 3 - Exercise 4: Histogram Equalization]
Before/after comparison on a low-contrast image. Include the Histogram tab showing
the distribution shift.

[IMAGE 4 - Exercise 4: Contrast Stretching]
Before/after result with low percentile = 2, high = 98.

[IMAGE 5 - Exercise 5: Bit Plane Slicing]
Two screenshots: Bit 7 (MSB, most detail) and Bit 0 (LSB, mostly noise).

[IMAGE 6 - Exercise 6: FFT 2D]
Frequency spectrum output with VIRIDIS colormap.

[IMAGE 7 - Exercise 6: FFT 1D]
FFT tab in the bottom panel showing the frequency line chart.

[IMAGE 8 - Exercise 7: Image Statistics]
Analysis tab showing Mean, Std Dev, Correlation, and per-channel stats.

[IMAGE 9 - Exercise 8: Smoothing Filters]
Results of Mean, Median, and Gaussian filters (three screenshots or collage).

[IMAGE 10 - Exercise 9: Sharpening]
Results of Laplacian Sharpen and Unsharp Mask.

[IMAGE 11 - Exercise 9 & 13: Edge Detection]
Results of Sobel, Prewitt, and Canny edge detection.

[IMAGE 12 - Exercise 11: Noise and Restoration]
Add Gaussian Noise result, then Remove Gaussian Noise result.

[IMAGE 13 - Exercise 11: Binarization and Thinning]
Binarize (Otsu) result and Image Thinning result.

[IMAGE 14 - Exercise 12: Intensity Slicing]
Highlighted intensity range on a grayscale image.


Part II:

1. Significance:

Digital image processing techniques are essential in many fields such as medical
imaging, surveillance, remote sensing, and multimedia. This project is significant
because it integrates multiple DIP exercises into a single working tool, demonstrating
how fundamental techniques like contrast enhancement, noise reduction, edge detection,
and frequency analysis can be applied to real images. Understanding these techniques is
important because they form the foundation of most modern image-based systems used in
practice today.

2. Technology Relation:

The exercises implemented in this project are directly related to existing imaging
technologies. Histogram equalization and contrast stretching (Exercise 4) are standard
preprocessing steps in medical imaging systems such as X-ray and MRI viewers. Mean,
median, and Gaussian filters (Exercise 8) are used in camera noise reduction pipelines.
Edge detection using Sobel, Prewitt, and Canny operators (Exercises 9 and 13) is a core
component of computer vision systems for object and boundary detection. FFT visualization
(Exercise 6) is the basis of frequency-domain filtering used in image compression. Image
restoration techniques (Exercise 11) such as Wiener deblurring and binarization are used
in document scanning, forensic imaging, and fingerprint recognition systems.

3. Learning Enhancement:

This project enhanced understanding of DIP concepts by requiring each algorithm to be
implemented and tested on actual images rather than just studied theoretically. Applying
histogram equalization on a real low-contrast image made it clear how pixel distribution
shifts. Comparing smoothing filters side by side showed the practical difference between
mean, median, and Gaussian blurring. Implementing the Wiener filter in the frequency
domain deepened understanding of how convolution and deconvolution work mathematically.
Overall, the project turned abstract equations from the exercises into observable and
measurable results on real image data.

4. Innovation and Application:

This project applies the DIP exercises in a visually intuitive way by allowing users to
interact with the algorithms through parameter sliders and see the effect immediately on
their own uploaded images. Rather than running isolated scripts per exercise, all
techniques are unified under one interface where results from different exercises can be
compared. The before-and-after split view makes it easy to evaluate the impact of each
algorithm, which is a practical improvement over static output images. This approach
demonstrates how fundamental image processing concepts can be packaged into a useful and
accessible application.

5. Problem-Solving:

Working through the exercises presented several algorithmic challenges. For contrast
stretching, choosing the right percentile range required testing on images with different
distributions to avoid over-stretching. For the Canny edge detector, tuning the two
thresholds was non-trivial since too low a threshold introduced noise and too high a
threshold missed real edges. Implementing the Wiener filter required understanding how
to construct the motion blur kernel and apply it correctly in the frequency domain using
the conjugate of the filter transfer function. For image thinning, the iterative
morphological loop needed a proper termination condition to avoid running indefinitely on
images with no foreground pixels. Each of these problems was resolved through careful
reading of the algorithm theory and testing on different types of input images.
