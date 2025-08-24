# api.py
from flask import Flask, request, jsonify
import pickle
import random
from flask_cors import CORS   # ✅ Allow requests from browser/PHP

# ---------------------------
# Load trained model + vectorizer
# ---------------------------
with open("disease_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# ---------------------------
# Flask App Setup
# ---------------------------
app = Flask(__name__)
CORS(app)  # ✅ Enable Cross-Origin Requests

# ---------------------------
# Root Route (Homepage)
# ---------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "ok": True,
        "message": "✅ Flask API is running. Use /predict?symptoms=fever,cough"
    })

# ---------------------------
# Prediction Route
# ---------------------------
@app.route("/predict", methods=["GET"])
def predict():
    symptoms = request.args.get("symptoms", "").strip().lower()
    if not symptoms:
        return jsonify({"ok": False, "error": "No symptoms provided"})

    try:
        # Clean & vectorize symptoms
        cleaned = symptoms.replace(",", " ")
        vector = vectorizer.transform([cleaned])
        prediction = model.predict(vector)[0]
        confidence = max(model.predict_proba(vector)[0])

        # If confidence is low, pick random class
        if confidence < 0.25:
            prediction = random.choice(model.classes_)

        return jsonify({
            "ok": True,
            "symptoms": symptoms,
            "prediction": prediction,
            "confidence": round(float(confidence), 2)
        })

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})

# ---------------------------
# Run App
# ---------------------------
if __name__ == "__main__":
    # host="0.0.0.0" → accessible from LAN too
    app.run(host="0.0.0.0", port=5000, debug=True)
