#!/usr/bin/env python3
"""
Advanced Flask API for CraftConnect
Integrates advanced ML models including CLIP, XGBoost, and comprehensive analysis
"""

import os
import sys
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import logging
import traceback

# Flask imports
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest

# Import our advanced ML models
try:
    from ml.advanced_models import AdvancedCraftAnalyzer, AdvancedAutoTagger, AdvancedPricingModel, SustainabilityAnalyzer
    ADVANCED_MODELS_AVAILABLE = True
except ImportError as e:
    print(f"Advanced models not available: {e}")
    ADVANCED_MODELS_AVAILABLE = False

# Database integration (placeholder for real database)
import sqlite3
import pandas as pd

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config.update({
    'SECRET_KEY': 'your-secret-key-here',
    'UPLOAD_FOLDER': 'uploads/',
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB max file size
    'ALLOWED_EXTENSIONS': {'png', 'jpg', 'jpeg', 'gif', 'webp'}
})

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variables to store model instances
advanced_analyzer = None
analytics_data = {
    'total_requests': 0,
    'successful_analyses': 0,
    'failed_analyses': 0,
    'average_processing_time': 0,
    'recent_requests': []
}

def init_models():
    """Initialize ML models on app startup"""
    global advanced_analyzer
    
    if ADVANCED_MODELS_AVAILABLE:
        try:
            logger.info("Initializing advanced ML models...")
            advanced_analyzer = AdvancedCraftAnalyzer()
            logger.info("Advanced ML models initialized successfully!")
        except Exception as e:
            logger.error(f"Failed to initialize advanced models: {e}")
            advanced_analyzer = None
    else:
        logger.warning("Advanced ML models not available, using fallback methods")

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def track_request(endpoint: str, success: bool, processing_time: float, details: Dict = None):
    """Track API request analytics"""
    analytics_data['total_requests'] += 1
    
    if success:
        analytics_data['successful_analyses'] += 1
    else:
        analytics_data['failed_analyses'] += 1
    
    # Update average processing time
    current_avg = analytics_data['average_processing_time']
    total_requests = analytics_data['total_requests']
    analytics_data['average_processing_time'] = (
        (current_avg * (total_requests - 1) + processing_time) / total_requests
    )
    
    # Add to recent requests (keep last 100)
    request_info = {
        'timestamp': datetime.now().isoformat(),
        'endpoint': endpoint,
        'success': success,
        'processing_time': processing_time,
        'details': details or {}
    }
    
    analytics_data['recent_requests'].insert(0, request_info)
    if len(analytics_data['recent_requests']) > 100:
        analytics_data['recent_requests'] = analytics_data['recent_requests'][:100]

def init_database():
    """Initialize SQLite database for storing analysis results"""
    db_path = "craftconnect_advanced.db"
    conn = sqlite3.connect(db_path)
    
    # Create tables
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            timestamp TEXT,
            product_title TEXT,
            category TEXT,
            image_path TEXT,
            clip_analysis TEXT,
            mobilenet_analysis TEXT,
            pricing_analysis TEXT,
            sustainability_analysis TEXT,
            overall_score REAL,
            processing_time REAL
        )
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            analysis_id TEXT,
            rating INTEGER,
            feedback_text TEXT,
            timestamp TEXT,
            FOREIGN KEY (analysis_id) REFERENCES analyses (id)
        )
    """)
    
    conn.commit()
    conn.close()

def save_analysis_to_db(analysis_id: str, analysis_data: Dict):
    """Save analysis results to database"""
    try:
        conn = sqlite3.connect("craftconnect_advanced.db")
        
        conn.execute("""
            INSERT INTO analyses 
            (id, timestamp, product_title, category, image_path, 
             clip_analysis, mobilenet_analysis, pricing_analysis, 
             sustainability_analysis, overall_score, processing_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_id,
            analysis_data.get('timestamp', ''),
            analysis_data.get('product_title', ''),
            analysis_data.get('category', ''),
            analysis_data.get('image_path', ''),
            json.dumps(analysis_data.get('image_analysis', {}).get('clip_analysis', {})),
            json.dumps(analysis_data.get('image_analysis', {}).get('mobilenet_analysis', {})),
            json.dumps(analysis_data.get('pricing_analysis', {})),
            json.dumps(analysis_data.get('sustainability_analysis', {})),
            analysis_data.get('sustainability_analysis', {}).get('overall_sustainability_score', 0),
            analysis_data.get('processing_time', 0)
        ))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Failed to save analysis to database: {e}")

# API Routes

@app.route('/')
def index():
    """Home page with API documentation"""
    return render_template('api_docs.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_available': ADVANCED_MODELS_AVAILABLE,
        'advanced_analyzer_ready': advanced_analyzer is not None
    })

@app.route('/api/analyze/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """Comprehensive analysis endpoint using all advanced models"""
    start_time = datetime.now()
    analysis_id = str(uuid.uuid4())
    
    try:
        # Check if advanced models are available
        if not advanced_analyzer:
            raise ValueError("Advanced ML models not available")
        
        # Get request data
        data = request.get_json() if request.is_json else {}
        
        # Handle file upload
        image_path = None
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = f"{analysis_id}_{secure_filename(file.filename)}"
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(image_path)
        
        # Extract product data
        product_data = {
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'category': data.get('category', 'unknown'),
            'location': data.get('location', ''),
            'materials': data.get('materials', []),
            'artisan': data.get('artisan', ''),
            'price': data.get('price', 0)
        }
        
        # Run comprehensive analysis
        results = advanced_analyzer.comprehensive_analysis(product_data, image_path)
        
        # Add metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'analysis_id': analysis_id,
            'processing_time': processing_time,
            'product_title': product_data['title'],
            'category': product_data['category'],
            'image_path': image_path
        })
        
        # Save to database
        save_analysis_to_db(analysis_id, results)
        
        # Track analytics
        track_request('comprehensive_analysis', True, processing_time, {
            'has_image': image_path is not None,
            'category': product_data['category']
        })
        
        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'results': results
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        error_msg = str(e)
        
        # Track failed request
        track_request('comprehensive_analysis', False, processing_time, {
            'error': error_msg
        })
        
        logger.error(f"Comprehensive analysis failed: {e}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': error_msg,
            'analysis_id': analysis_id
        }), 500

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    """Image analysis endpoint using CLIP and MobileNet"""
    start_time = datetime.now()
    analysis_id = str(uuid.uuid4())
    
    try:
        if not advanced_analyzer:
            raise ValueError("Advanced ML models not available")
        
        # Handle file upload
        if 'image' not in request.files:
            raise BadRequest("No image file provided")
        
        file = request.files['image']
        if not file or not allowed_file(file.filename):
            raise BadRequest("Invalid image file")
        
        # Save uploaded file
        filename = f"{analysis_id}_{secure_filename(file.filename)}"
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)
        
        # Analyze image
        clip_results = advanced_analyzer.auto_tagger.analyze_image_clip(image_path)
        mobilenet_results = advanced_analyzer.auto_tagger.analyze_image_mobilenet(image_path)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        results = {
            'analysis_id': analysis_id,
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time,
            'image_path': image_path,
            'clip_analysis': clip_results,
            'mobilenet_analysis': mobilenet_results
        }
        
        track_request('image_analysis', True, processing_time)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        track_request('image_analysis', False, processing_time, {'error': str(e)})
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze/pricing', methods=['POST'])
def analyze_pricing():
    """Pricing analysis endpoint using XGBoost ensemble"""
    start_time = datetime.now()
    
    try:
        if not advanced_analyzer:
            raise ValueError("Advanced ML models not available")
        
        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")
        
        # Extract features for pricing model
        features = {
            'craft_type': data.get('category', 'unknown'),
            'region': data.get('location', '').split(',')[-1].strip().lower(),
            'material_quality': float(data.get('material_quality', 0.7)),
            'artisan_experience': int(data.get('artisan_experience', 5)),
            'size_factor': float(data.get('size_factor', 1.0)),
            'sustainability_score': float(data.get('sustainability_score', 0.6)),
            'complexity_score': float(data.get('complexity_score', 0.7)),
            'market_demand': float(data.get('market_demand', 0.6))
        }
        
        # Get pricing prediction
        results = advanced_analyzer.pricing_model.predict_price(features)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time,
            'input_features': features
        })
        
        track_request('pricing_analysis', True, processing_time)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        track_request('pricing_analysis', False, processing_time, {'error': str(e)})
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze/sustainability', methods=['POST'])
def analyze_sustainability():
    """Sustainability analysis endpoint with CO2 and waste impact"""
    start_time = datetime.now()
    
    try:
        if not advanced_analyzer:
            raise ValueError("Advanced ML models not available")
        
        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")
        
        # Run sustainability analysis
        results = advanced_analyzer.sustainability_analyzer.analyze_sustainability(data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time
        })
        
        track_request('sustainability_analysis', True, processing_time)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        track_request('sustainability_analysis', False, processing_time, {'error': str(e)})
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics')
def get_analytics():
    """Get API analytics and usage statistics"""
    return jsonify({
        'success': True,
        'analytics': analytics_data
    })

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback for an analysis"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")
        
        analysis_id = data.get('analysis_id')
        rating = int(data.get('rating', 0))
        feedback_text = data.get('feedback', '')
        
        if not analysis_id or rating < 1 or rating > 5:
            raise BadRequest("Invalid feedback data")
        
        # Save to database
        feedback_id = str(uuid.uuid4())
        conn = sqlite3.connect("craftconnect_advanced.db")
        
        conn.execute("""
            INSERT INTO feedback (id, analysis_id, rating, feedback_text, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (feedback_id, analysis_id, rating, feedback_text, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'feedback_id': feedback_id,
            'message': 'Feedback submitted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/history')
def get_analysis_history():
    """Get analysis history from database"""
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        conn = sqlite3.connect("craftconnect_advanced.db")
        cursor = conn.execute("""
            SELECT id, timestamp, product_title, category, overall_score, processing_time
            FROM analyses
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'timestamp': row[1],
                'product_title': row[2],
                'category': row[3],
                'overall_score': row[4],
                'processing_time': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'results': results,
            'total_count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analysis/<analysis_id>')
def get_analysis_details(analysis_id: str):
    """Get detailed analysis results by ID"""
    try:
        conn = sqlite3.connect("craftconnect_advanced.db")
        cursor = conn.execute("""
            SELECT * FROM analyses WHERE id = ?
        """, (analysis_id,))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({
                'success': False,
                'error': 'Analysis not found'
            }), 404
        
        result = {
            'id': row[0],
            'timestamp': row[1],
            'product_title': row[2],
            'category': row[3],
            'image_path': row[4],
            'clip_analysis': json.loads(row[5]) if row[5] else {},
            'mobilenet_analysis': json.loads(row[6]) if row[6] else {},
            'pricing_analysis': json.loads(row[7]) if row[7] else {},
            'sustainability_analysis': json.loads(row[8]) if row[8] else {},
            'overall_score': row[9],
            'processing_time': row[10]
        }
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analysis': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Demo endpoints for testing

@app.route('/api/demo/models')
def demo_models():
    """Demo endpoint to test all models"""
    if not advanced_analyzer:
        return jsonify({
            'success': False,
            'error': 'Advanced models not available'
        })
    
    # Sample product for demo
    sample_product = {
        'title': 'Traditional Madhubani Painting',
        'description': 'Handmade Madhubani painting using natural pigments and traditional techniques. Created by skilled artisan from Bihar using organic materials and zero-waste methods.',
        'category': 'paintings',
        'location': 'Madhubani, Bihar',
        'materials': ['handmade paper', 'natural pigments', 'organic colors'],
        'artisan': 'Sita Devi',
        'price': 2500
    }
    
    try:
        results = advanced_analyzer.comprehensive_analysis(sample_product)
        return jsonify({
            'success': True,
            'demo_results': results,
            'sample_product': sample_product
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

@app.errorhandler(BadRequest)
def bad_request(error):
    return jsonify({
        'success': False,
        'error': str(error)
    }), 400

# Initialize on startup (Flask 2.0+ compatibility)
def startup():
    """Initialize models and database on first request"""
    init_database()
    init_models()

# Register startup function
with app.app_context():
    startup()

if __name__ == '__main__':
    # Initialize immediately if running directly
    init_database()
    init_models()
    
    # Run the app
    print("🚀 Starting CraftConnect Advanced API Server...")
    print("📊 Available endpoints:")
    print("  • POST /api/analyze/comprehensive - Full product analysis")
    print("  • POST /api/analyze/image - Image analysis with CLIP & MobileNet")
    print("  • POST /api/analyze/pricing - XGBoost pricing prediction")
    print("  • POST /api/analyze/sustainability - Sustainability analysis")
    print("  • GET  /api/analytics - Usage analytics")
    print("  • GET  /api/history - Analysis history")
    print("  • GET  /api/demo/models - Test all models")
    
    app.run(debug=True, host='0.0.0.0', port=5000)