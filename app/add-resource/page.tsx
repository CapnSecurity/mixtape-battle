"use client";

import React, { useState } from 'react';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

export default function AddSongResourcePage() {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    youtubeUrl: '',
    songsterrGuitarUrl: '',
    songsterrBassUrl: '',
    lyricsUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: Send to API endpoint
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto p-6 rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] mt-8">
      <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Add Song / Resource Links</h1>
      {submitted ? (
        <div className="text-[var(--gold)] font-semibold">Submitted! (Not yet saved to DB)</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="title" placeholder="Song Title" value={form.title} onChange={handleChange} required />
          <Input name="artist" placeholder="Artist" value={form.artist} onChange={handleChange} required />
          <Input name="youtubeUrl" placeholder="YouTube Link" value={form.youtubeUrl} onChange={handleChange} />
          <Input name="songsterrGuitarUrl" placeholder="Guitar Tab Link" value={form.songsterrGuitarUrl} onChange={handleChange} />
          <Input name="songsterrBassUrl" placeholder="Bass Tab Link" value={form.songsterrBassUrl} onChange={handleChange} />
          <Input name="lyricsUrl" placeholder="Lyrics Link" value={form.lyricsUrl} onChange={handleChange} />
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      )}
    </div>
  );
}
