"use client";

import { useState } from "react";

interface SettingsProps {
  soundEnabled: boolean;
  soundVolume: number;
  chatVisible: boolean;
  onSoundToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onChatToggle: (visible: boolean) => void;
}

export default function SettingsPanel({
  soundEnabled,
  soundVolume,
  chatVisible,
  onSoundToggle,
  onVolumeChange,
  onChatToggle,
}: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-colors"
        title="Settings"
      >
        ⚙️ Settings
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-600 p-4 z-50">
          <h3 className="text-white font-bold text-lg mb-4">Settings</h3>

          {/* Sound Toggle */}
          <div className="mb-4">
            <label className="flex items-center justify-between text-white mb-2">
              <span>🔊 Sound Effects</span>
              <button
                onClick={() => onSoundToggle(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  soundEnabled ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            {/* Volume Slider */}
            {soundEnabled && (
              <div className="ml-4">
                <label className="text-gray-300 text-sm block mb-1">
                  Volume: {Math.round(soundVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume * 100}
                  onChange={(e) =>
                    onVolumeChange(parseInt(e.target.value) / 100)
                  }
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Chat Toggle */}
          <div className="mb-4">
            <label className="flex items-center justify-between text-white">
              <span>💬 AI Chat</span>
              <button
                onClick={() => onChatToggle(!chatVisible)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  chatVisible ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    chatVisible ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
