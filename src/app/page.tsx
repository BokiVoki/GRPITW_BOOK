import React from 'react';
import Image from "next/image";
import Link from 'next/link';

const HomePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>도서 관리 및 위치 검색</h1>
      </header>
      <section style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="도서 검색..." style={{ width: '100%', padding: '10px' }} />
      </section>
      <section style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Link href="/next-page">
          <button style={{ padding: '10px 20px' }}>도서 위치</button>
        </Link>
        <button style={{ padding: '10px 20px' }}>공지</button>
      </section>
    </div>
  );
};

export default HomePage;
