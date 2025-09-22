#!/usr/bin/env python3
"""
Real-time Analytics and Monitoring System for CraftConnect
Provides live statistics, usage tracking, and performance monitoring
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict, deque
import threading
from dataclasses import dataclass, asdict

@dataclass
class AnalyticsEvent:
    """Analytics event data structure"""
    event_type: str
    timestamp: str
    data: Dict
    session_id: Optional[str] = None

class RealTimeAnalytics:
    """Real-time analytics and monitoring system"""
    
    def __init__(self, max_events=1000):
        self.max_events = max_events
        self.events = deque(maxlen=max_events)
        self.stats = {
            'total_requests': 0,
            'successful_analyses': 0,
            'failed_analyses': 0,
            'average_processing_time': 0.0,
            'total_processing_time': 0.0,
            'categories_frequency': defaultdict(int),
            'materials_frequency': defaultdict(int),
            'sustainability_scores': deque(maxlen=100),
            'price_categories': defaultdict(int),
            'hourly_requests': defaultdict(int),
            'unique_sessions': set()
        }
        self.performance_metrics = {
            'response_times': deque(maxlen=100),
            'memory_usage': deque(maxlen=100),
            'active_connections': 0,
            'peak_connections': 0
        }
        self.lock = threading.Lock()
        
        # Start background cleanup task
        self.cleanup_thread = threading.Thread(target=self._periodic_cleanup, daemon=True)
        self.cleanup_thread.start()
    
    def track_event(self, event_type: str, data: Dict, session_id: Optional[str] = None):
        """Track an analytics event"""
        event = AnalyticsEvent(
            event_type=event_type,
            timestamp=datetime.now().isoformat(),
            data=data,
            session_id=session_id
        )
        
        with self.lock:
            self.events.append(event)
            self._update_stats(event)
    
    def track_analysis_request(self, session_id: str, request_data: Dict):
        """Track a craft analysis request"""
        self.track_event('analysis_request', {
            'title': request_data.get('title', 'Unknown'),
            'has_price': request_data.get('price') is not None,
            'has_image': 'image' in request_data,
            'materials_count': len(request_data.get('materials', [])) if isinstance(request_data.get('materials'), list) else 0
        }, session_id)
    
    def track_analysis_success(self, session_id: str, results: Dict, processing_time: float):
        """Track successful analysis completion"""
        self.track_event('analysis_success', {
            'categories': results.get('categories', []),
            'materials': results.get('materials', []),
            'eco_impact_score': results.get('eco_impact_score', 0),
            'price_category': results.get('price_category', 'unknown'),
            'processing_time': processing_time,
            'confidence_score': results.get('confidence_scores', {}).get('overall', 0)
        }, session_id)
        
        with self.lock:
            self.stats['successful_analyses'] += 1
            self.stats['total_processing_time'] += processing_time
            self.stats['average_processing_time'] = self.stats['total_processing_time'] / max(1, self.stats['successful_analyses'])
            
            # Update category frequencies
            for category in results.get('categories', []):
                self.stats['categories_frequency'][category] += 1
            
            # Update material frequencies
            for material in results.get('materials', []):
                self.stats['materials_frequency'][material] += 1
            
            # Track sustainability scores
            eco_score = results.get('eco_impact_score', 0)
            if eco_score > 0:
                self.stats['sustainability_scores'].append(eco_score)
            
            # Track price categories
            price_cat = results.get('price_category', 'unknown')
            self.stats['price_categories'][price_cat] += 1
            
            # Track performance
            self.performance_metrics['response_times'].append(processing_time)
    
    def track_analysis_failure(self, session_id: str, error: str):
        """Track analysis failure"""
        self.track_event('analysis_failure', {
            'error': error,
            'timestamp': datetime.now().isoformat()
        }, session_id)
        
        with self.lock:
            self.stats['failed_analyses'] += 1
    
    def get_live_stats(self) -> Dict:
        """Get current live statistics"""
        with self.lock:
            current_hour = datetime.now().hour
            
            # Calculate recent activity (last hour)
            recent_events = [e for e in self.events 
                           if datetime.fromisoformat(e.timestamp) > datetime.now() - timedelta(hours=1)]
            
            # Top categories and materials
            top_categories = sorted(self.stats['categories_frequency'].items(), 
                                  key=lambda x: x[1], reverse=True)[:5]
            top_materials = sorted(self.stats['materials_frequency'].items(), 
                                 key=lambda x: x[1], reverse=True)[:5]
            
            # Average sustainability score
            avg_sustainability = (sum(self.stats['sustainability_scores']) / 
                                len(self.stats['sustainability_scores'])) if self.stats['sustainability_scores'] else 0
            
            # Performance metrics
            avg_response_time = (sum(self.performance_metrics['response_times']) / 
                               len(self.performance_metrics['response_times'])) if self.performance_metrics['response_times'] else 0
            
            return {
                'overview': {
                    'total_requests': self.stats['total_requests'],
                    'successful_analyses': self.stats['successful_analyses'],
                    'failed_analyses': self.stats['failed_analyses'],
                    'success_rate': (self.stats['successful_analyses'] / 
                                   max(1, self.stats['total_requests'])) * 100,
                    'average_processing_time': round(self.stats['average_processing_time'], 3),
                    'unique_sessions': len(self.stats['unique_sessions'])
                },
                'recent_activity': {
                    'events_last_hour': len(recent_events),
                    'current_hour_requests': self.stats['hourly_requests'][current_hour]
                },
                'insights': {
                    'top_categories': top_categories,
                    'top_materials': top_materials,
                    'average_sustainability_score': round(avg_sustainability, 2),
                    'price_category_distribution': dict(self.stats['price_categories'])
                },
                'performance': {
                    'average_response_time': round(avg_response_time, 3),
                    'active_connections': self.performance_metrics['active_connections'],
                    'peak_connections': self.performance_metrics['peak_connections']
                },
                'timestamp': datetime.now().isoformat()
            }
    
    def get_trends(self, hours: int = 24) -> Dict:
        """Get trending data for specified hours"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Filter recent events
        recent_events = [e for e in self.events 
                        if datetime.fromisoformat(e.timestamp) > cutoff_time]
        
        # Group by hour
        hourly_data = defaultdict(lambda: {'requests': 0, 'successes': 0, 'failures': 0})
        
        for event in recent_events:
            event_time = datetime.fromisoformat(event.timestamp)
            hour_key = event_time.strftime('%Y-%m-%d-%H')
            
            if event.event_type == 'analysis_request':
                hourly_data[hour_key]['requests'] += 1
            elif event.event_type == 'analysis_success':
                hourly_data[hour_key]['successes'] += 1
            elif event.event_type == 'analysis_failure':
                hourly_data[hour_key]['failures'] += 1
        
        # Convert to list format for charting
        trend_data = []
        for hour_key, data in sorted(hourly_data.items()):
            trend_data.append({
                'hour': hour_key,
                'requests': data['requests'],
                'successes': data['successes'],
                'failures': data['failures'],
                'success_rate': (data['successes'] / max(1, data['requests'])) * 100
            })
        
        return {
            'hourly_trends': trend_data,
            'period_hours': hours,
            'total_events': len(recent_events),
            'generated_at': datetime.now().isoformat()
        }
    
    def _update_stats(self, event: AnalyticsEvent):
        """Update internal statistics (called with lock held)"""
        self.stats['total_requests'] += 1
        
        # Track unique sessions
        if event.session_id:
            self.stats['unique_sessions'].add(event.session_id)
        
        # Track hourly requests
        event_time = datetime.fromisoformat(event.timestamp)
        hour_key = event_time.hour
        self.stats['hourly_requests'][hour_key] += 1
    
    def _periodic_cleanup(self):
        """Background task to clean up old data"""
        while True:
            time.sleep(3600)  # Run every hour
            
            with self.lock:
                # Clean up old hourly data (keep only last 48 hours)
                current_time = datetime.now()
                cutoff_time = current_time - timedelta(hours=48)
                
                # Reset hourly requests for old hours
                hours_to_remove = []
                for hour_key in self.stats['hourly_requests']:
                    if hour_key < cutoff_time.hour:
                        hours_to_remove.append(hour_key)
                
                for hour_key in hours_to_remove:
                    del self.stats['hourly_requests'][hour_key]
                
                # Clean up unique sessions periodically (keep only recent)
                if len(self.stats['unique_sessions']) > 1000:
                    # Convert to list, keep most recent 500
                    recent_sessions = list(self.stats['unique_sessions'])[-500:]
                    self.stats['unique_sessions'] = set(recent_sessions)

# Global analytics instance
analytics = RealTimeAnalytics()

def get_analytics_instance():
    """Get the global analytics instance"""
    return analytics

class PerformanceMonitor:
    """Performance monitoring utilities"""
    
    @staticmethod
    def track_processing_time(func):
        """Decorator to track function processing time"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                end_time = time.time()
                processing_time = end_time - start_time
                
                # Track in analytics if available
                analytics.performance_metrics['response_times'].append(processing_time)
                
                return result
            except Exception as e:
                end_time = time.time()
                processing_time = end_time - start_time
                
                # Track failure time
                analytics.performance_metrics['response_times'].append(processing_time)
                
                raise e
        return wrapper

def demo_analytics():
    """Demo the analytics system"""
    print("=== CraftConnect Real-Time Analytics Demo ===")
    print()
    
    # Simulate some events
    analytics = get_analytics_instance()
    
    # Simulate analysis requests
    for i in range(10):
        session_id = f"demo_session_{i}"
        
        # Track request
        analytics.track_analysis_request(session_id, {
            'title': f'Demo Product {i}',
            'has_price': i % 2 == 0,
            'has_image': i % 3 == 0,
            'materials_count': i % 4
        })
        
        # Simulate processing time
        processing_time = 0.1 + (i * 0.05)
        
        if i % 8 != 0:  # 87.5% success rate
            # Track success
            analytics.track_analysis_success(session_id, {
                'categories': ['jewelry', 'textiles'][i % 2:i % 2 + 1],
                'materials': ['wood', 'metal', 'fabric'][i % 3:i % 3 + 1],
                'eco_impact_score': 0.6 + (i * 0.05) % 0.4,
                'price_category': ['budget', 'mid_range', 'premium'][i % 3],
                'confidence_scores': {'overall': 0.7 + (i * 0.03) % 0.3}
            }, processing_time)
        else:
            # Track failure
            analytics.track_analysis_failure(session_id, f"Demo error {i}")
        
        time.sleep(0.1)  # Small delay
    
    # Display stats
    stats = analytics.get_live_stats()
    
    print("Live Statistics:")
    print(f"  Total Requests: {stats['overview']['total_requests']}")
    print(f"  Success Rate: {stats['overview']['success_rate']:.1f}%")
    print(f"  Average Processing Time: {stats['overview']['average_processing_time']:.3f}s")
    print(f"  Unique Sessions: {stats['overview']['unique_sessions']}")
    print()
    
    print("Top Categories:")
    for category, count in stats['insights']['top_categories']:
        print(f"  {category}: {count}")
    print()
    
    print("Performance Metrics:")
    print(f"  Average Response Time: {stats['performance']['average_response_time']:.3f}s")
    print(f"  Active Connections: {stats['performance']['active_connections']}")
    print()
    
    # Show trends
    trends = analytics.get_trends(24)
    print(f"Trends (last 24 hours): {len(trends['hourly_trends'])} data points")
    print(f"Total Events: {trends['total_events']}")

if __name__ == "__main__":
    demo_analytics()