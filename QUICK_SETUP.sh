#!/bin/bash
# Medical Coding SaaS - Complete Setup Guide
# Copy and paste each section to set up the project

echo "🏥 Medical Coding SaaS - Setup Guide"
echo "===================================="
echo ""

# Step 1: Clone the repository
echo "📥 Step 1: Clone the Repository"
echo "Command:"
echo "  git clone --branch claude/medical-coding-saas-p9O9u \\"
echo "    https://github.com/wardwellgroup1-cmyk/Clinisyswwg.git \\"
echo "    medical-coding-saas"
echo "  cd medical-coding-saas"
echo ""
echo "Expected output:"
echo "  Cloning into 'medical-coding-saas'..."
echo "  remote: Enumerating objects: ..."
echo "  Receiving objects: 100%"
echo ""

# Step 2: Create virtual environment
echo "🐍 Step 2: Create Virtual Environment"
echo "Command:"
echo "  python -m venv venv"
echo ""
echo "Then activate it:"
echo "  # On macOS/Linux:"
echo "  source venv/bin/activate"
echo ""
echo "  # On Windows:"
echo "  venv\\Scripts\\activate"
echo ""
echo "You should see (venv) in your terminal."
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Install Dependencies"
echo "Command:"
echo "  pip install -r requirements.txt"
echo ""
echo "Expected packages:"
echo "  ✓ Flask==2.3.3"
echo "  ✓ Werkzeug==2.3.7"
echo "  ✓ pydantic==2.5.0"
echo "  ✓ openai==1.3.5"
echo ""

# Step 4: Configure environment (optional)
echo "⚙️  Step 4: Configure Environment (Optional)"
echo "Command:"
echo "  cp .env.example .env"
echo "  nano .env  # or your favorite editor"
echo ""
echo "Edit these variables:"
echo "  FLASK_SECRET_KEY=your-secret-key-here"
echo "  OPENAI_API_KEY=sk-your-api-key  # Only if using AI mode"
echo ""

# Step 5: Run the app
echo "🚀 Step 5: Run the Application"
echo "Command:"
echo "  python app.py"
echo ""
echo "Expected output:"
echo "  WARNING: This is a development server. Do not use it in production."
echo "  Running on http://0.0.0.0:81"
echo ""

# Step 6: Access the app
echo "🌐 Step 6: Access the Application"
echo "Open your browser and go to:"
echo "  http://localhost:81"
echo ""
echo "Login:"
echo "  Email: test@example.com  (any email works)"
echo ""

# Step 7: Test the app
echo "✅ Step 7: Test the Application"
echo "Example clinical text:"
echo '  "25 minute office visit with medication management.'
echo '   Patient has hypertension and diabetes.'
echo '   Post-discharge follow-up."'
echo ""
echo "Expected output:"
echo "  CPT: [99495, 99214]"
echo "  ICD-10: [I10, E11.9]"
echo "  Modifiers: [25]"
echo "  Explanations: [...]"
echo ""

echo "===================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Read SETUP.md for detailed instructions"
echo "  2. Read API.md for API documentation"
echo "  3. Read CLAUDE.md for architecture"
echo "  4. Check UPLOAD_TO_GITHUB.md to deploy"
echo ""
