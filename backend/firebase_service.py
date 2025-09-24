"""
Firebase service for CraftConnect backend
Handles real-time data storage and retrieval
"""

import os
import json
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import firebase_admin
from firebase_admin import credentials, firestore, storage
from google.cloud.firestore_v1.base_query import FieldFilter

class FirebaseService:
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app is already initialized
            firebase_admin.get_app()
        except ValueError:
            # Initialize Firebase app without authentication
            # Use default credentials or mock certificate for development
            try:
                # For development, create a mock certificate
                import json
                import tempfile
                
                # Create minimal service account for development
                mock_service_account = {
                    "type": "service_account",
                    "project_id": "craftconnect-9813f",
                    "private_key_id": "mock-key-id",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB\nMockKey...\n-----END PRIVATE KEY-----\n",
                    "client_email": "firebase-adminsdk@craftconnect-9813f.iam.gserviceaccount.com",
                    "client_id": "mock-client-id",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
                
                # Create temporary file with mock credentials
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                    json.dump(mock_service_account, f)
                    temp_cred_path = f.name
                
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_cred_path
                
                # Initialize with mock credentials
                cred = credentials.Certificate(temp_cred_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': 'craftconnect-9813f'
                })
                
            except Exception as e:
                print(f"Firebase initialization with mock credentials failed: {e}")
                # Fallback: Initialize with project ID only
                try:
                    firebase_admin.initialize_app(options={
                        'projectId': 'craftconnect-9813f'
                    })
                except Exception as e2:
                    print(f"Firebase fallback initialization failed: {e2}")
                    # For development, we'll use local storage simulation
                    self.use_local_storage = True
                    self.db = None
                    print("Using local storage simulation instead of Firebase")
                    return
        
        self.db = firestore.client()
        print("Firebase service initialized successfully")

    def create_user(self, user_id: str, user_data: Dict) -> bool:
        """Create or update user profile"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            user_ref.set(user_data, merge=True)
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            doc = user_ref.get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    def create_product(self, product_data: Dict) -> str:
        """Create a new product listing"""
        try:
            # Generate unique product ID
            product_ref = self.db.collection('products').document()
            product_id = product_ref.id
            
            # Add metadata
            product_data.update({
                'id': product_id,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'active',
                'views': 0,
                'likes': 0
            })
            
            # Save product
            product_ref.set(product_data)
            
            # Update seller's product count
            if 'seller_id' in product_data:
                self.update_seller_stats(product_data['seller_id'], 'products_listed', 1)
            
            return product_id
        except Exception as e:
            print(f"Error creating product: {e}")
            return ""

    def get_products(self, filters: Dict = None, limit: int = 50) -> List[Dict]:
        """Get products with optional filtering"""
        try:
            query = self.db.collection('products')
            
            # Apply filters
            if filters:
                if 'category' in filters:
                    query = query.where(filter=FieldFilter('category', '==', filters['category']))
                if 'seller_id' in filters:
                    query = query.where(filter=FieldFilter('seller_id', '==', filters['seller_id']))
                if 'status' in filters:
                    query = query.where(filter=FieldFilter('status', '==', filters['status']))
            
            # Default to active products only
            if not filters or 'status' not in filters:
                query = query.where(filter=FieldFilter('status', '==', 'active'))
            
            # Order by creation date (newest first)
            query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            products = []
            for doc in docs:
                product = doc.to_dict()
                product['id'] = doc.id
                products.append(product)
            
            return products
        except Exception as e:
            print(f"Error getting products: {e}")
            return []

    def create_order(self, order_data: Dict) -> str:
        """Create a new order"""
        try:
            # Generate unique order ID
            order_ref = self.db.collection('orders').document()
            order_id = order_ref.id
            
            # Add metadata
            order_data.update({
                'id': order_id,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'placed'
            })
            
            # Save order
            order_ref.set(order_data)
            
            # Update analytics
            if 'seller_id' in order_data:
                self.update_seller_stats(order_data['seller_id'], 'total_sold', 1)
                if 'total_amount' in order_data:
                    self.update_seller_stats(order_data['seller_id'], 'revenue_earned', order_data['total_amount'])
            
            if 'buyer_id' in order_data:
                self.update_buyer_stats(order_data['buyer_id'], 'orders_placed', 1)
                if 'total_amount' in order_data:
                    self.update_buyer_stats(order_data['buyer_id'], 'amount_saved', order_data.get('amount_saved', 0))
            
            return order_id
        except Exception as e:
            print(f"Error creating order: {e}")
            return ""

    def get_orders(self, filters: Dict = None, limit: int = 50) -> List[Dict]:
        """Get orders with optional filtering"""
        try:
            query = self.db.collection('orders')
            
            # Apply filters
            if filters:
                if 'seller_id' in filters:
                    query = query.where(filter=FieldFilter('seller_id', '==', filters['seller_id']))
                if 'buyer_id' in filters:
                    query = query.where(filter=FieldFilter('buyer_id', '==', filters['buyer_id']))
                if 'status' in filters:
                    query = query.where(filter=FieldFilter('status', '==', filters['status']))
            
            # Order by creation date (newest first)
            query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
            query = query.limit(limit)
            
            docs = query.stream()
            orders = []
            for doc in docs:
                order = doc.to_dict()
                order['id'] = doc.id
                orders.append(order)
            
            return orders
        except Exception as e:
            print(f"Error getting orders: {e}")
            return []

    def update_seller_stats(self, seller_id: str, stat_name: str, increment: float) -> bool:
        """Update seller statistics"""
        try:
            stats_ref = self.db.collection('seller_stats').document(seller_id)
            
            # Get current stats or create new
            doc = stats_ref.get()
            current_stats = doc.to_dict() if doc.exists else {}
            
            # Update specific stat
            current_value = current_stats.get(stat_name, 0)
            new_value = current_value + increment
            
            # Calculate CO2 savings if it's a sale
            co2_saved = 0
            if stat_name == 'total_sold':
                # Estimate 0.5kg CO2 saved per item sold (this can be more accurate based on actual product data)
                co2_saved = increment * 0.5
                current_co2 = current_stats.get('total_co2_saved', 0)
                current_stats['total_co2_saved'] = current_co2 + co2_saved
            
            # Update stats
            current_stats.update({
                stat_name: new_value,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            stats_ref.set(current_stats, merge=True)
            return True
        except Exception as e:
            print(f"Error updating seller stats: {e}")
            return False

    def update_buyer_stats(self, buyer_id: str, stat_name: str, increment: float) -> bool:
        """Update buyer statistics"""
        try:
            stats_ref = self.db.collection('buyer_stats').document(buyer_id)
            
            # Get current stats or create new
            doc = stats_ref.get()
            current_stats = doc.to_dict() if doc.exists else {}
            
            # Update specific stat
            current_value = current_stats.get(stat_name, 0)
            new_value = current_value + increment
            
            current_stats.update({
                stat_name: new_value,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            stats_ref.set(current_stats, merge=True)
            return True
        except Exception as e:
            print(f"Error updating buyer stats: {e}")
            return False

    def get_seller_dashboard_data(self, seller_id: str) -> Dict:
        """Get real-time seller dashboard data"""
        try:
            # Get seller stats
            stats_ref = self.db.collection('seller_stats').document(seller_id)
            stats_doc = stats_ref.get()
            stats = stats_doc.to_dict() if stats_doc.exists else {}
            
            # Get current month revenue (optional: implement date filtering)
            current_month_revenue = stats.get('revenue_earned', 0)
            
            dashboard_data = {
                'products_listed': stats.get('products_listed', 0),
                'total_sold': stats.get('total_sold', 0),
                'revenue_earned': current_month_revenue,
                'total_co2_saved': stats.get('total_co2_saved', 0),
                'orders_placed': stats.get('total_sold', 0),  # Same as total sold
                'amount_saved': stats.get('amount_saved', 0)
            }
            
            return dashboard_data
        except Exception as e:
            print(f"Error getting seller dashboard data: {e}")
            return {
                'products_listed': 0,
                'total_sold': 0,
                'revenue_earned': 0,
                'total_co2_saved': 0,
                'orders_placed': 0,
                'amount_saved': 0
            }

    def get_buyer_dashboard_data(self, buyer_id: str) -> Dict:
        """Get real-time buyer dashboard data with dynamic calculations"""
        try:
            # Get buyer stats
            stats_ref = self.db.collection('buyer_stats').document(buyer_id)
            stats_doc = stats_ref.get()
            stats = stats_doc.to_dict() if stats_doc.exists else {}
            
            # Get all orders for this buyer to calculate dynamic values
            orders = self.get_orders({'buyer_id': buyer_id}, limit=1000)  # Get all orders
            
            # Calculate totals from orders
            total_orders = len(orders)
            total_amount_saved = sum(order.get('amount_saved', 0) for order in orders)
            total_co2_saved = sum(order.get('co2_saved', 0) for order in orders)  # Assuming co2_saved is stored in orders
            
            dashboard_data = {
                'orders_placed': total_orders,
                'amount_saved': total_amount_saved,
                'products_liked': stats.get('products_liked', 0),
                'co2_impact_reduced': total_co2_saved
            }
            
            return dashboard_data
        except Exception as e:
            print(f"Error getting buyer dashboard data: {e}")
            return {
                'orders_placed': 0,
                'amount_saved': 0,
                'products_liked': 0,
                'co2_impact_reduced': 0
            }

    def save_image_as_base64(self, image_base64: str, filename: str) -> str:
        """Save base64 image and return URL (simplified for now)"""
        try:
            # In a real implementation, you'd upload to Firebase Storage
            # For now, we'll just return the base64 data
            return image_base64
        except Exception as e:
            print(f"Error saving image: {e}")
            return ""

    def get_marketplace_products(self, category: str = None, limit: int = 20) -> List[Dict]:
        """Get products for marketplace display"""
        filters = {}
        if category:
            filters['category'] = category
        
        return self.get_products(filters, limit)

    def search_products(self, search_term: str, category: str = None, limit: int = 20) -> List[Dict]:
        """Search products by name or description"""
        try:
            # Note: Firestore doesn't have full-text search
            # This is a simplified implementation
            # In production, use Algolia or Elasticsearch
            
            query = self.db.collection('products')
            query = query.where(filter=FieldFilter('status', '==', 'active'))
            
            if category:
                query = query.where(filter=FieldFilter('category', '==', category))
            
            query = query.limit(limit * 2)  # Get more results to filter
            
            docs = query.stream()
            products = []
            search_lower = search_term.lower()
            
            for doc in docs:
                product = doc.to_dict()
                product['id'] = doc.id
                
                # Simple text matching
                name_match = search_lower in product.get('name', '').lower()
                desc_match = search_lower in product.get('description', '').lower()
                material_match = search_lower in product.get('material', '').lower()
                
                if name_match or desc_match or material_match:
                    products.append(product)
                    if len(products) >= limit:
                        break
            
            return products
        except Exception as e:
            print(f"Error searching products: {e}")
            return []

# Global instance
firebase_service = None

def get_firebase_service():
    """Get or create Firebase service instance"""
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseService()
    return firebase_service