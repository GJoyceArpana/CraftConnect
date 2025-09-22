#!/usr/bin/env python3
"""
Demo Flask API for CraftConnect Advanced Features
Works without advanced ML dependencies for demonstration
"""

import os
import json
import uuid
import sqlite3
from datetime import datetime
from typing import Dict, List, Any
import logging
import random
import numpy as np

# Flask imports
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config.update({
    'SECRET_KEY': 'demo-secret-key',
    'UPLOAD_FOLDER': 'uploads/',
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB max file size
    'ALLOWED_EXTENSIONS': {'png', 'jpg', 'jpeg', 'gif', 'webp'}
})

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Mock analytics data
analytics_data = {
    'total_requests': 42,
    'successful_analyses': 38,
    'failed_analyses': 4,
    'average_processing_time': 2.3,
    'recent_requests': []
}

class DemoAdvancedAnalyzer:
    """Demo analyzer that simulates advanced ML models"""
    
    def __init__(self):
        logger.info("Initializing Demo Advanced Analyzer...")
        
        # Indian craft categories
        self.craft_categories = [
            "madhubani painting", "warli art", "dhokra sculpture", "chikankari embroidery",
            "bandhani tie dye", "blue pottery", "kantha embroidery", "phulkari embroidery",
            "block print textile", "handwoven fabric", "brass metalwork", "silver jewelry",
            "wooden carving", "stone sculpture", "terracotta pottery", "bamboo craft",
            "jute handicraft", "coconut craft", "palm leaf art", "organic textile"
        ]
        
        # Sustainability keywords
        self.sustainability_keywords = [
            "organic materials", "recycled materials", "natural dyes", "handmade craft",
            "eco friendly", "sustainable production", "zero waste", "biodegradable",
            "fair trade", "locally sourced", "traditional methods", "renewable materials"
        ]
        
        logger.info("Demo analyzer ready!")
    
    def comprehensive_analysis(self, product_data: Dict[str, Any], image_path: str = None) -> Dict[str, Any]:
        """Mock comprehensive analysis"""
        
        # Simulate processing time
        import time
        time.sleep(0.5)  # Simulate AI processing
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'analysis_version': 'demo_v1.0'
        }
        
        # Mock image analysis
        if image_path:
            results['image_analysis'] = self.mock_image_analysis()
        
        # Mock pricing analysis
        results['pricing_analysis'] = self.mock_pricing_analysis(product_data)
        
        # Mock sustainability analysis
        results['sustainability_analysis'] = self.mock_sustainability_analysis(product_data)
        
        return results
    
    def mock_image_analysis(self) -> Dict[str, Any]:
        """Mock CLIP and MobileNet analysis"""
        
        # Mock CLIP results
        clip_results = {
            'categories': [
                {'label': random.choice(self.craft_categories), 'confidence': round(random.uniform(0.7, 0.95), 3), 'score': round(random.uniform(0.7, 0.95), 3)},
                {'label': random.choice(self.craft_categories), 'confidence': round(random.uniform(0.6, 0.8), 3), 'score': round(random.uniform(0.6, 0.8), 3)},
                {'label': random.choice(self.craft_categories), 'confidence': round(random.uniform(0.5, 0.7), 3), 'score': round(random.uniform(0.5, 0.7), 3)}
            ],
            'sustainability_features': [
                {'label': random.choice(self.sustainability_keywords), 'confidence': round(random.uniform(0.6, 0.9), 3), 'score': round(random.uniform(0.6, 0.9), 3)},
                {'label': random.choice(self.sustainability_keywords), 'confidence': round(random.uniform(0.5, 0.8), 3), 'score': round(random.uniform(0.5, 0.8), 3)}
            ],
            'analysis_method': 'CLIP_DEMO',
            'confidence': round(random.uniform(0.75, 0.92), 3)
        }
        
        # Mock MobileNet results
        mobilenet_results = {
            'predictions': [
                {'craft_category': 'textiles', 'confidence': round(random.uniform(0.7, 0.9), 3), 'original_label': 'fabric'},
                {'craft_category': 'pottery', 'confidence': round(random.uniform(0.6, 0.8), 3), 'original_label': 'ceramic bowl'},
                {'craft_category': 'jewelry', 'confidence': round(random.uniform(0.5, 0.7), 3), 'original_label': 'necklace'}
            ],
            'analysis_method': 'MobileNet_DEMO',
            'raw_predictions': [
                {'label': 'fabric, cloth, material', 'score': round(random.uniform(0.7, 0.9), 3)},
                {'label': 'pottery, ceramic', 'score': round(random.uniform(0.6, 0.8), 3)}
            ]
        }
        
        return {
            'clip_analysis': clip_results,
            'mobilenet_analysis': mobilenet_results
        }
    
    def mock_pricing_analysis(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock XGBoost pricing prediction"""
        
        # Base price calculation
        base_prices = {
            'paintings': 2000, 'textiles': 1500, 'pottery': 800,
            'jewelry': 3000, 'woodwork': 1200, 'metalwork': 2500,
            'sculpture': 4000, 'handicraft': 1000
        }
        
        category = product_data.get('category', 'handicraft')
        base_price = base_prices.get(category, 1500)
        
        # Add some variation
        multiplier = random.uniform(0.7, 1.5)
        predicted_price = base_price * multiplier
        
        # Mock confidence based on how close to base price
        confidence = max(0.6, 1 - abs(multiplier - 1) * 0.5)
        
        return {
            'predicted_price': round(predicted_price),
            'confidence': round(confidence, 2),
            'price_range': {
                'min': round(predicted_price * 0.8),
                'max': round(predicted_price * 1.2)
            },
            'individual_predictions': {
                'xgboost': round(predicted_price * random.uniform(0.95, 1.05)),
                'random_forest': round(predicted_price * random.uniform(0.95, 1.05))
            }
        }
    
    def mock_sustainability_analysis(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock sustainability analysis"""
        
        # Mock CO2 analysis
        co2_kg = round(random.uniform(0.5, 8.0), 2)
        co2_analysis = {
            'total_co2_kg': co2_kg,
            'co2_per_kg': round(co2_kg / random.uniform(0.5, 2.0), 2),
            'material_breakdown': {
                'organic_cotton': round(random.uniform(0.2, 2.0), 2),
                'natural_dyes': round(random.uniform(0.1, 1.0), 2)
            },
            'transport_factor': round(random.uniform(1.1, 1.4), 1),
            'carbon_category': self.categorize_carbon_impact(co2_kg)
        }
        
        # Mock waste analysis
        waste_score = round(random.uniform(0.4, 0.9), 2)
        waste_analysis = {
            'waste_score': waste_score,
            'method_factor': round(random.uniform(0.1, 0.5), 1),
            'efficiency_bonus': round(random.uniform(0.2, 0.6), 1),
            'waste_category': self.categorize_waste_impact(1 - waste_score)
        }
        
        # Overall sustainability score
        overall_score = round(random.uniform(0.5, 0.9), 2)
        
        # Generate recommendations
        recommendations = [
            "🌱 Consider using more eco-friendly materials to reduce carbon footprint",
            "📍 Source materials locally to reduce transportation emissions",
            "♻️ Implement zero-waste production techniques",
            "🌿 Add organic or recycled materials to improve sustainability",
            "🏆 Eligible for sustainability certification - highlight this in marketing"
        ]
        
        return {
            'co2_analysis': co2_analysis,
            'waste_analysis': waste_analysis,
            'overall_sustainability_score': overall_score,
            'sustainability_grade': self.get_grade(overall_score),
            'recommendations': random.sample(recommendations, 3),
            'certification_eligible': overall_score > 0.7
        }
    
    def categorize_carbon_impact(self, co2_kg: float) -> str:
        """Categorize carbon impact"""
        if co2_kg < 1:
            return "Very Low"
        elif co2_kg < 3:
            return "Low"
        elif co2_kg < 6:
            return "Medium"
        elif co2_kg < 10:
            return "High"
        else:
            return "Very High"
    
    def categorize_waste_impact(self, waste_score: float) -> str:
        """Categorize waste impact"""
        if waste_score < 0.3:
            return "Minimal Waste"
        elif waste_score < 0.6:
            return "Low Waste"
        elif waste_score < 1.0:
            return "Medium Waste"
        else:
            return "High Waste"
    
    def get_grade(self, score: float) -> str:
        """Get sustainability grade"""
        if score >= 0.9:
            return "A+"
        elif score >= 0.8:
            return "A"
        elif score >= 0.7:
            return "B+"
        elif score >= 0.6:
            return "B"
        elif score >= 0.5:
            return "C+"
        elif score >= 0.4:
            return "C"
        else:
            return "D"

# Initialize demo analyzer
demo_analyzer = DemoAdvancedAnalyzer()

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
        'models_available': True,  # Demo mode
        'advanced_analyzer_ready': True,
        'demo_mode': True
    })

@app.route('/api/analyze/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """Comprehensive analysis endpoint using demo models"""
    start_time = datetime.now()
    analysis_id = str(uuid.uuid4())
    
    try:
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
        results = demo_analyzer.comprehensive_analysis(product_data, image_path)
        
        # Add metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'analysis_id': analysis_id,
            'processing_time': processing_time,
            'product_title': product_data['title'],
            'category': product_data['category'],
            'image_path': image_path,
            'demo_mode': True
        })
        
        # Track analytics
        track_request('comprehensive_analysis', True, processing_time, {
            'has_image': image_path is not None,
            'category': product_data['category']
        })
        
        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'results': results,
            'demo_mode': True
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        error_msg = str(e)
        
        # Track failed request
        track_request('comprehensive_analysis', False, processing_time, {
            'error': error_msg
        })
        
        logger.error(f"Comprehensive analysis failed: {e}")
        
        return jsonify({
            'success': False,
            'error': error_msg,
            'analysis_id': analysis_id,
            'demo_mode': True
        }), 500

@app.route('/api/analyze/image', methods=['POST'])
def analyze_image():
    """Image analysis endpoint demo"""
    start_time = datetime.now()
    analysis_id = str(uuid.uuid4())
    
    try:
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
        
        # Mock image analysis
        image_analysis = demo_analyzer.mock_image_analysis()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        results = {
            'analysis_id': analysis_id,
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time,
            'image_path': image_path,
            **image_analysis,
            'demo_mode': True
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
    """Pricing analysis endpoint demo"""
    start_time = datetime.now()
    
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")
        
        # Mock pricing prediction
        results = demo_analyzer.mock_pricing_analysis(data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time,
            'demo_mode': True
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
    """Sustainability analysis endpoint demo"""
    start_time = datetime.now()
    
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("No data provided")
        
        # Mock sustainability analysis
        results = demo_analyzer.mock_sustainability_analysis(data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        results.update({
            'timestamp': datetime.now().isoformat(),
            'processing_time': processing_time,
            'demo_mode': True
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
        'analytics': analytics_data,
        'demo_mode': True
    })

@app.route('/api/demo/models')
def demo_models():
    """Demo endpoint to test all models"""
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
        results = demo_analyzer.comprehensive_analysis(sample_product)
        return jsonify({
            'success': True,
            'demo_results': results,
            'sample_product': sample_product,
            'demo_mode': True
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

if __name__ == '__main__':
    # Run the demo app
    print("🚀 Starting CraftConnect Advanced API Demo Server...")
    print("🎯 DEMO MODE - Simulated ML Models")
    print("📊 Available endpoints:")
    print("  • POST /api/analyze/comprehensive - Full product analysis (DEMO)")
    print("  • POST /api/analyze/image - Image analysis with simulated CLIP & MobileNet")
    print("  • POST /api/analyze/pricing - Simulated XGBoost pricing prediction")
    print("  • POST /api/analyze/sustainability - Simulated sustainability analysis")
    print("  • GET  /api/analytics - Usage analytics")
    print("  • GET  /api/demo/models - Test all models")
    print("  • GET  /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)