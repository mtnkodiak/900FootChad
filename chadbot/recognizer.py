"""
Recognizer abstraction used by the 900FootChad bot.

The `BaseRecognizer` defines an interface for processing PCM audio and
generating text tokens.  The default implementation `VoskRecognizer` uses
Vosk's streaming API, which supports offline, low‑latency speech recognition
with small per‑language models【190979090571676†L25-L37】.
"""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

import vosk


class BaseRecognizer(ABC):
    """Abstract base class for speech recognisers.

    A recogniser receives PCM audio data (16-bit, single channel) and returns
    recognised words or phrases.  Implementations may return partial results
    before the end of a sentence, enabling low‑latency keyword detection.
    """

    @abstractmethod
    def process(self, pcm_data: bytes) -> Optional[str]:
        """Process a chunk of audio and return recognised text if available.

        Parameters
        ----------
        pcm_data: bytes
            16‑bit little‑endian PCM data at the recogniser's sample rate.

        Returns
        -------
        Optional[str]
            A non‑empty string containing the recognised text, or an empty
            string/None if no new transcription is available.
        """
        raise NotImplementedError


class VoskRecognizer(BaseRecognizer):
    """Speech recogniser based on Vosk's streaming API."""

    def __init__(self, model_path: Path, sample_rate: int = 16000) -> None:
        if not model_path.exists():
            raise FileNotFoundError(f"Vosk model not found at {model_path}")
        self.model = vosk.Model(str(model_path))
        self.recogniser = vosk.KaldiRecognizer(self.model, sample_rate)
        self.sample_rate = sample_rate

    def process(self, pcm_data: bytes) -> Optional[str]:
        """Feed audio to Vosk and return partial or final transcript."""
        if self.recogniser.AcceptWaveform(pcm_data):
            result = json.loads(self.recogniser.Result())
            return result.get("text", "")
        else:
            partial = json.loads(self.recogniser.PartialResult())
            return partial.get("partial", "")
