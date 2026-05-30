# AI Medical Coding SaaS MVP

An intelligent system that converts clinical encounter documentation into standardized medical billing codes (CPT and ICD-10).

## Features

✅ **Medical Code Extraction**
- Automatic CPT code generation
- ICD-10 diagnosis code mapping
- Billing modifier support
- Explanation for audit trail

✅ **Encounter Management**
- Secure user login
- Store encounter history
- View past codings

✅ **Simple MVP UI**
- Clean, minimal dashboard
- Copy/paste clinical text
- One-click code generation

## Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

### Access
```
http://localhost:81
```

## Project Structure

```
/
├── app.py                 # Flask backend + coding engine
├── CLAUDE.md             # Project documentation for Claude AI
├── README.md             # This file
├── requirements.txt      # Python dependencies
├── database.db           # SQLite database (auto-created)
│
├── /templates/
│   ├── login.html        # Login page
│   └── dashboard.html    # Main app + encounter history
│
└── /static/
    └── style.css         # Styling
```

## How It Works

1. **User logs in** with email
2. **Enters clinical text** (e.g., "25 minute office visit with medication management")
3. **System analyzes** using keyword-based coding engine
4. **Returns structured output**:
   - CPT codes
   - ICD-10 codes
   - Modifiers
   - Explanation for each code
5. **Stores encounter** in database

## Example Input/Output

**Input:**
```
Patient came in for 25 minute medication management visit. 
Has hypertension and diabetes.
Post-discharge follow-up from recent hospitalization.
```

**Output:**
```json
{
  "cpt": ["99495", "99214"],
  "icd10": ["I10", "E11.9"],
  "modifiers": [],
  "explanation": [
    "Post discharge follow-up",
    "Medication management / 25 min visit"
  ]
}
```

## Configuration

Edit the following in `app.py` for production:

- `app.secret_key` → Use environment variable
- `database.db` path → Configure storage location
- `port` → Change from 81 if needed

## Development

For Claude Code integration: See `CLAUDE.md` for architecture and development guidelines.

## Future Roadmap

- [ ] Claude API integration for smart coding
- [ ] Confidence scores per code
- [ ] Advanced modifier logic
- [ ] Stripe billing integration
- [ ] Multi-user clinic management
- [ ] Official CPT registry validation
- [ ] Compliance audit logging

## License

MIT
