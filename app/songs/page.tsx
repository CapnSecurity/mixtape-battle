import { Suspense } from 'react';
import SongBrowser from "@/src/components/SongBrowser";

export default function SongsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading songs...</div>}>
      <SongBrowser />
    </Suspense>
  );
}
