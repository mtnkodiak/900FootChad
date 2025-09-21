"""
Configuration loading for the 900FootChad bot.

Reads environment variables via python-dotenv and populates a `ChadConfig` object.
This decouples configuration details from code logic and makes it easy to
customize behaviour without modifying the source files.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


@dataclass
class ChadConfig:
    """Container for all configuration options for the bot."""

    token: str
    guild_id: Optional[int]
    voice_channel_id: Optional[int]
    model_path: Path
    audio_dir: Path
    ok_keyword: str = "ok"
    sample_rate: int = 16000

    @staticmethod
    def from_env(env_file: str = ".env") -> "ChadConfig":
        """
        Load configuration from environment variables, optionally reading a
        `.env` file to populate them.  Raises ValueError if required
        variables are missing.
        """
        # Load variables from .env file if it exists
        load_dotenv(env_file)

        token = os.getenv("DISCORD_TOKEN")
        if not token:
            raise ValueError("DISCORD_TOKEN must be set in the environment")

        guild_raw = os.getenv("GUILD_ID")
        guild_id = int(guild_raw) if guild_raw and guild_raw.isdigit() else None

        voice_raw = os.getenv("VOICE_CHANNEL_ID")
        voice_channel_id = int(voice_raw) if voice_raw and voice_raw.isdigit() else None

        model_path_str = os.getenv("VOSK_MODEL_PATH", "models/vosk-model-small-en-us-0.15")
        model_path = Path(model_path_str).expanduser().resolve()

        audio_dir_str = os.getenv("AUDIO_DIR", "audio_samples")
        audio_dir = Path(audio_dir_str).expanduser().resolve()

        ok_keyword = os.getenv("OK_KEYWORD", "ok").lower()

        sample_rate_raw = os.getenv("SAMPLE_RATE")
        sample_rate = 16000
        if sample_rate_raw and sample_rate_raw.isdigit():
            sample_rate = int(sample_rate_raw)

        return ChadConfig(
            token=token,
            guild_id=guild_id,
            voice_channel_id=voice_channel_id,
            model_path=model_path,
            audio_dir=audio_dir,
            ok_keyword=ok_keyword,
            sample_rate=sample_rate,
        )
