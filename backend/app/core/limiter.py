"""
PAHCHAN Rate Limiting Engine (P2.4)
Uses slowapi to protect against DoS attacks and high-frequency upload abuse.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Global rate limiter keying by remote client IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"]
)
