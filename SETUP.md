# Setup & Deployment Guide

## Prerequisites

- Python 3.8+
- pip
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/wardwellgroup1-cmyk/Clinisyswwg.git
cd Clinisyswwg
```

### 2. Create Virtual Environment (Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

The app will start on **http://localhost:81**

### 5. Test the Application

1. Open your browser and navigate to `http://localhost:81`
2. Login with any email (e.g., `test@example.com`)
3. Paste clinical text in the dashboard
4. Click "Generate Codes"
5. View the CPT, ICD-10, and modifier codes

### Example Clinical Text

```
Patient came in for 25 minute medication management visit.
Has hypertension and diabetes.
Post-discharge follow-up from recent hospitalization.
```

Expected Output:
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

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Flask
FLASK_SECRET_KEY=your-secret-key-here
FLASK_DEBUG=False

# OpenAI (Optional - for AI-powered coding)
OPENAI_API_KEY=sk-your-api-key-here

# Flask Port
FLASK_PORT=81
```

### OpenAI Integration (Optional)

To enable AI-powered medical coding:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-xxx...
   ```
3. Restart the application
4. In the dashboard, check "Use AI-powered coding"

The app works perfectly without OpenAI—just uses rule-based coding.

## Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:81 app:app
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:81", "app:app"]
```

Build and run:

```bash
docker build -t medical-coding-saas .
docker run -p 81:81 -e FLASK_SECRET_KEY=your-key medical-coding-saas
```

### Using Heroku

1. Create `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   heroku config:set FLASK_SECRET_KEY=your-secret-key
   heroku config:set OPENAI_API_KEY=your-openai-key
   git push heroku main
   ```

### Using AWS, GCP, Azure

Deploy the Flask app using:
- AWS: EC2 + Elastic Beanstalk
- GCP: Cloud Run or App Engine
- Azure: App Service

All support Python Flask apps.

## Database

The app uses SQLite (`database.db`), which is automatically created on first run.

### Reset Database

```bash
rm database.db
python app.py
```

### Backup Database

```bash
cp database.db database.backup.db
```

## Troubleshooting

### Port 81 Already in Use

Change the port in `app.py`:

```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)  # Use port 8000
```

### OpenAI API Errors

- Check `OPENAI_API_KEY` is set correctly
- Verify API key has sufficient balance
- Check internet connection
- App will fall back to rule-based coding if AI fails

### Database Locked Error

SQLite can have concurrency issues. For production, migrate to PostgreSQL:

```python
import psycopg2
# Update connection string in init_db()
```

## Development

### Adding New Medical Codes

Edit the `VALID_CPT` and `VALID_MODIFIERS` sets in `app.py`:

```python
VALID_CPT = {
    "99213", "99214", "99215",  # Add new codes here
    # ...
}
```

### Adding New Rule-Based Patterns

Edit the `rule_based_coding()` function in `app.py`:

```python
if "new_keyword" in text_lower:
    result["icd10"].append("NEW_CODE")
    result["explanation"].append("ICD-10 NEW_CODE: Description")
```

### Running Tests

```bash
pytest tests/
```

## Security Checklist

- [ ] Change `FLASK_SECRET_KEY` to a strong random string
- [ ] Never commit `.env` file
- [ ] Use HTTPS in production
- [ ] Add authentication (currently basic session-based)
- [ ] Validate all user input
- [ ] Use environment variables for secrets
- [ ] Rate limit API endpoints
- [ ] Log all API requests for audit trail
- [ ] Regular security updates for dependencies

## Support & Documentation

- **Project Docs**: See `CLAUDE.md`
- **README**: See `README.md`
- **Issues**: Report on GitHub
- **Contributing**: Submit pull requests

## License

MIT
