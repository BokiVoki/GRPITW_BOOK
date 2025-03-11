import React from 'react';
import Image from 'next/image';

const NextPage = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '200px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <input type="text" placeholder="검색..." style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />
        <Image src="/barcode-icon.png" alt="바코드" width={30} height={30} />
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button style={{ padding: '10px' }}>☰</button>
          <div>
            <button style={{ marginRight: '10px' }}>1층</button>
            <button>2층</button>
          </div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {/* 도서의 위치를 표현하는 셀들 */}
          <div style={{ border: '1px solid #ccc', padding: '20px' }}>셀 1</div>
          <div style={{ border: '1px solid #ccc', padding: '20px' }}>셀 2</div>
          <div style={{ border: '1px solid #ccc', padding: '20px' }}>셀 3</div>
          {/* 추가 셀들 */}
        </div>
      </main>
    </div>
  );
};


export default NextPage;