import React, { useState } from 'react';

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
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Song / Resource Links</h1>
      {submitted ? (
        <div className="text-green-600 font-semibold">Submitted! (Not yet saved to DB)</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" placeholder="Song Title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="artist" placeholder="Artist" value={form.artist} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="youtubeUrl" placeholder="YouTube Link" value={form.youtubeUrl} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="songsterrGuitarUrl" placeholder="Guitar Tab Link" value={form.songsterrGuitarUrl} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="songsterrBassUrl" placeholder="Bass Tab Link" value={form.songsterrBassUrl} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="lyricsUrl" placeholder="Lyrics Link" value={form.lyricsUrl} onChange={handleChange} className="w-full border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        </form>
      )}
    </div>
  );
}
