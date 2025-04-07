# Wakey

Wakey is a Python-based application designed to monitor eye closure duration using a webcam. It detects when the user's eyes are closed for an extended period and logs the duration of eye closures into a CSV file. This can be useful for applications such as drowsiness detection or monitoring focus levels.

## Features

- Real-time face and eye detection using `dlib` and `OpenCV`.
- Calculates the Eye Aspect Ratio (EAR) to determine if eyes are closed.
- Logs the timestamp and duration of eye closures into a CSV file.
- Visual indicators for detected faces and eyes in the webcam feed.

## Requirements

- Python 3.x
- Required Python libraries:
  - `opencv-python`
  - `dlib`
  - `scipy`
  - `numpy`

## Installation

1. Clone the repository or download the project files.
2. Install the required Python libraries using pip:
   ```bash
   pip install opencv-python dlib scipy numpy
   ```
3. Download the `shape_predictor_68_face_landmarks.dat` file from [dlib's model repository](http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2) and place it in the project directory.

## Usage

1. Run the script:
   ```bash
   python main.py
   ```
2. The application will open a webcam feed and start detecting faces and eyes.
3. If the eyes are closed for more than 2 seconds, the duration will be logged into a CSV file named `fermetures_yeux.csv`.

## Output

- The application creates or appends to a CSV file named `fermetures_yeux.csv` in the project directory.
- The CSV file contains the following columns:
  - `Horodatage`: The timestamp of the eye closure event.
  - `Duree_fermeture(s)`: The duration of the eye closure in seconds.

## Notes

- Ensure your webcam is properly connected and accessible.
- The EAR threshold and duration for detecting eye closures can be adjusted in the script (`EAR_THRESHOLD` and `CLOSED_FRAMES` variables).


## Acknowledgments

- [dlib](http://dlib.net/) for face and landmark detection.
- [OpenCV](https://opencv.org/) for image processing.
