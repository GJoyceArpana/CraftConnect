"""
CraftConnect Machine Learning Module
Auto-tagging system for sustainable crafts marketplace
"""

from .auto_tagging import AutoTagger, CraftItem, TaggingResult
from .api import CraftConnectAPI, tag_craft, get_sustainability_score, get_categories

__version__ = "1.0.0"
__author__ = "CraftConnect Team"

__all__ = [
    'AutoTagger',
    'CraftItem', 
    'TaggingResult',
    'CraftConnectAPI',
    'tag_craft',
    'get_sustainability_score',
    'get_categories'
]