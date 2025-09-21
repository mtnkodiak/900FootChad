"""
Audio listener for 900FootChad.

`ChadVoiceListener` is a sink used by `discord-ext-voice-recv` to receive PCM
audio frames from the voice channel.  It feeds those frames into a
`BaseRecognizer` implementation and triggers the `AudioPlayer` when the
configured keyword is detected in the transcript.

The listener is designed to be lightweight and to avoid naming collisions with
classes in external libraries.  It uses a simple cooldown mechanism to prevent
spamming the same audio clip repeatedly.
"""

from __future__ import annotations

import time
from typing import Optional

import discord
from discord.ext import voice_recv

from .recognizer import BaseRecognizer
from .audio_player import AudioPlayer


class ChadVoiceListener(voice_recv.BasicSink):
    """Receive voice frames, transcribe them and respond to keywords."""

    def __init__(
        self,
        recognizer: BaseRecognizer,
        audio_player: AudioPlayer,
        keyword: str = "ok",
        cooldown: float = 3.0,
    ) -> None:
        self.recognizer = recognizer
        self.audio_player = audio_player
        self.keyword = keyword.lower()
        self.cooldown = cooldown
        self.last_trigger: float = 0.0

        def callback(user: Optional[discord.Member], data: voice_recv.VoiceData) -> None:
            # Extract PCM bytes from VoiceData object
            pcm_data = data.pcm
            self._handle_audio(pcm_data)

        super().__init__(callback)

    def wants_opus(self) -> bool:
        """Return False to request PCM frames instead of opus."""
        return False

    def _handle_audio(self, pcm_data: bytes) -> None:
        """Process an incoming PCM chunk and trigger the audio player if needed."""
        text = self.recognizer.process(pcm_data)
        if not text:
            return
        # Check if the keyword appears as a whole word in the recognised text
        words = [w.strip() for w in text.lower().split() if w]
        if self.keyword not in words:
            return
        # Enforce cooldown between triggers
        now = time.time()
        if now - self.last_trigger < self.cooldown:
            return
        self.last_trigger = now
        # Play a random sample
        self.audio_player.play_sample()
