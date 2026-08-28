'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const isAuthReturn = hash.includes('access_token=') || hash.includes('type=recovery') || hash.includes('type=invite') || search.includes('code=');
    window.location.replace(isAuthReturn ? `/primeiro-acesso${search}${hash}` : '/login');
  }, []);
  return <main style={{ padding: 32 }}>Validando acesso…</main>;
}
