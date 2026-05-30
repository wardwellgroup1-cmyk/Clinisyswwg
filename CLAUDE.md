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
- Use Pydantic for request/response validation
- Keep logic simple and explainable
- Always include explanation for each CPT code
- Validate CPT/modifier codes against whitelists
- Store ALL encounters in database (JSON format)
- Use parameterized SQL queries (prevent injection)
- Support both rule-based AND AI-powered coding
- Gracefully fall back to rule-based if AI fails

❌ **DON'T**:
- Hallucinate medical codes
- Return codes without explanation
- Accept codes outside VALID_CPT/VALID_MODIFIERS
- Expose database directly to frontend
- Require OpenAI (make it optional)

# Database Schema

```sql
CREATE TABLE encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  input TEXT,              -- Raw clinical text
  output TEXT              -- JSON-stringified result
)
```

# Advanced Features

## Pydantic Validation

- **GenerateRequest**: Validates incoming requests (`text`, `use_ai`)
- **CodingResult**: Ensures responses have correct schema
- **ErrorResponse**: Standardized error format

Request validation automatically rejects:
- Missing fields
- Invalid JSON
- Empty text
- Invalid schema

## OpenAI Integration (Optional)

Requires: `OPENAI_API_KEY` environment variable

Two coding modes:
1. **Rule-based** (default): Fast, no API calls, predictable
2. **AI-powered** (opt-in): Smarter matching, validates against whitelists

AI mode features:
- Uses `gpt-3.5-turbo` for code generation
- Validates all codes/modifiers against whitelists
- Falls back to rule-based if AI fails
- Marks results with `ai_generated: true/false` flag

## Code Validation

All generated codes validated against:
- **VALID_CPT**: 16 approved CPT codes
- **VALID_MODIFIERS**: 8 approved billing modifiers

Invalid codes are silently filtered from results.

# Future Improvements

- Add Claude API integration for even smarter coding
- Add confidence scores per code
- Add more ICD-10 patterns
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
