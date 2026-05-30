# 📋 Complete Installation Guide

## 🎯 Overview

This guide will help you clone, set up, and run the Medical Coding SaaS application.

**Total setup time: ~5 minutes**

---

## ✅ Prerequisites

Before starting, make sure you have:

- ✅ Git installed (https://git-scm.com)
- ✅ Python 3.8+ installed (https://python.org)
- ✅ pip (comes with Python)
- ✅ Terminal/Command prompt access

**Check your versions:**
```bash
git --version          # Should be 2.x or higher
python --version       # Should be 3.8+
pip --version          # Should work
```

---

## 🚀 Step-by-Step Setup

### **Step 1: Clone the Repository** (1 minute)

Choose your desired location and clone:

```bash
# Create a project directory
cd ~/projects  # or your preferred location

# Clone the repository with the correct branch
git clone --branch claude/medical-coding-saas-p9O9u \
  https://github.com/wardwellgroup1-cmyk/Clinisyswwg.git \
  medical-coding-saas

# Navigate into the project
cd medical-coding-saas
```

**What you should see:**
```
Cloning into 'medical-coding-saas'...
remote: Enumerating objects: ...
Receiving objects: 100% (XX/XX), done.
Branch 'claude/medical-coding-saas-p9O9u' set to track...
```

**Verify all files are present:**
```bash
ls -la

# You should see:
app.py
requirements.txt
README.md
CLAUDE.md
SETUP.md
API.md
templates/
static/
.gitignore
.env.example
Dockerfile
Procfile
```

✅ **Step 1 complete!**

---

### **Step 2: Create Virtual Environment** (30 seconds)

Virtual environments keep Python packages isolated per project.

```bash
# Create virtual environment
python -m venv venv

# Activate it:
# On macOS/Linux:
source venv/bin/activate

# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
venv\Scripts\activate.bat
```

**You should see `(venv)` at the start of your terminal line:**
```
(venv) ~/projects/medical-coding-saas $
```

✅ **Step 2 complete!**

---

### **Step 3: Install Dependencies** (1 minute)

Install all required Python packages:

```bash
# Make sure you're in the project directory
cd medical-coding-saas

# Make sure virtual environment is activated (you see (venv))
pip install -r requirements.txt
```

**Expected output:**
```
Collecting Flask==2.3.3
Collecting Werkzeug==2.3.7
Collecting pydantic==2.5.0
Collecting openai==1.3.5
Installing collected packages: ...
Successfully installed Flask-2.3.3 Werkzeug-2.3.7 ...
```

✅ **Step 3 complete!**

---

### **Step 4: Configure Environment (Optional, 1 minute)**

Set up environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or use your favorite editor
```

**Edit these variables:**

```env
# Required
FLASK_SECRET_KEY=your-secret-key-change-this-in-production

# Optional - for AI-powered coding
OPENAI_API_KEY=sk-your-api-key-here
```

**To get an OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Copy and paste it into `.env`

⚠️ **Security Note:** Never commit `.env` to GitHub. It's already in `.gitignore`.

✅ **Step 4 complete!** (optional)

---

### **Step 5: Run the Application** (30 seconds)

Start the Flask server:

```bash
# Make sure (venv) is still activated
python app.py
```

**Expected output:**
```
WARNING: This is a development server. Do not use it in production.
Running on http://0.0.0.0:81
Press CTRL+C to quit
Restarting with reloader
```

✅ **Step 5 complete!**

---

### **Step 6: Open in Browser** (30 seconds)

Open your web browser and navigate to:

```
http://localhost:81
```

You should see the login page! 🎉

**Login with any email:**
- Email: `test@example.com`
- Click "Login"

✅ **Step 6 complete!**

---

### **Step 7: Test Code Generation** (1 minute)

1. You're now on the dashboard
2. Paste this clinical text:

```
25 minute office visit with medication management.
Patient has hypertension and diabetes.
Post-discharge follow-up from recent hospitalization.
```

3. Click "Generate Codes"
4. You should see results:
   - **CPT**: 99495, 99214
   - **ICD-10**: I10, E11.9
   - **Modifiers**: 25
   - **Explanation**: Details for each code

✅ **Step 7 complete!**

---

## 🎉 Setup Complete!

Your Medical Coding SaaS is now running! 

### What's Next?

1. **Explore the Dashboard**
   - Generate more codes
   - Try the "Use AI-powered coding" checkbox (if OPENAI_API_KEY is set)
   - View encounter history

2. **Read the Documentation**
   - `README.md` — Project overview
   - `API.md` — API endpoints and examples
   - `SETUP.md` — Advanced setup and deployment

3. **Deploy to Production**
   - `Dockerfile` — Docker containerization
   - `Procfile` — Heroku deployment
   - `SETUP.md` — AWS/GCP/Azure instructions

4. **Push to GitHub**
   - See `UPLOAD_TO_GITHUB.md`

---

## 🆘 Troubleshooting

### Issue: "Port 81 already in use"

**Solution:**
```bash
# Kill the process on port 81
lsof -ti:81 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :81   # Windows

# Or change the port in app.py:
# Change: app.run(host="0.0.0.0", port=81)
# To:     app.run(host="0.0.0.0", port=8000)
```

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "python: command not found"

**Solution:**
```bash
# Try python3 instead
python3 -m venv venv
python3 app.py

# Or add Python to PATH in System settings
```

### Issue: "Permission denied" on Unix

**Solution:**
```bash
chmod +x app.py
python app.py
```

### Issue: "Cannot find .env file"

**Solution:**
```bash
# The .env file is optional
# App works fine with defaults
# But you need it for OpenAI support:
cp .env.example .env
nano .env
```

---

## 📊 System Requirements

| Component | Requirement | Tested |
|-----------|-------------|--------|
| Python | 3.8+ | 3.10 ✅ |
| Flask | 2.3.3 | ✅ |
| SQLite | 3.x | ✅ |
| RAM | 512 MB min | ✅ |
| Disk | 100 MB | ✅ |
| OS | Any | macOS, Linux, Windows ✅ |

---

## 🚀 Next: Deployment

Once the app is running locally, you can deploy it:

### Docker
```bash
docker build -t medical-coding-saas .
docker run -p 81:81 medical-coding-saas
```

### Heroku
```bash
# See SETUP.md for full instructions
heroku create your-app-name
git push heroku main
```

### AWS/GCP/Azure
See `SETUP.md` for detailed deployment guides.

---

## 📝 Common Tasks

### Stop the Server
```bash
# Press Ctrl+C in the terminal
^C
```

### Deactivate Virtual Environment
```bash
deactivate
```

### View Database Records
```bash
# SQLite CLI
sqlite3 database.db
sqlite> SELECT * FROM encounters;
sqlite> .quit
```

### Reset Database
```bash
rm database.db
python app.py  # Will recreate empty database
```

---

## 💡 Tips & Best Practices

✅ **Always activate the virtual environment** before running:
```bash
source venv/bin/activate
```

✅ **Keep .env out of Git:**
```bash
# Already in .gitignore ✓
```

✅ **Use .env.example as template:**
```bash
cp .env.example .env
```

✅ **Restart app after changing .env:**
```bash
# Kill the server (Ctrl+C)
# Change .env
# Run: python app.py
```

✅ **Check logs for errors:**
Open browser console (F12) and check terminal output.

---

## 📞 Need Help?

- **Setup issues?** See "Troubleshooting" above
- **API questions?** Read `API.md`
- **Architecture?** Read `CLAUDE.md`
- **Deployment?** Read `SETUP.md`

---

## 🎓 Learning Resources

- Flask: https://flask.palletsprojects.com/
- Pydantic: https://docs.pydantic.dev/
- OpenAI API: https://platform.openai.com/docs/
- Medical Coding: https://www.aapc.com/

---

## ✅ Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] .env file created (optional)
- [ ] App running (`python app.py`)
- [ ] Browser opens to `http://localhost:81`
- [ ] Login works
- [ ] Code generation works

**If all checked, you're ready to use the Medical Coding SaaS! 🎉**

---

**Happy coding! 🚀**
