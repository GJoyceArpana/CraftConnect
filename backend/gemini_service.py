import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiChatbotService:
    """
    Gemini 2.0 chatbot service for sustainability recommendations
    and carbon footprint analysis
    """
    
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            logger.warning("GEMINI_API_KEY not found. Using mock responses for development.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # System prompt for sustainability context
        self.system_prompt = """
        You are an AI sustainability expert for CraftConnect, a platform connecting buyers with artisan-made eco-friendly products. 
        Your role is to:
        
        1. Analyze carbon footprint data and provide actionable sustainability recommendations
        2. Suggest specific parameter changes to improve environmental impact
        3. Educate users about sustainable crafting practices
        4. Help optimize product designs for better sustainability scores
        5. Provide encouraging, practical advice for reducing environmental impact
        
        Guidelines:
        - Be specific and actionable in your recommendations
        - Focus on practical changes that artisans can implement
        - Consider cost-effectiveness for small-scale producers
        - Emphasize traditional, sustainable practices
        - Provide quantifiable improvements when possible
        - Be encouraging and supportive of sustainable efforts
        
        Always format responses in a helpful, conversational tone while being informative and precise.
        """
        
        # Carbon footprint context templates
        self.analysis_templates = {
            'product_analysis': """
            Product Analysis:
            - Category: {category}
            - Weight: {weight_g}g
            - Materials: {materials}
            - Production Method: {production_method}
            - Recycled Content: {percent_recycled_material}%
            - Distance to Market: {distance_km_to_market}km
            - Packaging Weight: {packaging_weight_g}g
            - Current CO2 Savings: {carbon_footprint}kg
            - Current Sustainability Score: {sustainability_score}%
            """,
            
            'improvement_request': """
            Based on the above product data, please suggest specific improvements to:
            1. Reduce carbon footprint further
            2. Increase sustainability score
            3. Optimize material usage
            4. Improve packaging efficiency
            5. Enhance overall environmental impact
            
            For each suggestion, please indicate which parameters should be changed and by how much.
            """
        }

    def analyze_carbon_footprint(self, product_data: Dict[str, Any], current_impact: Dict[str, float]) -> Dict[str, Any]:
        """
        Analyze carbon footprint data and provide improvement recommendations
        
        Args:
            product_data: Product specifications
            current_impact: Current carbon footprint and sustainability metrics
            
        Returns:
            Dictionary containing analysis and recommendations
        """
        try:
            # Format the analysis context
            analysis_context = self.analysis_templates['product_analysis'].format(
                **product_data,
                **current_impact
            )
            
            prompt = f"{self.system_prompt}\n\n{analysis_context}\n\n{self.analysis_templates['improvement_request']}"
            
            if self.model:
                response = self.model.generate_content(prompt)
                recommendations = response.text
            else:
                # Mock response for development
                recommendations = self._generate_mock_recommendations(product_data, current_impact)
            
            return {
                "success": True,
                "analysis": recommendations,
                "suggestions": self._parse_suggestions(recommendations),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in carbon footprint analysis: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_suggestions": self._get_fallback_suggestions(product_data)
            }

    def chat_with_user(self, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Handle user chat messages with sustainability context
        
        Args:
            message: User's message
            context: Optional context (product data, previous conversation, etc.)
            
        Returns:
            Dictionary containing chat response
        """
        try:
            # Build context-aware prompt
            context_prompt = self.system_prompt
            
            if context:
                if 'product_data' in context:
                    try:
                        # Add missing fields with defaults
                        product_data = context['product_data'].copy()
                        if 'materials' not in product_data:
                            product_data['materials'] = product_data.get('category', 'various materials')
                        
                        # Add impact data if available
                        if 'current_impact' in context:
                            product_data.update(context['current_impact'])
                        else:
                            # Set defaults for missing impact fields
                            product_data.setdefault('carbon_footprint', 'unknown')
                            product_data.setdefault('sustainability_score', 'unknown')
                        
                        product_context = self.analysis_templates['product_analysis'].format(**product_data)
                        context_prompt += f"\n\nCurrent Product Context:\n{product_context}"
                    except KeyError as e:
                        # If formatting fails, just add basic context
                        context_prompt += f"\n\nProduct Context: {context['product_data']}"
                
                if 'conversation_history' in context:
                    context_prompt += f"\n\nPrevious Conversation:\n{context['conversation_history']}"
            
            full_prompt = f"{context_prompt}\n\nUser Question: {message}\n\nResponse:"
            
            if self.model:
                response = self.model.generate_content(full_prompt)
                chat_response = response.text
            else:
                # Mock response for development
                chat_response = self._generate_mock_chat_response(message, context)
            
            return {
                "success": True,
                "response": chat_response,
                "timestamp": datetime.now().isoformat(),
                "suggestions": self._extract_actionable_items(chat_response)
            }
            
        except Exception as e:
            logger.error(f"Error in chat response: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": "I'm having trouble connecting right now. Here are some general sustainability tips: use recycled materials, reduce packaging, choose local suppliers, and optimize production methods."
            }

    def get_parameter_suggestions(self, current_params: Dict[str, Any], target_improvement: str = "overall") -> Dict[str, Any]:
        """
        Get specific parameter change suggestions to improve sustainability
        
        Args:
            current_params: Current product parameters
            target_improvement: Target area for improvement (carbon, sustainability, waste, etc.)
            
        Returns:
            Dictionary with parameter change suggestions
        """
        try:
            prompt = f"""
            {self.system_prompt}
            
            Current Product Parameters:
            {json.dumps(current_params, indent=2)}
            
            Target Improvement Area: {target_improvement}
            
            Please provide specific, quantified recommendations for parameter changes that would improve the {target_improvement} aspect.
            
            Format your response as actionable parameter changes with expected impact, such as:
            - Change X from Y to Z (expected improvement: +N% sustainability score)
            - Reduce A by B% (expected CO2 reduction: C kg)
            """
            
            if self.model:
                response = self.model.generate_content(prompt)
                suggestions = response.text
            else:
                suggestions = self._generate_mock_parameter_suggestions(current_params, target_improvement)
            
            return {
                "success": True,
                "parameter_suggestions": suggestions,
                "parsed_changes": self._parse_parameter_changes(suggestions),
                "target_area": target_improvement
            }
            
        except Exception as e:
            logger.error(f"Error generating parameter suggestions: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_suggestions": self._get_parameter_fallback_suggestions(current_params)
            }

    def _generate_mock_recommendations(self, product_data: Dict, current_impact: Dict) -> str:
        """Generate mock recommendations for development"""
        sustainability_score = current_impact.get('sustainability_score', 50)
        carbon_footprint = current_impact.get('carbon_footprint', 2.5)
        
        recommendations = f"""
        ## Sustainability Analysis for {product_data.get('materials', 'your product')}

        **Current Performance:**
        - CO2 Savings: {carbon_footprint}kg compared to factory production
        - Sustainability Score: {sustainability_score}%

        **Recommendations to Improve:**

        1. **Increase Recycled Content** (Currently {product_data.get('percent_recycled_material', 0)}%)
           - Target: Increase to {min(100, product_data.get('percent_recycled_material', 0) + 20)}%
           - Expected improvement: +15% sustainability score
           - Suggestion: Source recycled {product_data.get('materials', 'materials')} from local suppliers

        2. **Optimize Distance to Market** (Currently {product_data.get('distance_km_to_market', 0)}km)
           - Target: Reduce to {max(50, product_data.get('distance_km_to_market', 200) * 0.8)}km
           - Expected improvement: +0.3kg CO2 savings
           - Suggestion: Find closer distribution centers or direct-to-consumer sales

        3. **Reduce Packaging Weight** (Currently {product_data.get('packaging_weight_g', 0)}g)
           - Target: Reduce by 30% to {product_data.get('packaging_weight_g', 50) * 0.7}g
           - Expected improvement: +8% sustainability score
           - Suggestion: Use minimal, biodegradable packaging

        4. **Production Method Optimization**
           - Current: {product_data.get('production_method', 'handmade')}
           - Suggestion: If not already handmade, switch to handmade production for +25% sustainability boost

        **Quick Wins:**
        - Switch to natural dyes and finishes
        - Use renewable energy for any power tools
        - Implement zero-waste production techniques
        - Partner with local material suppliers

        These changes could improve your sustainability score by 20-30% and increase CO2 savings by 0.5-1.0kg.
        """
        
        return recommendations

    def _generate_mock_chat_response(self, message: str, context: Optional[Dict]) -> str:
        """Generate mock chat response for development with context awareness"""
        message_lower = message.lower()
        
        # Extract context data if available
        product_data = context.get('product_data', {}) if context else {}
        current_impact = context.get('current_impact', {}) if context else {}
        
        # Get specific values from context
        category = product_data.get('category', 'your product')
        weight = product_data.get('weight_g', 0)
        recycled_content = product_data.get('percent_recycled_material', 0)
        distance = product_data.get('distance_km_to_market', 0)
        packaging = product_data.get('packaging_weight_g', 0)
        production_method = product_data.get('production_method', 'unknown')
        current_co2 = current_impact.get('carbon_footprint', 0)
        sustainability_score = current_impact.get('sustainability_score', 0)
        
        if any(word in message_lower for word in ['reduce', 'carbon', 'footprint', 'co2']):
            specific_suggestions = []
            if distance > 100:
                specific_suggestions.append(f"- Reduce transportation distance from {distance}km to under 100km (save ~0.3kg CO2)")
            if packaging > 30:
                specific_suggestions.append(f"- Reduce packaging from {packaging}g to {int(packaging * 0.7)}g (improve sustainability by 8%)")
            if recycled_content < 70:
                target_recycled = min(100, recycled_content + 25)
                specific_suggestions.append(f"- Increase recycled content from {recycled_content}% to {target_recycled}% (major impact)")
            
            context_intro = f"Based on your {category} product (Current CO2 savings: {current_co2}kg, Sustainability score: {sustainability_score}%):"
            
            specific_text = "\n".join(specific_suggestions) if specific_suggestions else ""
            
            return f"""
            {context_intro}

            🌱 **Your Specific Opportunities:**
            {specific_text or "- Your product is already well-optimized! Focus on small refinements"}

            🚀 **General Strategies:**
            - Use locally sourced materials (reduces transport emissions)
            - Choose renewable materials like bamboo, hemp, or reclaimed wood
            - Handmade processes typically have 50% lower carbon footprint
            - Use renewable energy for any power tools
            - Consider direct sales to reduce supply chain emissions

            **Expected Impact:** These changes could improve your sustainability score by 15-25% and increase CO2 savings by 0.3-0.8kg.
            """
        
        elif any(word in message_lower for word in ['sustainability', 'score', 'improve']):
            current_score_text = f"Current score: {sustainability_score}%" if sustainability_score > 0 else "Let's boost your sustainability!"
            
            priority_actions = []
            if recycled_content < 60:
                priority_actions.append(f"1. **Increase Recycled Content** (Currently {recycled_content}%) - Target 70%+ for major boost")
            if production_method != 'handmade':
                priority_actions.append(f"2. **Switch to Handmade Production** (Currently {production_method}) - Highest scoring method")
            if distance > 200:
                priority_actions.append(f"3. **Reduce Supply Chain Distance** (Currently {distance}km) - Target under 200km")
            if packaging > 40:
                priority_actions.append(f"4. **Optimize Packaging** (Currently {packaging}g) - Reduce by 25-30%")
            
            if not priority_actions:
                priority_actions = ["Your product is well-optimized! Focus on small refinements and documentation."]
            
            return f"""
            {current_score_text}

            📊 **Your Priority Actions:**
            {chr(10).join(priority_actions)}

            🏆 **Score Breakdown:**
            - **Recycled Materials** (40% of score) - You're at {recycled_content}%
            - **Production Method** (35% of score) - {production_method.title()}
            - **Local Sourcing** (15% of score) - {distance}km to market
            - **Packaging Efficiency** (10% of score) - {packaging}g packaging

            ✨ **Quick Wins:**
            - Document your sustainable practices
            - Get certified eco-friendly materials
            - Use natural, non-toxic finishes
            - Implement zero-waste techniques

            **Potential Score Gain:** Following these recommendations could increase your score by 15-30 points!
            """
        
        else:
            # Generic helpful response with context
            product_context = f" for your {category}" if category != 'your product' else ""
            current_performance = ""
            if current_co2 > 0 or sustainability_score > 0:
                current_performance = f"\n\n📊 **Your Current Performance:**\n- CO2 Savings: {current_co2}kg\n- Sustainability Score: {sustainability_score}%"
            
            return f"""
            I'm here to help you create more sustainable products{product_context}! I can assist with:

            🔍 **Carbon Footprint Analysis** - Analyze your product's environmental impact
            📊 **Sustainability Scoring** - Improve your eco-friendly rating  
            💡 **Parameter Optimization** - Suggest specific changes to materials, processes, etc.
            🌿 **Best Practices** - Share sustainable crafting techniques{current_performance}

            **Quick Questions You Can Ask:**
            - "How can I reduce my carbon footprint?"
            - "What's the best way to improve my sustainability score?"
            - "What eco-friendly materials should I use?"
            - "How can I optimize my packaging?"

            What aspect of sustainability would you like to explore today?
            """

    def _generate_mock_parameter_suggestions(self, current_params: Dict, target: str) -> str:
        """Generate mock parameter suggestions"""
        suggestions = f"""
        ## Parameter Optimization for {target.title()} Improvement

        **Current Parameters Analysis:**
        """
        
        for key, value in current_params.items():
            suggestions += f"\n- {key}: {value}"
        
        suggestions += f"""

        **Recommended Changes:**

        1. **Material Optimization:**
           - Increase percent_recycled_material from {current_params.get('percent_recycled_material', 0)}% to {min(100, current_params.get('percent_recycled_material', 0) + 25)}%
           - Expected impact: +18% sustainability score

        2. **Weight Reduction:**
           - Reduce weight_g from {current_params.get('weight_g', 200)}g to {current_params.get('weight_g', 200) * 0.9}g through design optimization
           - Expected impact: -0.2kg CO2 footprint

        3. **Packaging Efficiency:**
           - Reduce packaging_weight_g from {current_params.get('packaging_weight_g', 50)}g to {current_params.get('packaging_weight_g', 50) * 0.6}g
           - Expected impact: +12% sustainability score

        4. **Supply Chain Optimization:**
           - Reduce distance_km_to_market from {current_params.get('distance_km_to_market', 200)}km to {current_params.get('distance_km_to_market', 200) * 0.7}km
           - Expected impact: -0.4kg CO2 footprint

        **Priority Actions:**
        1. Focus on recycled materials first (highest impact)
        2. Optimize packaging second (quick win)
        3. Review supply chain third (long-term benefit)
        """
        
        return suggestions

    def _parse_suggestions(self, recommendations: str) -> List[Dict[str, Any]]:
        """Parse recommendations into structured suggestions"""
        # Simple parsing logic - in production, this would be more sophisticated
        suggestions = []
        
        if "recycled" in recommendations.lower():
            suggestions.append({
                "category": "materials",
                "action": "increase_recycled_content",
                "description": "Increase recycled material percentage",
                "impact": "high",
                "difficulty": "medium"
            })
        
        if "packaging" in recommendations.lower():
            suggestions.append({
                "category": "packaging",
                "action": "reduce_packaging_weight",
                "description": "Minimize packaging materials",
                "impact": "medium",
                "difficulty": "low"
            })
        
        if "distance" in recommendations.lower():
            suggestions.append({
                "category": "distribution",
                "action": "optimize_supply_chain",
                "description": "Reduce transportation distance",
                "impact": "medium",
                "difficulty": "high"
            })
        
        return suggestions

    def _extract_actionable_items(self, response: str) -> List[str]:
        """Extract actionable items from chat response"""
        # Simple extraction - look for bullet points or numbered items
        actionable_items = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('-') or line.startswith('•') or any(line.startswith(f"{i}.") for i in range(1, 10)):
                actionable_items.append(line.lstrip('-•0123456789. '))
        
        return actionable_items[:5]  # Return top 5 actionable items

    def _parse_parameter_changes(self, suggestions: str) -> Dict[str, Any]:
        """Parse parameter change suggestions into structured format"""
        # In production, this would use more sophisticated NLP
        changes = {}
        
        if "percent_recycled_material" in suggestions:
            changes["percent_recycled_material"] = {
                "current": None,  # Would be extracted from text
                "suggested": None,
                "impact": "Increased sustainability score"
            }
        
        if "weight_g" in suggestions:
            changes["weight_g"] = {
                "current": None,
                "suggested": None,
                "impact": "Reduced carbon footprint"
            }
        
        return changes

    def _get_fallback_suggestions(self, product_data: Dict) -> List[str]:
        """Provide fallback suggestions when API fails"""
        return [
            "Use more recycled materials in your product",
            "Reduce packaging weight by 20-30%",
            "Source materials from local suppliers within 200km",
            "Switch to handmade production methods",
            "Use renewable energy for any power tools"
        ]

    def _get_parameter_fallback_suggestions(self, current_params: Dict) -> Dict[str, str]:
        """Provide fallback parameter suggestions"""
        return {
            "percent_recycled_material": "Increase by 15-25% for better sustainability score",
            "packaging_weight_g": "Reduce by 30% using minimal packaging",
            "distance_km_to_market": "Reduce by 20% through local sourcing",
            "production_method": "Use handmade for highest sustainability score"
        }