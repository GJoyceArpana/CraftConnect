# 🚀 CraftConnect Deployment Guide

This guide covers various deployment options for CraftConnect, from local development to production environments.

## 📋 **Prerequisites**

- Python 3.8 or higher
- Git
- Docker (optional, for containerized deployment)
- Web server (nginx, Apache) for production

## 🏠 **Local Development**

### Basic Setup
```bash
# Clone repository
git clone <repository-url>
cd CraftConnect

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

The application will be available at `http://localhost:5000`

### Development Configuration
```python
# In app.py - Development settings
app.config['DEBUG'] = True
app.config['ENV'] = 'development'
app.secret_key = 'dev-secret-key'
```

## 🏭 **Production Deployment**

### Option 1: Direct Python Deployment

#### 1. System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install system dependencies
sudo apt install build-essential -y
```

#### 2. Application Setup
```bash
# Create application directory
sudo mkdir -p /opt/craftconnect
cd /opt/craftconnect

# Clone and setup
git clone <repository-url> .
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Environment Configuration
```bash
# Create environment file
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex())')
MAX_CONTENT_LENGTH=16777216
HOST=0.0.0.0
PORT=5000
EOF
```

#### 4. Using Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Create Gunicorn configuration
cat > gunicorn.conf.py << EOF
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
worker_connections = 1000
EOF

# Run with Gunicorn
gunicorn -c gunicorn.conf.py app:app
```

#### 5. Systemd Service
```bash
# Create service file
sudo cat > /etc/systemd/system/craftconnect.service << EOF
[Unit]
Description=CraftConnect AI Marketplace
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/opt/craftconnect
Environment=PATH=/opt/craftconnect/venv/bin
ExecStart=/opt/craftconnect/venv/bin/gunicorn -c gunicorn.conf.py app:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable craftconnect
sudo systemctl start craftconnect
```

### Option 2: Docker Deployment

#### 1. Dockerfile
```dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Run the application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### 2. Docker Compose (with Redis for analytics)
```yaml
version: '3.8'

services:
  craftconnect:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - craftconnect
    restart: unless-stopped

volumes:
  redis_data:
```

#### 3. Build and Deploy
```bash
# Build image
docker build -t craftconnect .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f craftconnect
```

### Option 3: Cloud Deployment

#### AWS EC2
```bash
# Launch EC2 instance (t3.medium recommended)
# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Deploy application
git clone <repository-url>
cd CraftConnect
docker build -t craftconnect .
docker run -d -p 80:5000 --name craftconnect craftconnect
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/craftconnect
gcloud run deploy --image gcr.io/PROJECT-ID/craftconnect --platform managed
```

#### Heroku
```bash
# Install Heroku CLI and login
heroku create craftconnect-app

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🌐 **Nginx Configuration**

### Basic Nginx Config
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /opt/craftconnect/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /opt/craftconnect/uploads;
        expires 7d;
    }
}
```

### SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🛡️ **Security Configuration**

### Environment Variables
```bash
# Production environment variables
export FLASK_ENV=production
export SECRET_KEY="your-super-secret-key-here"
export MAX_CONTENT_LENGTH=16777216
export UPLOAD_FOLDER=/secure/uploads
export SSL_DISABLE=False
```

### Application Security
```python
# In app.py - Production security settings
from flask_talisman import Talisman

# Enable security headers
Talisman(app, force_https=True)

# Secure session configuration
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY'),
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)
```

### File Upload Security
```python
# Secure file handling
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

def secure_upload(file):
    if file and allowed_file(file.filename):
        # Scan file for malware (optional)
        # Validate file content type
        # Generate secure filename
        filename = secure_filename(file.filename)
        return filename
    return None
```

## 📊 **Database Integration (Optional)**

### PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE craftconnect;
CREATE USER craftconnect_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE craftconnect TO craftconnect_user;
```

### SQLAlchemy Integration
```python
# Add to requirements.txt
# flask-sqlalchemy==3.0.5
# psycopg2-binary==2.9.7

# Database configuration
import os
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://craftconnect_user:secure_password@localhost/craftconnect'
)
db = SQLAlchemy(app)

# Analytics model
class AnalyticsEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100))
    data = db.Column(db.JSON)
```

## 🔍 **Monitoring & Logging**

### Application Logging
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler(
        'logs/craftconnect.log',
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('CraftConnect startup')
```

### Health Check Endpoint
```python
@app.route('/health')
def health_check():
    try:
        # Check database connectivity
        # Check ML model availability
        # Check file system access
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
```

## 🧪 **Testing Deployment**

### Smoke Tests
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/health

# Test file upload
curl -X POST -F "title=Test Product" \
     -F "description=Test description" \
     http://localhost:5000/api/products/upload/form

# Test analytics
curl -X GET http://localhost:5000/api/analytics/live
```

### Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Run load test
ab -n 1000 -c 10 http://localhost:5000/api/health
```

## 🚨 **Troubleshooting**

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 PID
```

**2. Permission Errors**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /opt/craftconnect
sudo chmod -R 755 /opt/craftconnect
```

**3. Memory Issues**
```bash
# Increase system swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**4. SSL Certificate Issues**
```bash
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Use Let's Encrypt (production)
sudo certbot --nginx -d your-domain.com
```

## 📈 **Performance Optimization**

### Caching
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.cached(timeout=300)
def expensive_function():
    return "Cached result"
```

### CDN Integration
```nginx
location /static {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-CDN "HIT";
}
```

### Database Connection Pooling
```python
from sqlalchemy.pool import QueuePool

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'poolclass': QueuePool,
    'pool_size': 10,
    'max_overflow': 20,
    'pool_recycle': 3600
}
```

## 📊 **Monitoring Dashboard**

### Prometheus Metrics
```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)

# Custom metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "CraftConnect Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🎯 **Production Checklist**

### Before Deployment
- [ ] Environment variables configured
- [ ] Secret key generated securely
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Backup system setup
- [ ] Monitoring alerts configured
- [ ] Log rotation configured
- [ ] Health checks implemented
- [ ] Performance tested

### Post Deployment
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Analytics tracking
- [ ] SSL certificate valid
- [ ] Monitoring dashboard active
- [ ] Backup jobs scheduled
- [ ] Error alerting tested
- [ ] Performance baselines established

---

## 📞 **Support**

For deployment issues or questions:
- Check the troubleshooting section
- Review application logs
- Test with curl commands
- Monitor system resources

**Happy Deploying! 🚀**