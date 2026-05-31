# 🏥 Running Medical Coding SaaS on Localhost

## ✅ Prerequisites Check

Before starting, verify you have:

```bash
# Check Python version
python --version           # Should be 3.8 or higher

# Check pip
pip --version             # Should work

# Check Git
git --version             # Should work
```

---

## 🚀 Step-by-Step Setup (5 Minutes)

### **Step 1: Navigate to Project Directory**

```bash
cd /path/to/your/medical-coding-saas
# or wherever you cloned the repository
```

### **Step 2: Create Virtual Environment**

```bash
# Create the virtual environment
python -m venv venv
```

**What this does:**
- Creates isolated Python environment
- Prevents package conflicts with system Python
- Creates `venv/` folder (~150MB)

### **Step 3: Activate Virtual Environment**

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**You should see `(venv)` at the start of your terminal:**
```
(venv) user@machine:~/medical-coding-saas $
```

### **Step 4: Install Dependencies**

```bash
pip install -r requirements.txt
```

**Expected output:**
```
Collecting Flask==2.3.3
Collecting Werkzeug==2.3.7
Collecting pydantic==2.5.0
Collecting openai==1.3.5
...
Successfully installed Flask-2.3.3 Werkzeug-2.3.7 pydantic-2.5.0 openai-1.3.5
```

**Installation should take ~30 seconds**

### **Step 5: (Optional) Configure OpenAI**

If you want to use AI-powered coding:

```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env  # or use your favorite editor
```

Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

Get an API key from: https://platform.openai.com/api-keys

⚠️ **Skip this step if you don't have an OpenAI key** — the app works fine with rule-based coding!

### **Step 6: Start the Flask App**

```bash
python app.py
```

**Expected output:**
```
WARNING: This is a development server. Do not use it in production.
Running on http://0.0.0.0:81
Press CTRL+C to quit
 * Restarting with reloader
```

✅ **App is running!**

### **Step 7: Open in Browser**

Open your web browser and navigate to:

```
http://localhost:81
```

You should see the **Medical Coding SaaS login page**! 🎉

### **Step 8: Login and Test**

1. **Login Page:**
   - Email: `test@example.com` (any email works)
   - Click "Login"

2. **Dashboard:**
   - You should see the clinical text input area

3. **Test Code Generation:**
   - Paste this clinical text:
   ```
   25 minute office visit with medication management.
   Patient has hypertension and diabetes.
   Post-discharge follow-up.
   ```
   - Click "🚀 Generate Codes"
   - You should see:
     ```
     CPT: 99495, 99214
     ICD-10: I10, E11.9
     Modifiers: 25
     Explanation: [...]
     ```

4. **(Optional) Try AI Mode:**
   - Check "Use AI-powered coding" checkbox
   - Click "Generate Codes" again
   - You'll see "🤖 AI-Generated" badge if OpenAI API key is configured

✅ **Success!** Your app is working locally!

---

## 🎯 Localhost Endpoints

Once running, you can access:

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Login | `http://localhost:81/` | Login page |
| Dashboard | `http://localhost:81/dashboard` | Main app |
| API | `http://localhost:81/generate` | Code generation API |
| Logout | `http://localhost:81/logout` | Logout |

---

## 📝 Testing the API with cURL

While the app is running, test the API:

```bash
# Rule-based coding
curl -X POST http://localhost:81/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "25 minute office visit",
    "use_ai": false
  }'

# Response:
# {
#   "cpt": ["99214"],
#   "icd10": [],
#   "modifiers": [],
#   "explanation": ["CPT 99214: Office visit (25-39 minutes)"],
#   "ai_generated": false
# }
```

---

## 🔄 Development Workflow

### **Making Changes to Code**

1. **Edit** `app.py` or template files
2. **Save** the file
3. Flask will **auto-reload** if `debug=True`
4. **Refresh browser** to see changes

**For Python changes:**
```bash
# Stop the app (Ctrl+C)
# Make changes to app.py
python app.py  # Restart
```

**For HTML/CSS changes:**
```bash
# Changes are live-reloaded
# Just refresh your browser (F5)
```

### **View Database Records**

```bash
# In a new terminal (while app is running):
sqlite3 database.db

# Inside SQLite:
sqlite> SELECT * FROM encounters;
sqlite> SELECT * FROM encounters LIMIT 5;
sqlite> .quit
```

### **Reset Database**

```bash
# Stop the app (Ctrl+C)
rm database.db
python app.py  # Will recreate empty database
```

---

## 🛑 Stopping the App

```bash
# Press Ctrl+C in the terminal
^C
```

You should see:
```
KeyboardInterrupt
```

---

## 🚪 Deactivate Virtual Environment

When you're done developing:

```bash
deactivate
```

The `(venv)` prefix will disappear from your terminal.

---

## 🆘 Troubleshooting

### **Issue: Port 81 Already in Use**

```bash
# Find the process using port 81
lsof -i :81          # macOS/Linux
netstat -ano | findstr :81  # Windows

# Kill the process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change the port in app.py:
# Change: app.run(host="0.0.0.0", port=81)
# To:     app.run(host="0.0.0.0", port=8000)
```

### **Issue: ModuleNotFoundError: Flask**

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### **Issue: "python: command not found"**

```bash
# Try python3 instead
python3 app.py

# Or add Python to PATH:
# macOS: brew install python
# Linux: sudo apt-get install python3
# Windows: Download from python.org
```

### **Issue: Database is Locked**

```bash
# Stop the app (Ctrl+C)
rm database.db
python app.py  # Restart
```

### **Issue: Changes Not Showing**

```bash
# Hard refresh browser
Ctrl+F5  (Windows/Linux)
Cmd+Shift+R  (macOS)

# Or clear browser cache
# Ctrl+Shift+Delete (most browsers)
```

---

## 📊 Application Structure

```
medical-coding-saas/
├── app.py                    # Main Flask app (runs on port 81)
├── requirements.txt          # Dependencies
├── database.db              # SQLite database (auto-created)
├── venv/                    # Virtual environment
│
├── templates/
│   ├── login.html           # Login page
│   └── dashboard.html       # Main dashboard
│
└── static/
    └── style.css            # Styling
```

---

## 💡 Tips & Best Practices

✅ **Always activate virtual environment:**
```bash
source venv/bin/activate
```

✅ **Keep virtual environment activated** while developing

✅ **Use .env file** for secrets:
```bash
cp .env.example .env
# Edit .env with your keys
```

✅ **Test in browser** before pushing code

✅ **Check browser console** (F12) for JavaScript errors

✅ **Check terminal** for Flask errors

✅ **Restart app** after changing `app.py`

✅ **Refresh browser** after changing templates/CSS

---

## 🚀 Next Steps

### **After Testing Locally:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Test message"
   git push origin claude/medical-coding-saas-p9O9u
   ```

2. **Deploy to Production:**
   - See `SETUP.md` for Docker/Heroku/AWS deployment

3. **Share the PR:**
   - Reference: https://github.com/wardwellgroup1-cmyk/Clinisyswwg/pull/6

---

## ✅ Localhost Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created (`venv/`)
- [ ] Virtual environment activated (`(venv)` visible)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created (optional, for OpenAI)
- [ ] Flask app running (`python app.py`)
- [ ] Browser opens to `http://localhost:81`
- [ ] Login works
- [ ] Code generation works
- [ ] Database stores encounters

**If all checked, you're ready to develop! 🎉**

---

## 📞 Getting Help

- **Flask Docs:** https://flask.palletsprojects.com/
- **Pydantic Docs:** https://docs.pydantic.dev/
- **SQLite Docs:** https://www.sqlite.org/
- **Python Venv:** https://docs.python.org/3/tutorial/venv.html

---

**Happy developing! 🚀**
