"""
Local storage service for development
Simulates Firebase functionality using JSON files
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

class LocalStorageService:
    def __init__(self):
        """Initialize local storage service"""
        self.data_dir = os.path.join(os.path.dirname(__file__), 'local_data')
        self.ensure_directories()
        print("Local storage service initialized")

    def ensure_directories(self):
        """Create necessary directories"""
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Create initial files if they don't exist
        files = {
            'users.json': {},
            'products.json': {},
            'orders.json': {},
            'seller_stats.json': {},
            'buyer_stats.json': {}
        }
        
        for filename, initial_data in files.items():
            filepath = os.path.join(self.data_dir, filename)
            if not os.path.exists(filepath):
                with open(filepath, 'w') as f:
                    json.dump(initial_data, f, indent=2)

    def load_data(self, filename: str) -> Dict:
        """Load data from JSON file"""
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def save_data(self, filename: str, data: Dict) -> bool:
        """Save data to JSON file"""
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"Error saving data to {filename}: {e}")
            return False

    def create_user(self, user_id: str, user_data: Dict) -> bool:
        """Create or update user profile"""
        try:
            users = self.load_data('users.json')
            user_data.update({
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            })
            users[user_id] = user_data
            return self.save_data('users.json', users)
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            users = self.load_data('users.json')
            return users.get(user_id)
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    def create_product(self, product_data: Dict) -> str:
        """Create a new product listing"""
        try:
            products = self.load_data('products.json')
            
            # Generate unique product ID
            product_id = str(uuid.uuid4())
            
            # Add metadata
            product_data.update({
                'id': product_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'status': 'active',
                'views': 0,
                'likes': 0
            })
            
            # Save product
            products[product_id] = product_data
            self.save_data('products.json', products)
            
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
            products = self.load_data('products.json')
            product_list = list(products.values())
            
            # Apply filters
            if filters:
                if 'category' in filters:
                    product_list = [p for p in product_list if p.get('category') == filters['category']]
                if 'seller_id' in filters:
                    product_list = [p for p in product_list if p.get('seller_id') == filters['seller_id']]
                if 'status' in filters:
                    product_list = [p for p in product_list if p.get('status') == filters['status']]
            
            # Default to active products only
            if not filters or 'status' not in filters:
                product_list = [p for p in product_list if p.get('status') == 'active']
            
            # Sort by creation date (newest first)
            product_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            return product_list[:limit]
        except Exception as e:
            print(f"Error getting products: {e}")
            return []

    def create_order(self, order_data: Dict) -> str:
        """Create a new order"""
        try:
            orders = self.load_data('orders.json')
            
            # Generate unique order ID
            order_id = str(uuid.uuid4())
            
            # Add metadata
            order_data.update({
                'id': order_id,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'status': 'placed'
            })
            
            # Save order
            orders[order_id] = order_data
            self.save_data('orders.json', orders)
            
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

    def update_seller_stats(self, seller_id: str, stat_name: str, increment: float) -> bool:
        """Update seller statistics"""
        try:
            stats = self.load_data('seller_stats.json')
            
            # Get current stats or create new
            current_stats = stats.get(seller_id, {})
            
            # Update specific stat
            current_value = current_stats.get(stat_name, 0)
            new_value = current_value + increment
            
            # Calculate CO2 savings if it's a sale
            if stat_name == 'total_sold':
                # Estimate 0.5kg CO2 saved per item sold
                co2_saved = increment * 0.5
                current_co2 = current_stats.get('total_co2_saved', 0)
                current_stats['total_co2_saved'] = current_co2 + co2_saved
            
            # Update stats
            current_stats.update({
                stat_name: new_value,
                'updated_at': datetime.now().isoformat()
            })
            
            stats[seller_id] = current_stats
            return self.save_data('seller_stats.json', stats)
        except Exception as e:
            print(f"Error updating seller stats: {e}")
            return False

    def update_buyer_stats(self, buyer_id: str, stat_name: str, increment: float) -> bool:
        """Update buyer statistics"""
        try:
            stats = self.load_data('buyer_stats.json')
            
            # Get current stats or create new
            current_stats = stats.get(buyer_id, {})
            
            # Update specific stat
            current_value = current_stats.get(stat_name, 0)
            new_value = current_value + increment
            
            current_stats.update({
                stat_name: new_value,
                'updated_at': datetime.now().isoformat()
            })
            
            stats[buyer_id] = current_stats
            return self.save_data('buyer_stats.json', stats)
        except Exception as e:
            print(f"Error updating buyer stats: {e}")
            return False

    def get_seller_dashboard_data(self, seller_id: str) -> Dict:
        """Get real-time seller dashboard data"""
        try:
            stats = self.load_data('seller_stats.json')
            seller_stats = stats.get(seller_id, {})
            
            dashboard_data = {
                'products_listed': seller_stats.get('products_listed', 0),
                'total_sold': seller_stats.get('total_sold', 0),
                'revenue_earned': seller_stats.get('revenue_earned', 0),
                'total_co2_saved': seller_stats.get('total_co2_saved', 0),
                'orders_placed': seller_stats.get('total_sold', 0),  # Same as total sold
                'amount_saved': seller_stats.get('amount_saved', 0)
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
        """Get real-time buyer dashboard data"""
        try:
            stats = self.load_data('buyer_stats.json')
            buyer_stats = stats.get(buyer_id, {})
            
            dashboard_data = {
                'orders_placed': buyer_stats.get('orders_placed', 0),
                'amount_saved': buyer_stats.get('amount_saved', 0),
                'products_liked': buyer_stats.get('products_liked', 0),
                'co2_impact_reduced': buyer_stats.get('co2_impact_reduced', 0)
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

    def search_products(self, search_term: str, category: str = None, limit: int = 20) -> List[Dict]:
        """Search products by name or description"""
        try:
            products = self.get_products({'category': category} if category else None, limit * 2)
            
            search_lower = search_term.lower()
            results = []
            
            for product in products:
                # Simple text matching
                name_match = search_lower in product.get('name', '').lower()
                desc_match = search_lower in product.get('description', '').lower()
                material_match = search_lower in product.get('material', '').lower()
                
                if name_match or desc_match or material_match:
                    results.append(product)
                    if len(results) >= limit:
                        break
            
            return results
        except Exception as e:
            print(f"Error searching products: {e}")
            return []

# Global instance
local_storage_service = None

def get_local_storage_service():
    """Get or create local storage service instance"""
    global local_storage_service
    if local_storage_service is None:
        local_storage_service = LocalStorageService()
    return local_storage_service