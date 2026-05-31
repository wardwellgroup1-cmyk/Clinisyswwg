#!/bin/bash
# 🏥 Medical Coding SaaS - Localhost Setup Guide
# Copy and paste these commands to run the app locally

echo "=========================================="
echo "🏥 Medical Coding SaaS - Localhost Setup"
echo "=========================================="
echo ""

# Step 1: Activate virtual environment
echo "Step 1️⃣ : Activate Virtual Environment"
echo "Command: source venv/bin/activate"
echo "Expected: You'll see (venv) in your terminal"
echo ""

# Step 2: Verify dependencies
echo "Step 2️⃣ : Verify Dependencies Installed"
echo "Command: pip list | grep -E 'Flask|pydantic|openai'"
echo "Expected:"
echo "  Flask          2.3.3"
echo "  pydantic       2.5.0"
echo "  openai         1.3.5"
echo ""

# Step 3: Start the Flask app
echo "Step 3️⃣ : Start the Flask Application"
echo "Command: python app.py"
echo "Expected output:"
echo "  WARNING: This is a development server..."
echo "  Running on http://0.0.0.0:81"
echo "  Press CTRL+C to quit"
echo ""

# Step 4: Access in browser
echo "Step 4️⃣ : Open in Web Browser"
echo "URL: http://localhost:81"
echo ""

# Step 5: Test the app
echo "Step 5️⃣ : Test Medical Code Generation"
echo "Steps:"
echo "  1. Login with any email (e.g., test@example.com)"
echo "  2. Paste: '25 minute office visit with medication management'"
echo "  3. Click: 'Generate Codes'"
echo "  4. You should see:"
echo "     - CPT: 99214"
echo "     - ICD-10: E11.9 (if diabetes mentioned)"
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
