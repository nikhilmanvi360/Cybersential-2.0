"""
CyberSentinel AI – ML Model Training Pipeline
================================================
Trains two models:
1. Phishing Detection: TF-IDF + Random Forest Classifier
2. Login Anomaly Detection: Isolation Forest

Outputs:
- models/phishing_model.pkl
- models/tfidf_vectorizer.pkl
- models/anomaly_model.pkl
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def generate_phishing_dataset():
    """Generate synthetic phishing/legitimate message dataset for training."""
    phishing_messages = [
        "URGENT: Your account has been compromised. Click here to verify your identity immediately.",
        "Congratulations! You've won $1,000,000. Claim your prize now by clicking this link.",
        "Your bank account will be suspended unless you update your information within 24 hours.",
        "Dear customer, we detected unusual activity. Please verify your credentials at this link.",
        "You have an unclaimed tax refund of $3,247. Click here to claim it now.",
        "Your PayPal account has been limited. Restore access by confirming your details.",
        "ALERT: Someone tried to access your account from Russia. Secure it now.",
        "Free iPhone 15! You've been selected. Click to claim your reward.",
        "Your Netflix subscription has expired. Update payment to avoid losing access.",
        "We noticed suspicious login from unknown device. Verify your identity now.",
        "IMPORTANT: Your social security number has been compromised. Call immediately.",
        "Exclusive offer: Get 90% discount on luxury watches. Limited time only!",
        "Your Apple ID was used to sign in on a new device. If this wasn't you, click here.",
        "WARNING: Your computer is infected with 5 viruses. Download antivirus now.",
        "Dear user, your email storage is full. Upgrade now or lose your emails.",
        "You've received a secure document from IRS. Click to view your tax return.",
        "FINAL WARNING: Your domain will expire in 24 hours. Renew immediately.",
        "Lucky winner! You are selected for a $500 Walmart gift card. Claim now.",
        "Unauthorized transaction detected on your Visa card. Verify now to cancel.",
        "Your Microsoft account password expires today. Click here to reset.",
        "Dear taxpayer, you have a pending refund. Submit your bank details to receive it.",
        "SECURITY ALERT: Multiple failed login attempts detected. Secure your account.",
        "You've been selected for a government grant of $25,000. Apply now.",
        "Your Amazon order #8372 cannot be delivered. Update shipping address now.",
        "CRITICAL: Your router has been hacked. Download security patch immediately.",
        "Verify your email to continue using your account. Click the link below.",
        "You have 1 new voice message from IRS. Click to listen.",
        "Your Google Drive storage is 95% full. Upgrade to premium storage now.",
        "Package delivery failed. Click here to reschedule your UPS delivery.",
        "Alert: Your credit score dropped 150 points. Check your report now.",
        "Exclusive invitation to earn $5000/week working from home. Sign up today.",
        "Your antivirus license expired. Renew now for continued protection.",
        "We've detected malware on your device. Run an immediate scan.",
        "Your loan application has been pre-approved for $50,000. Claim now.",
        "URGENT: Wire transfer of $10,000 pending your approval. Confirm now.",
        "Your Dropbox account was accessed from Nigeria. Secure it immediately.",
        "Congratulations on your retirement benefit increase. Verify details now.",
        "Your Wi-Fi network is at risk. Update firmware immediately.",
        "You have a pending court notice. Download the document here.",
        "Flash sale: Premium software bundle worth $2000 for only $29. Buy now.",
    ]

    legitimate_messages = [
        "Hi team, please review the quarterly report attached and share feedback by Friday.",
        "Meeting reminder: Project standup at 10 AM tomorrow in conference room B.",
        "Your order #4521 has been shipped and will arrive by Thursday.",
        "Please find the updated project timeline in the shared drive.",
        "Thank you for your payment. Your invoice #789 has been processed.",
        "The deployment to staging environment has been completed successfully.",
        "Reminder: Team building event next Friday at 3 PM in the main hall.",
        "Your pull request #234 has been approved and merged to main branch.",
        "Monthly newsletter: Check out our latest blog posts and product updates.",
        "Your subscription renewal has been processed. Next billing date: March 15.",
        "Hi, can we schedule a call to discuss the API integration requirements?",
        "Build #1847 passed all tests. Ready for production deployment.",
        "Updated the documentation for the new authentication endpoints.",
        "Please complete your annual security training by end of this month.",
        "The database migration has been completed. All services are operational.",
        "Weekly status report: Sprint velocity improved by 15% this iteration.",
        "Your leave request for Dec 25-27 has been approved by your manager.",
        "Reminder: Code freeze starts tomorrow at 5 PM for the release.",
        "The new feature flag for dark mode has been enabled in production.",
        "Team lunch today at 12:30 PM. Please RSVP by 11 AM.",
        "Your performance review meeting is scheduled for next Tuesday at 2 PM.",
        "Infrastructure maintenance window: Saturday 2-4 AM UTC.",
        "New hire orientation schedule has been updated. Please review.",
        "The load testing results show 99.9% uptime under peak conditions.",
        "Please update your profile information in the HR portal.",
        "Quarterly revenue report is ready for board review.",
        "The CI/CD pipeline has been optimized, reducing build time by 40%.",
        "Your expense report for November has been approved and reimbursed.",
        "System monitoring shows all services healthy. No incidents reported.",
        "The new version of our API documentation is live. Check it out.",
        "Reminder: Submit your timesheet for this pay period by end of day.",
        "The accessibility audit found 3 minor issues. Fix list attached.",
        "Database backup completed successfully. All data verified.",
        "Your conference registration for TechSummit 2024 has been confirmed.",
        "Sprint retrospective notes have been posted to the team wiki.",
        "New security patches have been applied to all production servers.",
        "Your GitHub access has been provisioned for the new repository.",
        "The design review for the dashboard redesign is Tuesday at 11 AM.",
        "Server certificates have been renewed. Valid through December 2025.",
        "Weekly digest: 15 PRs merged, 3 issues resolved, 2 new features shipped.",
    ]

    texts = phishing_messages + legitimate_messages
    labels = [1] * len(phishing_messages) + [0] * len(legitimate_messages)

    return texts, labels


def train_phishing_model():
    """Train TF-IDF + Random Forest phishing detection model."""
    print("[*] Training Phishing Detection Model...")
    print("=" * 50)

    texts, labels = generate_phishing_dataset()

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1,
        max_df=0.95,
    )
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("\n[+] Phishing Model Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    # Save models
    joblib.dump(model, os.path.join(MODELS_DIR, "phishing_model.pkl"))
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
    print("[+] Phishing model saved to models/phishing_model.pkl")
    print("[+] TF-IDF vectorizer saved to models/tfidf_vectorizer.pkl")


def train_anomaly_model():
    """Train Isolation Forest anomaly detection for login patterns."""
    print("\n[*] Training Login Anomaly Detection Model...")
    print("=" * 50)

    np.random.seed(42)
    n_samples = 500

    # Generate synthetic normal login data
    normal_data = pd.DataFrame({
        "login_hour": np.random.normal(10, 3, n_samples).clip(0, 23),    # Working hours
        "ip_frequency": np.random.normal(50, 15, n_samples).clip(1, 100), # Regular IP usage
        "device_change": np.random.choice([0, 0, 0, 0, 1], n_samples),   # Rare device changes
        "failed_attempts": np.random.poisson(0.5, n_samples).clip(0, 3), # Few failures
        "session_duration": np.random.normal(30, 10, n_samples).clip(1, 120),
    })

    # Generate anomalous login data
    n_anomalies = 50
    anomaly_data = pd.DataFrame({
        "login_hour": np.random.uniform(0, 5, n_anomalies),             # Odd hours
        "ip_frequency": np.random.uniform(1, 5, n_anomalies),           # New IPs
        "device_change": np.ones(n_anomalies),                          # Always new device
        "failed_attempts": np.random.poisson(5, n_anomalies).clip(3, 20),
        "session_duration": np.random.uniform(1, 5, n_anomalies),       # Very short sessions
    })

    # Combine for training (Isolation Forest is unsupervised, trained mostly on normal)
    train_data = pd.concat([normal_data, anomaly_data], ignore_index=True)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42,
        max_features=1.0,
    )
    model.fit(train_data)

    # Save model + feature names
    joblib.dump(model, os.path.join(MODELS_DIR, "anomaly_model.pkl"))
    joblib.dump(list(train_data.columns), os.path.join(MODELS_DIR, "anomaly_features.pkl"))
    print("[+] Anomaly model saved to models/anomaly_model.pkl")
    print("[+] Feature list saved to models/anomaly_features.pkl")

    # Quick evaluation
    preds = model.predict(train_data)
    n_detected = (preds == -1).sum()
    print(f"[+] Anomalies detected in training data: {n_detected}/{len(train_data)}")


if __name__ == "__main__":
    print("🛡️  CyberSentinel AI – ML Training Pipeline")
    print("=" * 50)
    train_phishing_model()
    train_anomaly_model()
    print("\n✅ All models trained successfully!")
