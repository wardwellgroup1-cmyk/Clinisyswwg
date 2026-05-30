from flask import Flask, render_template, request, jsonify, session, redirect, send_from_directory
from werkzeug.exceptions import BadRequest
from pydantic import BaseModel, ValidationError, Field
from typing import List, Optional
import sqlite3
import os
import json

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")

# OpenAI client (optional)
if OPENAI_AVAILABLE and os.environ.get("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
else:
    openai_client = None

# Database configuration
DB_PATH = os.environ.get("DATABASE_URL", "database.db")

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

# ============= PYDANTIC MODELS =============

class GenerateRequest(BaseModel):
    """Request schema for code generation."""
    text: str = Field(min_length=1, description="Clinical encounter text")
    use_ai: bool = Field(default=False, description="Use OpenAI for smart coding")

class CodingResult(BaseModel):
    """Response schema for coding results."""
    cpt: List[str] = Field(default_factory=list, description="CPT procedure codes")
    icd10: List[str] = Field(default_factory=list, description="ICD-10 diagnosis codes")
    modifiers: List[str] = Field(default_factory=list, description="Billing modifiers")
    explanation: List[str] = Field(default_factory=list, description="Explanation for each code")
    ai_generated: bool = Field(default=False, description="Whether this was generated with AI")

class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str = Field(description="Error message")
    details: Optional[dict] = Field(default=None, description="Additional error details")

# ============= VALIDATION CONSTANTS =============

VALID_CPT = {
    "99213", "99214", "99215",
    "99495", "99496",
    "G0442", "G0443", "G0444",
    "96127", "99406", "99407",
    "99401", "99402", "99403",
    "99483", "96125"
}

VALID_MODIFIERS = {"25", "33", "59", "95", "XU", "XE", "XS", "XP"}

# ============= ERROR HELPERS =============

def json_error(message: str, status: int = 400, details=None):
    """Return standardized error response."""
    payload = ErrorResponse(error=message, details=details).model_dump()
    return jsonify(payload), status

def parse_request_json():
    """
    Safely parse and validate incoming request JSON.
    Returns: (parsed_request, error_response) tuple
    """
    if not request.is_json:
        return None, json_error(
            "Request must use Content-Type: application/json",
            415
        )

    try:
        data = request.get_json(silent=False)
    except BadRequest:
        return None, json_error("Invalid JSON body", 400)

    if data is None:
        return None, json_error("Empty JSON body", 400)

    try:
        parsed = GenerateRequest(**data)
    except ValidationError as e:
        return None, json_error("Invalid request schema", 422, e.errors())

    return parsed, None

# ============= MEDICAL CODING ENGINE =============
def rule_based_coding(text):
    """
    Rule-based medical coding engine (no AI required).
    Detects keywords and patterns to generate codes.
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
        result["modifiers"].append("25")
        result["explanation"].append("Modifier -25: Significant, separately identifiable E/M service")

    return result

def validate_codes(result):
    """Validate CPT codes and modifiers against known lists."""
    result["cpt"] = [code for code in result["cpt"] if code in VALID_CPT]
    result["modifiers"] = [mod for mod in result["modifiers"] if mod in VALID_MODIFIERS]
    return result

def ai_powered_coding(text):
    """
    Use OpenAI to intelligently generate codes.
    Falls back to rule-based if AI unavailable.
    """
    if not openai_client:
        return rule_based_coding(text), False

    try:
        prompt = f"""You are a medical coding expert. Analyze this clinical encounter and generate appropriate codes.

Clinical Text:
{text}

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "cpt": ["code1", "code2"],
  "icd10": ["code1", "code2"],
  "modifiers": ["mod1", "mod2"],
  "explanation": ["reason1", "reason2"]
}}

Ensure:
- CPT codes are from: {', '.join(sorted(VALID_CPT))}
- Modifiers are from: {', '.join(sorted(VALID_MODIFIERS))}
- Each code has a corresponding explanation
"""

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )

        response_text = response.choices[0].message.content.strip()
        result = json.loads(response_text)

        result = validate_codes(result)
        return result, True

    except Exception as e:
        app.logger.warning(f"AI coding failed: {str(e)}. Falling back to rule-based.")
        return rule_based_coding(text), False

def coding_engine(text, use_ai=False):
    """
    Main coding engine dispatcher.
    Routes to AI or rule-based depending on availability and request.
    """
    if use_ai and openai_client:
        result, ai_generated = ai_powered_coding(text)
    else:
        result = rule_based_coding(text)
        ai_generated = False

    return CodingResult(
        cpt=result.get("cpt", []),
        icd10=result.get("icd10", []),
        modifiers=result.get("modifiers", []),
        explanation=result.get("explanation", []),
        ai_generated=ai_generated
    )

# ============= FLASK ROUTES =============

@app.route("/")
@app.route("/index")
@app.route("/index.html")
def index_page():
    """Serve the standalone index.html landing page."""
    return send_from_directory(app.root_path, "index.html")

@app.route("/login", methods=["GET", "POST"])
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
    return redirect("/login")

@app.route("/dashboard")
def dashboard():
    """Main dashboard showing encounter history."""
    if "user" not in session:
        return redirect("/login")

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
      "text": "clinical encounter text...",
      "use_ai": false
    }

    Response JSON:
    {
      "cpt": [...],
      "icd10": [...],
      "modifiers": [...],
      "explanation": [...],
      "ai_generated": false
    }
    """
    parsed_req, error_resp = parse_request_json()
    if error_resp:
        return error_resp

    try:
        text = parsed_req.text.strip()

        # Generate codes
        result = coding_engine(text, use_ai=parsed_req.use_ai)

        # Store in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO encounters (input, output) VALUES (?, ?)",
            (text, result.model_dump_json())
        )
        conn.commit()
        conn.close()

        return jsonify(result.model_dump())

    except Exception as e:
        return json_error(f"Code generation failed: {str(e)}", 500)

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

@app.route("/download_history", methods=["GET"])
def download_history():
    """Download recent encounter history as a JSON file."""
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, input, output, created_at FROM encounters ORDER BY id DESC LIMIT 100"
    )
    data = cursor.fetchall()
    conn.close()

    encounters = [
        {
            "id": row[0],
            "input": row[1],
            "output": row[2],
            "created_at": row[3]
        }
        for row in data
    ]

    payload = json.dumps({"encounters": encounters}, indent=2)
    return app.response_class(
        payload,
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=encounters.json"}
    )

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(e):
    return json_error("Not found", 404)

@app.errorhandler(500)
def server_error(e):
    return json_error("Internal server error", 500)

# ============= RUN SERVER =============

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("FLASK_PORT", 81)),
        debug=str(os.environ.get("FLASK_DEBUG", "False")).lower() in {"1", "true", "yes"}
    )
