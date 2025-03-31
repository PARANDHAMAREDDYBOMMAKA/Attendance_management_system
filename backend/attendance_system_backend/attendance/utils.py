import face_recognition
import numpy as np
from PIL import Image
import io

def verify_face(reference_image_path, captured_image_path, tolerance=0.6):
    """
    Verify if the captured face matches the reference face
    
    Args:
        reference_image_path: Path to the reference image (user's profile)
        captured_image_path: Path to the captured image (from check-in/check-out)
        tolerance: Face distance tolerance (lower = stricter)
        
    Returns:
        bool: True if faces match, False otherwise
    """
    try:
        # Load reference image
        reference_image = face_recognition.load_image_file(reference_image_path)
        reference_encodings = face_recognition.face_encodings(reference_image)
        
        if not reference_encodings:
            return False, "No face found in reference image"
        
        reference_encoding = reference_encodings[0]
        
        # Load captured image
        captured_image = face_recognition.load_image_file(captured_image_path)
        captured_encodings = face_recognition.face_encodings(captured_image)
        
        if not captured_encodings:
            return False, "No face found in captured image"
        
        captured_encoding = captured_encodings[0]
        
        # Compare faces
        face_distance = face_recognition.face_distance([reference_encoding], captured_encoding)[0]
        match = face_distance <= tolerance
        
        return match, f"Face distance: {face_distance:.2f}"
        
    except Exception as e:
        return False, f"Error during face verification: {str(e)}"