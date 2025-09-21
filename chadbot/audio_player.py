"""
Audio playback helper for the 900FootChad bot.

This module encapsulates selecting random sound clips from a directory and
playing them back through a Discord voice client.  It contains no knowledge
about speech recognition or Discord events, making it easy to test in
isolation.
"""

from __future__ import annotations

import os
import random
from pathlib import Path
from typing import Iterable, List, Optional

import discord


class AudioPlayer:
    """Manage playback of audio clips through a Discord voice client."""

    def __init__(self, voice_client: discord.VoiceClient, audio_dir: Path, *,
                 supported_extensions: Iterable[str] = (".wav", ".mp3", ".ogg")) -> None:
        self.voice_client = voice_client
        self.audio_dir = audio_dir
        self.supported_extensions = tuple(ext.lower() for ext in supported_extensions)
        self.sample_files: List[Path] = []
        self._load_sample_files()

    def _load_sample_files(self) -> None:
        """Populate the list of available sample files from the audio directory."""
        if not self.audio_dir.exists():
            print(f"Audio directory '{self.audio_dir}' does not exist. No samples loaded.")
            return
        for item in self.audio_dir.iterdir():
            if item.is_file() and item.suffix.lower() in self.supported_extensions:
                self.sample_files.append(item)
        if not self.sample_files:
            print(f"No audio files found in '{self.audio_dir}'.")

    def select_random_sample(self) -> Optional[Path]:
        """Return a random sample file path, or None if none exist."""
        if not self.sample_files:
            return None
        return random.choice(self.sample_files)

    def play_sample(self) -> None:
        """Play a randomly selected sample through the voice client.

        If a sample is already playing, this method will not start a new one.
        """
        if not self.sample_files:
            print("No sample files loaded; cannot play audio.")
            return
        if self.voice_client.is_playing():
            return
        sample = self.select_random_sample()
        if not sample:
            return
        # Use FFmpegPCMAudio to stream the audio clip.
        source = discord.FFmpegPCMAudio(str(sample))
        self.voice_client.play(source)
        print(f"Playing sound: {sample.name}")
