'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function userData() {
      try {
        const req = await axios.get('http://localhost:3000/api/users');
        setUser(req.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    userData();
  }, []);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {error}</h1>;

  return (
    <>
      <h1>User Data:</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}
