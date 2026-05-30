# Project Overview

This is an AI-powered medical coding SaaS MVP.

The system converts clinical conversations into:
- CPT codes (Current Procedural Terminology)
- ICD-10 codes (diagnosis codes)
- Modifiers (billing modifiers)
- Explanation (audit trail for compliance)

# Architecture

- **Backend**: Flask (Python)
- **Database**: SQLite
- **Frontend**: HTML + JavaScript (simple MVP UI)
- **Port**: 81

# Core Flow

1. User logs in (session-based)
2. User pastes clinical encounter text
3. System processes text via coding engine
4. Returns structured billing output (JSON)
5. Saves encounter to database
6. User can view history on dashboard

# Key Files

- `app.py` → Backend Flask server + coding engine logic
- `templates/login.html` → Login page
- `templates/dashboard.html` → Main dashboard + encounter history
- `static/style.css` → Styling
- `database.db` → SQLite database (auto-created)

# Coding Engine Rules

The `coding_engine()` function uses keyword-based pattern matching:

- **Time-based billing**: Detect visit duration (25 min → 99214, 40 min → 99215)
- **Medication management**: "medication" keyword → CPT 99214
- **Discharge follow-ups**: "discharge" keyword → CPT 99495
- **ICD-10 mapping**:
  - "hypertension" → I10
  - "diabetes" → E11.9
  - More patterns can be added

# Output Format (STRICT JSON)

```json
{
  "cpt": ["99214", "99495"],
  "icd10": ["I10", "E11.9"],
  "modifiers": [],
  "explanation": ["Medication management / 25 min visit", "Post discharge follow-up"]
}
```

# Development Rules

✅ **DO**:
- Keep logic simple and explainable
- Always include explanation for each CPT code
- Use rule-based approach first
- Store ALL encounters in database
- Validate JSON output format
- Use parameterized SQL queries (prevent injection)

❌ **DON'T**:
- Hallucinate medical codes
- Return codes without explanation
- Hardcode proprietary code lists
- Expose database directly to frontend

# Database Schema

```sql
CREATE TABLE encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input TEXT,              -- Raw clinical text
  output TEXT              -- JSON-stringified result
)
```

# Future Improvements

- Add Claude API integration for smart coding
- Add confidence scores per code
- Add modifier logic (e.g., -25, -59)
- Add Stripe billing integration
- Add multi-user support (clinic management)
- Add CPT code validation against official registry
- Add audit logging for compliance

# Testing

```bash
pip install -r requirements.txt
python app.py
# Visit http://localhost:81
```

# Security Notes

- `secret_key` should be environment variable in production
- SQL uses parameterized queries (safe from injection)
- Session-based auth (basic, can be enhanced)
- No authentication on /generate endpoint (consider adding)
