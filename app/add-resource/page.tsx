"use client";

import React, { useState, useEffect } from 'react';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

export default function AddSongResourcePage() {
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [form, setForm] = useState({
    youtubeUrl: '',
    songsterrUrl: '',
    ultimateGuitarUrl: '',
    lyricsUrl: '',
  });
  const [status, setStatus] = useState('');

  // Fetch all songs on mount
  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => {
        // Sort alphabetically by artist, then by title
        const sortedData = data.sort((a, b) => {
          const artistCompare = a.artist.localeCompare(b.artist);
          if (artistCompare !== 0) return artistCompare;
          return a.title.localeCompare(b.title);
        });
        setSongs(sortedData);
      })
      .catch((err) => console.error('Error fetching songs:', err));
  }, []);

  // When a song is selected, populate the form
  useEffect(() => {
    if (selectedSongId) {
      const song = songs.find((s) => s.id === Number(selectedSongId));
      if (song) {
        setSelectedSong(song);
        setForm({
          youtubeUrl: song.youtube || '',
          songsterrUrl: song.songsterr || '',
          ultimateGuitarUrl: song.ultimateGuitar || '',
          lyricsUrl: song.lyrics || '',
        });
      }
    }
  }, [selectedSongId, songs]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Saving...');
    
    try {
      const res = await fetch('/api/songs/update-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: selectedSongId,
          ...form,
        }),
      });
      
      if (res.ok) {
        setStatus('✅ Successfully updated!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ Failed to update');
      }
    } catch (error) {
      console.error('Error updating links:', error);
      setStatus('❌ Error occurred');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] mt-8">
      <h1 className="text-2xl font-bold mb-6 text-[var(--text)]">Update Song Resource Links</h1>
      
      {/* Song Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          Select Song
        </label>
        <select
          value={selectedSongId}
          onChange={(e) => setSelectedSongId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-[var(--ring)]/20 bg-[var(--surface2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        >
          <option value="">-- Choose a song --</option>
          {songs.map((song) => (
            <option key={song.id} value={song.id}>
              {song.artist} - {song.title}
            </option>
          ))}
        </select>
      </div>

      {selectedSong && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">YouTube Link</label>
            <Input 
              name="youtubeUrl" 
              placeholder="https://youtube.com/..." 
              value={form.youtubeUrl} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Songsterr Link</label>
            <Input 
              name="songsterrUrl" 
              placeholder="https://songsterr.com/..." 
              value={form.songsterrUrl} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Ultimate Guitar Link</label>
            <Input 
              name="ultimateGuitarUrl" 
              placeholder="https://ultimate-guitar.com/..." 
              value={form.ultimateGuitarUrl} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Lyrics Link</label>
            <Input 
              name="lyricsUrl" 
              placeholder="https://..." 
              value={form.lyricsUrl} 
              onChange={handleChange} 
            />
          </div>
          
          {status && (
            <div className={`text-center font-semibold ${status.includes('✅') ? 'text-[var(--gold)]' : 'text-red-400'}`}>
              {status}
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Update Links
          </Button>
        </form>
      )}
      
      {!selectedSongId && (
        <div className="text-center text-[var(--muted)] py-8">
          Select a song above to update its resource links
        </div>
      )}
    </div>
  );
}
