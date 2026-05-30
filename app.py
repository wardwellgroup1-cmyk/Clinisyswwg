from flask import Flask, render_template, request, jsonify, session, redirect
import sqlite3
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

# Database configuration
DB_PATH = "database.db"

# ============= DATABASE INITIALIZATION =============
def init_db():
    """Create encounters table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encounters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# ============= MEDICAL CODING ENGINE =============
def coding_engine(text):
    """
    Convert clinical text into medical billing codes.

    Returns structured JSON with:
    - cpt: list of CPT codes
    - icd10: list of ICD-10 diagnosis codes
    - modifiers: list of billing modifiers
    - explanation: explanation for each code
    """
    text_lower = text.lower()

    result = {
        "cpt": [],
        "icd10": [],
        "modifiers": [],
        "explanation": []
    }

    # ---- CPT Code Detection ----

    # Discharge/post-op follow-up
    if "discharge" in text_lower or "post-discharge" in text_lower:
        result["cpt"].append("99495")
        result["explanation"].append("CPT 99495: Post-discharge follow-up visit")

    # Time-based office visits
    if "40 minute" in text_lower or "40 min" in text_lower:
        result["cpt"].append("99215")
        result["explanation"].append("CPT 99215: Office visit (40+ minutes)")
    elif "25 minute" in text_lower or "25 min" in text_lower:
        result["cpt"].append("99214")
        result["explanation"].append("CPT 99214: Office visit (25-39 minutes)")

    # Medication management (if no other visit code found)
    if ("medication" in text_lower or "rx" in text_lower) and not result["cpt"]:
        result["cpt"].append("99214")
        result["explanation"].append("CPT 99214: Medication management visit")

    # ---- ICD-10 Diagnosis Code Detection ----

    if "hypertension" in text_lower or "high blood pressure" in text_lower:
        if "I10" not in result["icd10"]:
            result["icd10"].append("I10")
            result["explanation"].append("ICD-10 I10: Essential hypertension")

    if "diabetes" in text_lower:
        if "E11" not in result["icd10"]:
            result["icd10"].append("E11.9")
            result["explanation"].append("ICD-10 E11.9: Type 2 diabetes without complications")

    if "depression" in text_lower or "depressed" in text_lower:
        if "F32" not in result["icd10"]:
            result["icd10"].append("F32.9")
            result["explanation"].append("ICD-10 F32.9: Major depressive disorder")

    if "hypertension" in text_lower and "diabetes" in text_lower:
        result["modifiers"].append("99213-25")
        result["explanation"].append("Modifier -25: Significant, separately identifiable E/M service")

    return result

# ============= FLASK ROUTES =============

@app.route("/", methods=["GET", "POST"])
def login():
    """Login page and session management."""
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        if email:
            session["user"] = email
            return redirect("/dashboard")
    return render_template("login.html")

@app.route("/logout")
def logout():
    """Clear session and return to login."""
    session.pop("user", None)
    return redirect("/")

@app.route("/dashboard")
def dashboard():
    """Main dashboard showing encounter history."""
    if "user" not in session:
        return redirect("/")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, input, output, created_at FROM encounters ORDER BY id DESC LIMIT 50"
    )
    data = cursor.fetchall()
    conn.close()

    return render_template("dashboard.html", user=session["user"], data=data)

@app.route("/generate", methods=["POST"])
def generate():
    """
    API endpoint for medical code generation.

    Request JSON:
    {
      "text": "clinical encounter text..."
    }

    Response JSON:
    {
      "cpt": [...],
      "icd10": [...],
      "modifiers": [...],
      "explanation": [...]
    }
    """
    try:
        request_data = request.get_json()
        if not request_data or "text" not in request_data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = request_data["text"].strip()
        if not text:
            return jsonify({"error": "Text cannot be empty"}), 400

        # Generate codes
        result = coding_engine(text)

        # Store in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO encounters (input, output) VALUES (?, ?)",
            (text, str(result))
        )
        conn.commit()
        conn.close()

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/encounters", methods=["GET"])
def api_encounters():
    """API endpoint to fetch recent encounters."""
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, input, output, created_at FROM encounters ORDER BY id DESC LIMIT 20"
    )
    data = cursor.fetchall()
    conn.close()

    return jsonify({
        "encounters": [
            {
                "id": row[0],
                "input": row[1],
                "output": row[2],
                "created_at": row[3]
            }
            for row in data
        ]
    })

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# ============= RUN SERVER =============

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=81,
        debug=os.environ.get("FLASK_DEBUG", False)
    )
