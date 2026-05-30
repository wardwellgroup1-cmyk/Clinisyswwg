# Medical Coding SaaS - API Documentation

## Base URL

```
http://localhost:81
```

## Authentication

Currently uses Flask session-based authentication. All API routes require a valid session cookie.

Future: JWT tokens or API keys.

---

## Endpoints

### 1. Login / Home Page

**GET** `/`

Returns the login page.

**POST** `/`

Log in with email.

**Request:**
```form
email=user@example.com
```

**Response:** Redirects to `/dashboard`

---

### 2. Dashboard

**GET** `/dashboard`

Returns the main application dashboard.

**Requires:** Active session (login)

**Response:** HTML page with code generation interface

---

### 3. Generate Medical Codes

**POST** `/generate`

Generate CPT, ICD-10, and modifier codes from clinical text.

**Requires:** 
- Content-Type: `application/json`
- Active session (login)

**Request:**
```json
{
  "text": "25 minute office visit with medication management. Patient has hypertension and diabetes.",
  "use_ai": false
}
```

**Parameters:**
- `text` (string, required): Clinical encounter text (min 1 character)
- `use_ai` (boolean, optional): Use AI-powered coding (default: false)

**Response (Success - 200):**
```json
{
  "cpt": ["99495", "99214"],
  "icd10": ["I10", "E11.9"],
  "modifiers": ["25"],
  "explanation": [
    "CPT 99495: Post-discharge follow-up visit",
    "CPT 99214: Office visit (25-39 minutes)",
    "ICD-10 I10: Essential hypertension",
    "ICD-10 E11.9: Type 2 diabetes without complications",
    "Modifier -25: Significant, separately identifiable E/M service"
  ],
  "ai_generated": false
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid JSON body",
  "details": null
}
```

**Response (Validation Error - 422):**
```json
{
  "error": "Invalid request schema",
  "details": [
    {
      "type": "value_error",
      "loc": ["text"],
      "msg": "ensure this value has at least 1 character",
      "input": ""
    }
  ]
}
```

**Response (Server Error - 500):**
```json
{
  "error": "Code generation failed: [error details]",
  "details": null
}
```

---

### 4. Get Encounter History

**GET** `/api/encounters`

Fetch recent encounters for the logged-in user.

**Requires:** Active session

**Response:**
```json
{
  "encounters": [
    {
      "id": 1,
      "input": "25 minute office visit...",
      "output": "{\"cpt\": [\"99214\"], ...}",
      "created_at": "2024-05-30 10:30:00"
    },
    {
      "id": 2,
      "input": "Medication management...",
      "output": "{\"cpt\": [\"99214\"], ...}",
      "created_at": "2024-05-30 10:25:00"
    }
  ]
}
```

---

### 5. Logout

**GET** `/logout`

Clear session and return to login page.

**Response:** Redirects to `/`

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid JSON or missing fields |
| 401 | Unauthorized | Not logged in |
| 404 | Not Found | Endpoint doesn't exist |
| 415 | Unsupported Media Type | Content-Type is not application/json |
| 422 | Unprocessable Entity | Validation error (Pydantic) |
| 500 | Internal Server Error | Server error |

---

## Valid Codes

### Valid CPT Codes

These are the only CPT codes that will be returned:

```
99213, 99214, 99215,
99495, 99496,
G0442, G0443, G0444,
96127, 99406, 99407,
99401, 99402, 99403,
99483, 96125
```

### Valid Modifiers

These are the only billing modifiers that will be returned:

```
25, 33, 59, 95, XU, XE, XS, XP
```

---

## Code Generation Modes

### Rule-Based (Default)

- **Speed**: Instant
- **Cost**: Free
- **Accuracy**: Pattern matching
- **When to use**: Most cases, offline usage

Detects keywords like:
- "25 minute" → CPT 99214
- "discharge" → CPT 99495
- "hypertension" → ICD-10 I10
- "diabetes" → ICD-10 E11.9

### AI-Powered (Optional)

- **Speed**: 2-5 seconds
- **Cost**: ~$0.001-0.01 per request (OpenAI)
- **Accuracy**: LLM-based semantic analysis
- **When to use**: Complex cases, validation

Requires `OPENAI_API_KEY` environment variable.

---

## Usage Examples

### cURL

```bash
# Generate codes (rule-based)
curl -X POST http://localhost:81/generate \
  -H "Content-Type: application/json" \
  -b "session=your-session-cookie" \
  -d '{"text": "25 minute office visit", "use_ai": false}'

# Generate codes (AI-powered)
curl -X POST http://localhost:81/generate \
  -H "Content-Type: application/json" \
  -b "session=your-session-cookie" \
  -d '{"text": "25 minute office visit", "use_ai": true}'
```

### Python

```python
import requests
import json

session = requests.Session()

# Login first
session.post('http://localhost:81/', data={'email': 'user@example.com'})

# Generate codes
response = session.post(
    'http://localhost:81/generate',
    json={
        'text': '25 minute office visit with medication management',
        'use_ai': False
    }
)

result = response.json()
print(json.dumps(result, indent=2))
```

### JavaScript/Fetch

```javascript
// Login
await fetch('http://localhost:81/', {
  method: 'POST',
  body: new FormData(loginForm),
  credentials: 'include'
});

// Generate codes
const response = await fetch('http://localhost:81/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    text: '25 minute office visit',
    use_ai: false
  })
});

const result = await response.json();
console.log(result);
```

---

## Rate Limiting

Currently no rate limiting. For production:
- Implement rate limiting per session
- Set max requests per minute
- Add exponential backoff for AI requests

---

## Roadmap

- [ ] JWT authentication
- [ ] API key support
- [ ] Rate limiting
- [ ] Batch code generation
- [ ] Confidence scores
- [ ] Code history/versioning
- [ ] Export to CSV/HL7
- [ ] Webhook integrations
- [ ] GraphQL API

---

## Support

For issues or questions, open a GitHub issue.
