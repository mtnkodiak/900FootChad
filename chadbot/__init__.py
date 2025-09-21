"""
Package initialization for the 900FootChad Discord bot.

This package exposes the main entry point (`chad_client.py`) and core modules
used by the bot.  To run the bot directly, execute

```bash
python3 -m chadbot.chad_client
```

The bot is structured to facilitate future expansion (e.g. adding
natural language understanding modules in `ai_placeholder.py`).
"""

from .chad_client import main as run

__all__ = ["run"]
