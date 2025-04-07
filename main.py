import cv2
import dlib
from scipy.spatial import distance
import time
import csv
from datetime import datetime
import numpy as np

def calculate_ear(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

# Initialisation
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

LEFT_EYE = list(range(36, 42))
RIGHT_EYE = list(range(42, 48))

cap = cv2.VideoCapture(0)
EAR_THRESHOLD = 0.25
FPS = 30
CLOSED_FRAMES = FPS * 2  # 2 secondes
counter = 0
eyes_closed = False
start_time = None

# Création du fichier CSV s'il n'existe pas, sinon ajout des données
csv_filename = "fermetures_yeux.csv"
file_exists = False
try:
    with open(csv_filename, mode="r") as file:
        file_exists = True
except FileNotFoundError:
    pass

if not file_exists:
    with open(csv_filename, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Horodatage", "Duree_fermeture(s)"])  # En-tête du CSV

while True:
    ret, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    for face in faces:
        # Draw a rectangle around the detected face
        x, y, w, h = (face.left(), face.top(), face.width(), face.height())
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)  # Blue rectangle for face

        landmarks = predictor(gray, face)

        left_eye = [ (landmarks.part(i).x, landmarks.part(i).y) for i in LEFT_EYE ]
        right_eye = [ (landmarks.part(i).x, landmarks.part(i).y) for i in RIGHT_EYE ]

        # Draw rectangles around the eyes
        left_eye_rect = cv2.boundingRect(np.array(left_eye))
        right_eye_rect = cv2.boundingRect(np.array(right_eye))
        cv2.rectangle(frame, (left_eye_rect[0], left_eye_rect[1]), 
                      (left_eye_rect[0] + left_eye_rect[2], left_eye_rect[1] + left_eye_rect[3]), 
                      (0, 255, 0), 2)  # Green rectangle for left eye
        cv2.rectangle(frame, (right_eye_rect[0], right_eye_rect[1]), 
                      (right_eye_rect[0] + right_eye_rect[2], right_eye_rect[1] + right_eye_rect[3]), 
                      (0, 255, 0), 2)  # Green rectangle for right eye

        ear = (calculate_ear(left_eye) + calculate_ear(right_eye)) / 2.0

        # Coordinates for the top and bottom of the eyes
        left_eye_top = left_eye[1]  # Top left eye point
        left_eye_bottom = left_eye[5]  # Bottom left eye point
        right_eye_top = right_eye[1]  # Top right eye point
        right_eye_bottom = right_eye[5]  # Bottom right eye point

        if ear < EAR_THRESHOLD:
            if not eyes_closed:
                start_time = time.time()
                eyes_closed = True
                print("👁️  Yeux fermés")

            counter += 1
            if counter >= CLOSED_FRAMES:
                pass  # No additional visual indicators needed here

        else:
            if eyes_closed:
                end_time = time.time()
                duration = end_time - start_time
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"⏱️  Durée yeux fermés : {duration:.2f} secondes\n")

                # Ajout des données dans le CSV
                with open(csv_filename, mode="a", newline="") as file:
                    writer = csv.writer(file)
                    writer.writerow([timestamp, f"{duration:.2f}"])

                eyes_closed = False
            counter = 0

    cv2.imshow("Camera", frame)
    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
print(f"Les données ont été enregistrées dans le fichier {csv_filename}.")