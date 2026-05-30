FROM python:3.10-slim

WORKDIR /app

# Environment defaults
ENV FLASK_PORT=81
ENV DATABASE_URL=/app/data/database.db

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy application
COPY . .

# Create database directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 81

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD sh -c "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:' + str(__import__('os').environ.get('FLASK_PORT', '81')) + '/')\"" || exit 1

# Run application
CMD sh -c "gunicorn -w 4 -b 0.0.0.0:${FLASK_PORT} --timeout 120 app:app"
