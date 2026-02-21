"""
CyberSentinel AI – ML Inference Models
========================================
Handles loading trained models and performing predictions.
"""

import os
import joblib
import numpy as np
from typing import Optional

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


class PhishingDetector:
    """TF-IDF + Random Forest phishing detection model."""

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load_models()

    def _load_models(self):
        model_path = os.path.join(MODELS_DIR, "phishing_model.pkl")
        vectorizer_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")

        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            self.model = joblib.load(model_path)
            self.vectorizer = joblib.load(vectorizer_path)
            print("[+] Phishing detection model loaded successfully")
        else:
            print("[!] Warning: Phishing model files not found. Run train.py first.")

    def predict(self, text: str) -> dict:
        """Predict if a message is phishing or legitimate."""
        if self.model is None or self.vectorizer is None:
            return {"error": "Model not loaded. Run train.py first."}

        # Vectorize input
        X = self.vectorizer.transform([text])

        # Get prediction and probability
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]

        # Calculate risk score (0-100)
        phishing_prob = probabilities[1]
        risk_score = int(round(phishing_prob * 100))

        label = "Phishing" if prediction == 1 else "Legitimate"
        confidence = float(max(probabilities))

        return {
            "risk_score": risk_score,
            "label": label,
            "confidence": round(confidence, 4),
            "probabilities": {
                "legitimate": round(float(probabilities[0]), 4),
                "phishing": round(float(probabilities[1]), 4),
            },
        }


class AnomalyDetector:
    """Isolation Forest anomaly detection for login patterns."""

    def __init__(self):
        self.model = None
        self.features = None
        self._load_models()

    def _load_models(self):
        model_path = os.path.join(MODELS_DIR, "anomaly_model.pkl")
        features_path = os.path.join(MODELS_DIR, "anomaly_features.pkl")

        if os.path.exists(model_path) and os.path.exists(features_path):
            self.model = joblib.load(model_path)
            self.features = joblib.load(features_path)
            print("[+] Anomaly detection model loaded successfully")
        else:
            print("[!] Warning: Anomaly model files not found. Run train.py first.")

    def predict(self, login_data: dict) -> dict:
        """Detect anomalous login patterns."""
        if self.model is None:
            return {"error": "Model not loaded. Run train.py first."}

        # Build feature vector
        feature_values = []
        for feat in self.features:
            feature_values.append(login_data.get(feat, 0))

        X = np.array([feature_values])

        # Get prediction (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(X)[0]
        anomaly_score = self.model.score_samples(X)[0]

        # Normalize anomaly score to 0-100 risk
        # score_samples returns negative values; more negative = more anomalous
        risk_score = int(round(max(0, min(100, (1 - (anomaly_score + 0.5)) * 100))))

        return {
            "is_anomaly": prediction == -1,
            "risk_score": risk_score,
            "anomaly_score": round(float(anomaly_score), 4),
            "label": "Anomalous" if prediction == -1 else "Normal",
            "features_analyzed": self.features,
        }
