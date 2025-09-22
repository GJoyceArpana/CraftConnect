#!/usr/bin/env python3
"""
Indian Craft Specialization Module
Provides insights into regional craft specialties and traditional techniques
"""

from typing import Dict, List, Optional, Tuple
import re

class IndianCraftSpecialist:
    """Specialized analyzer for Indian crafts and regional expertise"""
    
    def __init__(self):
        # Indian regional craft specialties
        self.regional_specialties = {
            # North India
            'kashmir': ['pashmina', 'paper mache', 'walnut wood', 'carpet', 'shawl'],
            'rajasthan': ['blue pottery', 'bandhani', 'leheriya', 'miniature painting', 'mirror work', 'camel leather'],
            'uttar pradesh': ['chikankari', 'zardozi', 'carpet', 'brass work', 'pottery'],
            'punjab': ['phulkari', 'juti', 'wooden toys', 'handicrafts'],
            'haryana': ['durrie', 'pottery', 'woodwork'],
            
            # West India
            'gujarat': ['bandhani', 'patola', 'kutch embroidery', 'mirror work', 'beadwork'],
            'maharashtra': ['warli painting', 'kolhapuri chappals', 'paithani'],
            'goa': ['coconut shell crafts', 'bamboo work'],
            
            # South India
            'karnataka': ['mysore silk', 'sandalwood', 'rosewood', 'channapatna toys'],
            'kerala': ['coir products', 'coconut shell', 'kathakali masks', 'boat models'],
            'tamil nadu': ['tanjore painting', 'kanchipuram silk', 'bronze work', 'stone carving'],
            'andhra pradesh': ['kalamkari', 'bidriware', 'nirmal toys'],
            
            # East India
            'west bengal': ['kantha', 'terracotta', 'jute products', 'conch shell'],
            'odisha': ['pattachitra', 'stone carving', 'silver filigree', 'palm leaf'],
            'bihar': ['madhubani painting', 'sikki grass', 'applique work'],
            'jharkhand': ['dokra', 'bamboo crafts'],
            'assam': ['silk weaving', 'bamboo crafts', 'cane work'],
            
            # Central India
            'madhya pradesh': ['gond painting', 'batik', 'chanderi silk'],
            'chhattisgarh': ['dhokra art', 'bamboo crafts', 'terracotta'],
        }
        
        # Traditional techniques
        self.traditional_techniques = {
            'textile_techniques': [
                'chikankari', 'zardozi', 'phulkari', 'kantha', 'bandhani', 'leheriya',
                'patola', 'kalamkari', 'block printing', 'tie-dye', 'mirror work'
            ],
            'painting_techniques': [
                'madhubani', 'warli', 'pattachitra', 'tanjore', 'gond', 'phad',
                'kalamkari', 'miniature painting'
            ],
            'metalwork_techniques': [
                'dhokra', 'bidriware', 'brass work', 'bell metal', 'silver filigree',
                'bronze casting', 'repousse work'
            ],
            'woodwork_techniques': [
                'sandalwood carving', 'rosewood inlay', 'sheesham work',
                'walnut carving', 'channapatna lacquerware'
            ]
        }
        
        # Sustainability factors specific to India
        self.indian_sustainability = {
            'natural_materials': ['bamboo', 'jute', 'coir', 'palm leaf', 'banana fiber', 'water hyacinth'],
            'organic_dyes': ['turmeric', 'indigo', 'madder', 'pomegranate', 'marigold'],
            'eco_processes': ['natural fermentation', 'sun drying', 'hand spinning', 'organic farming'],
            'zero_waste': ['complete utilization', 'by-product usage', 'minimal waste'],
            'traditional_methods': ['age-old techniques', 'ancestral knowledge', 'generational skills']
        }
        
        # Festival and seasonal relevance
        self.seasonal_crafts = {
            'diwali': ['diyas', 'rangoli', 'decorative items', 'lights', 'lamps'],
            'holi': ['colors', 'pichkari', 'festive wear', 'decorations'],
            'navratri': ['chaniya choli', 'garba accessories', 'decorative items'],
            'karva_chauth': ['decorated plates', 'sieves', 'traditional wear'],
            'raksha_bandhan': ['rakhi', 'decorative threads', 'gift items'],
            'durga_puja': ['pandal decorations', 'clay idols', 'traditional items'],
            'wedding_season': ['bridal wear', 'jewelry', 'decorative items', 'trousseau']
        }
    
    def identify_regional_specialty(self, title: str, description: str, location: str = None) -> Dict[str, any]:
        """Identify regional craft specialty and authenticity"""
        text = f"{title} {description}".lower()
        if location:
            text += f" {location}".lower()
        
        identified_regions = []
        specialty_scores = {}
        
        for region, specialties in self.regional_specialties.items():
            score = 0
            matched_specialties = []
            
            for specialty in specialties:
                if specialty in text:
                    score += 1
                    matched_specialties.append(specialty)
            
            if score > 0:
                identified_regions.append(region)
                specialty_scores[region] = {
                    'score': score / len(specialties),
                    'matched_specialties': matched_specialties
                }
        
        # Find primary region
        primary_region = max(specialty_scores.keys(), key=lambda x: specialty_scores[x]['score']) if specialty_scores else None
        
        return {
            'identified_regions': identified_regions,
            'primary_region': primary_region,
            'regional_confidence': specialty_scores.get(primary_region, {}).get('score', 0) if primary_region else 0,
            'matched_specialties': specialty_scores.get(primary_region, {}).get('matched_specialties', []) if primary_region else [],
            'authenticity_score': self._calculate_authenticity(text, primary_region)
        }
    
    def identify_traditional_techniques(self, title: str, description: str) -> Dict[str, any]:
        """Identify traditional Indian craft techniques used"""
        text = f"{title} {description}".lower()
        
        identified_techniques = {}
        
        for category, techniques in self.traditional_techniques.items():
            found_techniques = []
            for technique in techniques:
                if technique in text:
                    found_techniques.append(technique)
            
            if found_techniques:
                identified_techniques[category] = found_techniques
        
        # Calculate tradition score
        total_techniques = sum(len(techniques) for techniques in identified_techniques.values())
        tradition_score = min(1.0, total_techniques / 5)  # Normalize
        
        return {
            'techniques_by_category': identified_techniques,
            'all_techniques': [tech for techs in identified_techniques.values() for tech in techs],
            'tradition_score': tradition_score,
            'heritage_level': self._get_heritage_level(tradition_score)
        }
    
    def assess_indian_sustainability(self, title: str, description: str, materials: List[str] = None) -> Dict[str, any]:
        """Assess sustainability from Indian craft perspective"""
        text = f"{title} {description}".lower()
        if materials:
            text += " " + " ".join(materials).lower()
        
        sustainability_factors = {}
        total_score = 0
        
        for category, items in self.indian_sustainability.items():
            found_items = []
            for item in items:
                if item in text:
                    found_items.append(item)
            
            if found_items:
                sustainability_factors[category] = found_items
                # Weight different categories
                weights = {
                    'natural_materials': 0.3,
                    'organic_dyes': 0.2,
                    'eco_processes': 0.2,
                    'zero_waste': 0.15,
                    'traditional_methods': 0.15
                }
                total_score += len(found_items) * weights.get(category, 0.1)
        
        sustainability_score = min(1.0, total_score)
        
        return {
            'sustainability_factors': sustainability_factors,
            'indian_eco_score': sustainability_score,
            'sustainability_level': self._get_sustainability_level(sustainability_score),
            'eco_certifiable': sustainability_score > 0.6
        }
    
    def identify_seasonal_relevance(self, title: str, description: str) -> Dict[str, any]:
        """Identify festival/seasonal relevance for Indian market"""
        text = f"{title} {description}".lower()
        
        seasonal_matches = {}
        relevance_score = 0
        
        for festival, items in self.seasonal_crafts.items():
            matches = []
            for item in items:
                if item in text:
                    matches.append(item)
            
            if matches:
                seasonal_matches[festival] = matches
                relevance_score += len(matches)
        
        # Determine peak seasons
        peak_seasons = []
        if seasonal_matches:
            max_matches = max(len(matches) for matches in seasonal_matches.values())
            peak_seasons = [festival for festival, matches in seasonal_matches.items() 
                          if len(matches) == max_matches]
        
        return {
            'seasonal_matches': seasonal_matches,
            'peak_seasons': peak_seasons,
            'seasonal_score': min(1.0, relevance_score / 10),
            'year_round_appeal': len(seasonal_matches) == 0 or relevance_score < 2
        }
    
    def generate_indian_market_insights(self, analysis_results: Dict) -> List[str]:
        """Generate India-specific market insights and recommendations"""
        insights = []
        
        regional_data = analysis_results.get('regional_analysis', {})
        technique_data = analysis_results.get('technique_analysis', {})
        sustainability_data = analysis_results.get('indian_sustainability', {})
        seasonal_data = analysis_results.get('seasonal_analysis', {})
        
        # Regional insights
        if regional_data.get('primary_region'):
            region = regional_data['primary_region'].title()
            insights.append(f"🏛️ Authentic {region} craft with regional specialties")
            if regional_data.get('authenticity_score', 0) > 0.7:
                insights.append(f"✅ High authenticity score - perfect for craft connoisseurs")
        
        # Technique insights
        if technique_data.get('tradition_score', 0) > 0.6:
            insights.append("🎨 Rich traditional techniques - appeals to heritage lovers")
            insights.append("📚 Educational value for cultural preservation")
        
        # Sustainability insights
        if sustainability_data.get('indian_eco_score', 0) > 0.7:
            insights.append("🌱 Excellent sustainability using traditional Indian methods")
            insights.append("♻️ Eco-conscious consumers will highly value this product")
        
        # Seasonal insights
        peak_seasons = seasonal_data.get('peak_seasons', [])
        if peak_seasons:
            season_names = ', '.join(s.replace('_', ' ').title() for s in peak_seasons)
            insights.append(f"🎉 Perfect for {season_names} - time marketing campaigns accordingly")
        
        # Market positioning
        if regional_data.get('regional_confidence', 0) > 0.8:
            insights.append("🏆 Premium positioning due to regional authenticity")
        
        # Export potential
        if technique_data.get('tradition_score', 0) > 0.7 and sustainability_data.get('indian_eco_score', 0) > 0.6:
            insights.append("🌍 Strong export potential - international appeal for Indian crafts")
        
        return insights
    
    def _calculate_authenticity(self, text: str, region: str = None) -> float:
        """Calculate authenticity score based on traditional elements"""
        authenticity_indicators = [
            'traditional', 'authentic', 'heritage', 'ancestral', 'generations',
            'handmade', 'artisan', 'craftsman', 'village', 'tribal'
        ]
        
        score = sum(1 for indicator in authenticity_indicators if indicator in text)
        
        # Bonus for specific regional mentions
        if region and region in text:
            score += 2
        
        return min(1.0, score / 8)
    
    def _get_heritage_level(self, tradition_score: float) -> str:
        """Get heritage level description"""
        if tradition_score >= 0.8:
            return "Master Level Heritage Craft"
        elif tradition_score >= 0.6:
            return "Traditional Heritage Craft"
        elif tradition_score >= 0.4:
            return "Semi-Traditional Craft"
        elif tradition_score >= 0.2:
            return "Contemporary Indian Craft"
        else:
            return "Modern Craft"
    
    def _get_sustainability_level(self, eco_score: float) -> str:
        """Get sustainability level description"""
        if eco_score >= 0.8:
            return "Highly Sustainable Traditional Methods"
        elif eco_score >= 0.6:
            return "Eco-Friendly Traditional Craft"
        elif eco_score >= 0.4:
            return "Moderately Sustainable"
        elif eco_score >= 0.2:
            return "Some Sustainable Elements"
        else:
            return "Conventional Methods"
    
    def comprehensive_indian_analysis(self, title: str, description: str, 
                                    location: str = None, materials: List[str] = None) -> Dict[str, any]:
        """Run comprehensive analysis specific to Indian crafts"""
        return {
            'regional_analysis': self.identify_regional_specialty(title, description, location),
            'technique_analysis': self.identify_traditional_techniques(title, description),
            'indian_sustainability': self.assess_indian_sustainability(title, description, materials),
            'seasonal_analysis': self.identify_seasonal_relevance(title, description),
            'market_insights': self.generate_indian_market_insights({
                'regional_analysis': self.identify_regional_specialty(title, description, location),
                'technique_analysis': self.identify_traditional_techniques(title, description),
                'indian_sustainability': self.assess_indian_sustainability(title, description, materials),
                'seasonal_analysis': self.identify_seasonal_relevance(title, description)
            })
        }

def demo_indian_crafts():
    """Demo the Indian craft analysis system"""
    print("=== Indian Craft Specialist Demo ===")
    print()
    
    specialist = IndianCraftSpecialist()
    
    # Test with Madhubani painting
    result = specialist.comprehensive_indian_analysis(
        "Traditional Madhubani Painting",
        "Beautiful Madhubani painting on handmade paper depicting nature and folklore. Created using natural pigments and traditional techniques passed down through generations in Bihar villages.",
        "Bihar",
        ["handmade paper", "natural pigments", "bamboo brush"]
    )
    
    print("Analysis Results for Madhubani Painting:")
    for category, data in result.items():
        print(f"\n{category.replace('_', ' ').title()}:")
        if isinstance(data, dict):
            for key, value in data.items():
                print(f"  {key}: {value}")
        elif isinstance(data, list):
            for item in data:
                print(f"  • {item}")

if __name__ == "__main__":
    demo_indian_crafts()