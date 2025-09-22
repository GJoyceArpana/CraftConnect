#!/usr/bin/env python3
"""
Flask Web API for CraftConnect Auto-Tagging System
"""

from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename
import json
import os
from ml.api import get_api, CraftConnectAPI

app = Flask(__name__)

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the auto-tagging API
craft_api = get_api()

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/products/upload', methods=['POST'])
def upload_product():
    """
    Upload and auto-tag a craft product
    
    Expects JSON data with the following structure:
    {
        "title": "Product title",
        "description": "Product description",
        "price": 29.99,  // optional
        "artisan": "Artisan name",  // optional
        "location": "Location",  // optional
        "materials": "Materials used"  // optional
    }
    
    Returns:
    {
        "success": true,
        "product": {
            // original product data
        },
        "tags": {
            "categories": [...],
            "materials": [...],
            "sustainability_tags": [...],
            "eco_impact_score": 0.85,
            "price_category": "medium",
            "extracted_features": [...],
            "confidence_scores": {...}
        }
    }
    """
    try:
        # Check if request contains JSON data
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
            
        if not data.get('description'):
            return jsonify({
                'success': False,
                'error': 'Description is required'
            }), 400
        
        # Extract product data
        product_data = {
            'title': data['title'],
            'description': data['description'],
            'price': data.get('price'),
            'artisan': data.get('artisan'),
            'location': data.get('location'),
            'materials': data.get('materials')
        }
        
        # Generate tags using the auto-tagging system
        tags = craft_api.tag_craft_from_dict(product_data)
        
        # Return success response
        return jsonify({
            'success': True,
            'product': product_data,
            'tags': tags
        }), 200
        
    except BadRequest:
        return jsonify({
            'success': False,
            'error': 'Invalid JSON data'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/products/upload/form', methods=['POST'])
def upload_product_with_file():
    """
    Upload a craft product with form-data and optional image file
    
    Expects form-data with the following fields:
    - title (required): Product title
    - description (required): Product description
    - price (optional): Product price
    - artisan (optional): Artisan name
    - location (optional): Location
    - materials (optional): Materials used
    - image (optional): Image file
    
    Returns JSON with product data, tags, and image info
    """
    try:
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        price = request.form.get('price')
        artisan = request.form.get('artisan')
        location = request.form.get('location')
        materials = request.form.get('materials')
        
        # Validate required fields
        if not title:
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
            
        if not description:
            return jsonify({
                'success': False,
                'error': 'Description is required'
            }), 400
        
        # Handle file upload
        image_info = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                if allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Add timestamp to avoid filename conflicts
                    import time
                    timestamp = str(int(time.time()))
                    name, ext = os.path.splitext(filename)
                    filename = f"{name}_{timestamp}{ext}"
                    
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(filepath)
                    
                    image_info = {
                        'filename': filename,
                        'original_filename': file.filename,
                        'filepath': filepath,
                        'size': os.path.getsize(filepath)
                    }
                else:
                    return jsonify({
                        'success': False,
                        'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
                    }), 400
        
        # Convert price to float if provided
        try:
            price = float(price) if price else None
        except (ValueError, TypeError):
            price = None
        
        # Extract product data
        product_data = {
            'title': title,
            'description': description,
            'price': price,
            'artisan': artisan,
            'location': location,
            'materials': materials
        }
        
        # Generate tags using the auto-tagging system
        tags = craft_api.tag_craft_from_dict(product_data)
        
        # Return success response
        response = {
            'success': True,
            'product': product_data,
            'tags': tags
        }
        
        if image_info:
            response['image'] = image_info
            
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/products/upload/simple', methods=['POST'])
def upload_product_simple():
    """
    Simplified product upload endpoint for basic use cases
    
    Expects JSON data:
    {
        "title": "Product title",
        "description": "Product description",
        "price": 29.99  // optional
    }
    """
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must contain JSON data'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
            
        if not data.get('description'):
            return jsonify({
                'success': False,
                'error': 'Description is required'
            }), 400
        
        # Generate tags using simple tagging
        tags = craft_api.tag_craft_simple(
            title=data['title'],
            description=data['description'],
            price=data.get('price')
        )
        
        return jsonify({
            'success': True,
            'product': {
                'title': data['title'],
                'description': data['description'],
                'price': data.get('price')
            },
            'tags': tags
        }), 200
        
    except BadRequest:
        return jsonify({
            'success': False,
            'error': 'Invalid JSON data'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CraftConnect Auto-Tagging API'
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'error': 'Method not allowed'
    }), 405

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)