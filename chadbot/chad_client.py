"""
Main Discord client for the 900FootChad bot.

This module defines the `ChadBotClient` class, which subclasses `commands.Bot`
to manage the Discord connection, voice channel handling and audio processing.
It orchestrates the recogniser, audio player and voice listener defined in
other modules.
"""

from __future__ import annotations

import asyncio
from typing import Optional

import discord
from discord.ext import commands
from discord.ext import voice_recv

from chadbot.config import ChadConfig
from chadbot.recognizer import BaseRecognizer, VoskRecognizer
from chadbot.audio_player import AudioPlayer
from chadbot.listener import ChadVoiceListener


class ChadBotClient(commands.Bot):
    """Discord bot that listens for "OK" and plays Chad samples."""

    def __init__(self, config: ChadConfig) -> None:
        self.config = config
        # Configure intents: we need voice states for connecting to voice channels
        intents = discord.Intents.default()
        intents.voice_states = True
        # If you plan to add message commands in the future, enable message content
        intents.message_content = True
        super().__init__(command_prefix="~", intents=intents, help_command=None)

        self.recognizer: Optional[BaseRecognizer] = None
        self.audio_player: Optional[AudioPlayer] = None
        self.listener: Optional[ChadVoiceListener] = None
        self.voice_client: Optional[voice_recv.VoiceRecvClient] = None

        # Track whether the bot is actively listening to audio frames.  This
        # complements `voice_client.is_listening()` to simplify status checks.
        self.is_listening: bool = False

    async def setup_hook(self) -> None:
        """Called before the bot is ready.  Reserved for future extension."""
        pass

    async def on_ready(self) -> None:
        """Event handler called when the bot logs in and is ready."""
        print(f"Logged in as {self.user} (ID: {self.user.id})")
        # Auto‑join configured voice channel if provided
        if self.config.voice_channel_id:
            await self.join_and_listen(self.config.voice_channel_id)

    async def join_and_listen(self, channel_id: int) -> None:
        """Join a voice channel and start listening for speech."""
        # Fetch channel object
        channel = self.get_channel(channel_id)
        if not channel or not isinstance(channel, discord.VoiceChannel):
            print(f"Unable to find voice channel with ID {channel_id}")
            return
        # Connect using the VoiceRecvClient to enable receiving audio
        try:
            vc: voice_recv.VoiceRecvClient = await channel.connect(cls=voice_recv.VoiceRecvClient)
        except Exception as exc:
            print(f"Failed to connect to voice channel {channel.name}: {exc}")
            return
        self.voice_client = vc

        # Initialise the recogniser
        self.recognizer = VoskRecognizer(self.config.model_path, self.config.sample_rate)
        # Initialise the audio player
        self.audio_player = AudioPlayer(vc, self.config.audio_dir)
        # Create the voice listener sink
        self.listener = ChadVoiceListener(
            recognizer=self.recognizer,
            audio_player=self.audio_player,
            keyword=self.config.ok_keyword,
        )
        # Start listening for audio frames
        vc.listen(self.listener)
        # Mark as actively listening
        self.is_listening = True
        print(f"Connected and listening on voice channel {channel.name}")

    # ------------------------------------------------------------------
    # Command definitions
    #
    # Register standard prefix commands for interacting with the bot in
    # text channels.  These commands reply in the channel where they are
    # invoked and control the bot's behaviour.
    # ------------------------------------------------------------------

    @commands.command(name="ping", help="Check if the bot is responsive.")
    async def ping_command(self, ctx: commands.Context) -> None:
        """Respond with 'PONG' to verify connectivity."""
        await ctx.send("PONG")

    @commands.command(name="summon", help="Summon the bot to your current voice channel and start listening.")
    async def summon_command(self, ctx: commands.Context) -> None:
        """Summon the bot to the invoking user's voice channel."""
        voice_state = ctx.author.voice  # type: ignore[attr-defined]
        if not voice_state or not voice_state.channel:
            await ctx.send("You are not in a voice channel.")
            return
        channel = voice_state.channel
        await ctx.send(f"Joining voice channel {channel.name}…")
        await self.join_and_listen(channel.id)

    @commands.command(name="help", help="Show available commands and descriptions.")
    async def help_command(self, ctx: commands.Context) -> None:
        """Send a help message listing available commands."""
        # Build a help message from registered commands
        lines = ["Here are the available commands:"]
        for command in self.commands:
            # Skip hidden commands (internal) by checking help text
            if command.hidden:
                continue
            lines.append(f"**!{command.name}** – {command.help}")
        message = "\n".join(lines)
        await ctx.send(message)

    @commands.command(name="listen", help="Start listening in the current voice channel.")
    async def listen_command(self, ctx: commands.Context) -> None:
        """Begin listening to audio in the connected voice channel."""
        if not self.voice_client:
            await ctx.send("I am not connected to any voice channel.")
            return
        if self.is_listening:
            await ctx.send("Already listening to audio.")
            return
        # Recreate and start the listener
        if not self.recognizer or not self.audio_player:
            # Initialise recogniser and audio player if they don't exist
            self.recognizer = VoskRecognizer(self.config.model_path, self.config.sample_rate)
            self.audio_player = AudioPlayer(self.voice_client, self.config.audio_dir)
        self.listener = ChadVoiceListener(
            recognizer=self.recognizer,
            audio_player=self.audio_player,
            keyword=self.config.ok_keyword,
        )
        self.voice_client.listen(self.listener)
        self.is_listening = True
        await ctx.send("Started listening to audio.")

    @commands.command(name="stop", help="Stop listening to voice audio.")
    async def stop_command(self, ctx: commands.Context) -> None:
        """Stop receiving audio frames in the current voice channel."""
        if not self.voice_client:
            await ctx.send("I am not connected to any voice channel.")
            return
        if not self.is_listening:
            await ctx.send("I am not currently listening.")
            return
        self.voice_client.stop_listening()
        self.is_listening = False
        await ctx.send("Stopped listening.")

    @commands.command(name="status", help="Show current bot status and settings.")
    async def status_command(self, ctx: commands.Context) -> None:
        """Display the bot's operational state and configuration."""
        connected = self.voice_client is not None
        listening = self.is_listening
        channel_name = self.voice_client.channel.name if connected else "None"
        num_samples = len(self.audio_player.sample_files) if self.audio_player else 0
        status_lines = [
            f"Connected to voice channel: {connected}",
            f"Current voice channel: {channel_name}",
            f"Listening for keyword: {listening}",
            f"Keyword: '{self.config.ok_keyword}'",
            f"Model path: {self.config.model_path}",
            f"Sample rate: {self.config.sample_rate}",
            f"Audio directory: {self.config.audio_dir}",
            f"Number of audio samples loaded: {num_samples}",
        ]
        await ctx.send("\n".join(status_lines))

    # Entry point when executed as a module
    async def _run(self) -> None:
        await self.start(self.config.token)


def main() -> None:
    """Entrypoint for running the bot with configuration loaded from .env."""
    config = ChadConfig.from_env()
    bot = ChadBotClient(config)
    try:
        bot.run(config.token)
    except KeyboardInterrupt:
        print("Exiting…")


if __name__ == "__main__":  # pragma: no cover
    main()
