"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const NextPage = () => {
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionTitles, setSectionTitles] = useState<Record<'H' | 'I' | 'J' | 'A' | 'B' | 'C' | 'D' | 'EF' | 'G', string>>({
    H: 'H',
    I: '외서',
    J: '그래픽노블/그림책',
    A: '아트북 DP',
    B: '아트북 DP',
    C: '아트북 DP',
    D: 'DP',
    EF: '시리즈물',
    G: '아트북 재고'
  });

  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  const [buttonTexts, setButtonTexts] = useState<Record<string, string>>({});

  const [modalTitle, setModalTitle] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTitles = localStorage.getItem('sectionTitles');
      if (savedTitles) {
        setSectionTitles(JSON.parse(savedTitles));
      }

      const savedTexts = localStorage.getItem('buttonTexts');
      if (savedTexts) {
        setButtonTexts(JSON.parse(savedTexts));
      }
    }
  }, []);

  const handleButtonClick = async (buttonLabel: string) => {
    const labelWithoutText = buttonLabel.split('(')[0];
    setModalTitle(labelWithoutText);
    try {
      const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/1iVl2mZeRkEz7vQQBQfnpo1pyizQtOcUW5eseYSCMe78/values/ITW_GPR_BOOK!A:K?key=AIzaSyDdo9b8dcUV3yB0gVt8mQZr1XyrIdfUPbk`);
      const data: string[][] = response.data.values;
      console.log('Fetched data:', data);
      const items = data.filter((row: string[]) => row[7] === `B1-${labelWithoutText}`);
      console.log('Found items:', items);
      if (items.length > 0) {
        const seriesMap: Record<string, number[]> = {};
        items.forEach(item => {
          const seriesName = item[1].replace(/\d+$/, '').trim();
          const volume = item[1].match(/\d+$/);
          const volumeNumber = volume ? parseInt(volume[0], 10) : NaN;
          if (!seriesMap[seriesName]) {
            seriesMap[seriesName] = [];
          }
          seriesMap[seriesName].push(volumeNumber);
        });

        const formattedItems = Object.entries(seriesMap).map(([seriesName, volumes]) => {
          const minVolume = Math.min(...volumes);
          const maxVolume = Math.max(...volumes);
          return `${seriesName} ${minVolume}~${maxVolume}`;
        });

        setItemNames(formattedItems);
        setIsModalOpen(true);
        console.log('Modal state set to open');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTitleChange = (key: keyof typeof sectionTitles, newTitle: string) => {
    setSectionTitles(prevTitles => {
      const updatedTitles = { ...prevTitles, [key]: newTitle };
      localStorage.setItem('sectionTitles', JSON.stringify(updatedTitles));
      return updatedTitles;
    });
  };

  const toggleEditTitle = (key: string) => {
    setEditingTitle(prev => (prev === key ? null : key));
  };

  const handleButtonTextChange = (key: string, newText: string) => {
    setButtonTexts(prevTexts => {
      const updatedTexts = { ...prevTexts, [key]: newText };
      localStorage.setItem('buttonTexts', JSON.stringify(updatedTexts));
      return updatedTexts;
    });
  };

  const renderButtonText = (label: string, isToolbar: boolean = false) => (
    <span>
      {label}
      {!isToolbar && (
        <>
          (
          <input
            type="text"
            value={buttonTexts[label] || ''}
            onChange={(e) => handleButtonTextChange(label, e.target.value)}
            onBlur={() => setEditingTitle(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingTitle(null);
              }
            }}
            style={{ width: `${buttonTexts[label]?.length || 1}ch`, border: 'none', outline: 'none' }}
          />
          )
        </>
      )}
    </span>
  );

  const renderSectionTitle = (key: keyof typeof sectionTitles) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', marginBottom: '10px' }}>
      {editingTitle === key ? (
        <input
          type="text"
          value={sectionTitles[key]}
          onChange={(e) => handleTitleChange(key, e.target.value)}
          onBlur={() => setEditingTitle(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingTitle(null);
            }
          }}
          style={{ backgroundColor: '#000', color: '#fff', padding: '5px', width: '100%', textAlign: 'center', border: 'none', outline: 'none' }}
        />
      ) : (
        <h3 style={{ backgroundColor: '#000', color: '#fff', padding: '5px', width: '100%', textAlign: 'center', margin: 0 }}>{sectionTitles[key]}</h3>
      )}
      <button onClick={() => toggleEditTitle(key)} style={{ marginLeft: '5px', padding: '2px 5px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer' }}>✎</button>
    </div>
  );

  const ItemType = {
    ITEM: 'item',
  };

  const DraggableItem = ({ name, index }: { name: string; index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag({
      type: ItemType.ITEM,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    useEffect(() => {
      if (isDragging) {
        setIsModalOpen(false); // Close the modal when dragging starts
      }
    }, [isDragging]);

    drag(ref);

    return (
      <div ref={ref} style={{ padding: '5px', border: '1px solid #ccc', marginBottom: '5px', cursor: 'move' }}>
        {name}
      </div>
    );
  };

  const DroppableArea = ({ children, onDrop }: { children: React.ReactNode; onDrop: (index: number) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop({
      accept: ItemType.ITEM,
      drop: (item: { index: number }) => onDrop(item.index),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drop(ref);

    return (
      <div ref={ref} style={{ minHeight: '100px', border: '1px dashed #ccc', padding: '10px', backgroundColor: isOver ? '#f0f0f0' : '#fff' }}>
        {children}
      </div>
    );
  };

  const handleDrop = async (fromIndex: number, toButtonLabel: string) => {
    // Update the local state
    const movedItem = itemNames[fromIndex];
    setItemNames((prev) => prev.filter((_, index) => index !== fromIndex));

    // 그룹화된 데이터 풀어내기
    const individualItems = expandGroupedItem(movedItem);
    
    // Update Google Sheets via API
    try {
      console.log('Sending data to API:', { individualItems, toButtonLabel });
      
      // 각 개별 항목에 대해 API 호출
      for (const item of individualItems) {
        const response = await fetch('/api/update-google-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movedItem: item, toButtonLabel }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(`Failed to update Google Sheets: ${errorData.message}`);
        }

        const data = await response.json();
        console.log('API response for item', item, ':', data);
      }
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      // 실패 시 UI에 알림 표시 또는 다른 처리 추가
    }
  };

  // 그룹화된 항목을 개별 항목으로 풀어내는 함수
  const expandGroupedItem = (groupedItem: string): string[] => {
    // "꽃보다 남자 완전판 11~20" 형식 확인
    const match = groupedItem.match(/^(.*?)(\d+)~(\d+)$/);
    
    if (match) {
      const [, prefix, startStr, endStr] = match;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      // 범위 내의 모든 항목 생성
      const items: string[] = [];
      for (let i = start; i <= end; i++) {
        items.push(`${prefix}${i}`);
      }
      return items;
    }
    
    // 그룹화되지 않은 항목은 그대로 반환
    return [groupedItem];
  };

  const DroppableButton = ({ label, onDrop }: { label: string; onDrop: (index: number) => void }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [{ isOver }, drop] = useDrop({
      accept: ItemType.ITEM,
      drop: (item: { index: number }) => onDrop(item.index),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drop(ref);

    return (
      <button
        ref={ref}
        style={{
          flex: '1',
          padding: '5px',
          border: '1px solid #000',
          borderTop: label.includes('1') ? '1px solid transparent' : '1px solid #000',
          borderBottom: label.includes('1') ? '1px solid transparent' : '1px solid #000',
          backgroundColor: isOver ? '#e0e0e0' : '#fff',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
          marginBottom: '5px',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        onClick={() => handleButtonClick(label)}
      >
        {renderButtonText(label, true)}
      </button>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#000', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ fontWeight: 'bold' }}>{modalTitle}</h2>
              <DroppableArea onDrop={(fromIndex) => handleDrop(fromIndex, modalTitle)}>
                {itemNames.map((name, index) => (
                  <DraggableItem key={index} name={name} index={index} />
                ))}
              </DroppableArea>
              <button onClick={closeModal} style={{ marginTop: '10px', padding: '5px 10px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer' }}>닫기</button>
            </div>
          </div>
        )}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderBottom: '1px solid #ccc', backgroundColor: '#fff', zIndex: 1000 }}>
          <button style={{ fontSize: '24px', border: 'none', background: 'none' }}>≡</button>
          <div>
            {['B1', '1', '2', '3', 'OF'].map(label => (
              <button key={label} style={{ margin: '0 5px', padding: '5px 10px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer', transition: 'background-color 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                onClick={() => handleButtonClick(label)}>
                {renderButtonText(label, true)}
              </button>
            ))}
          </div>
          <div>
            <input type="text" placeholder="검색..." style={{ marginRight: '10px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button style={{ padding: '5px 10px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer', transition: 'background-color 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
              검색
            </button>
            <button style={{ padding: '5px 10px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer', transition: 'background-color 0.3s', marginLeft: '10px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
              바코드
            </button>
          </div>
        </header>
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(3, auto)', padding: '10px', gap: '10px 20px', marginTop: '60px' }}>
          {/* 상단 왼쪽 섹션 */}
          <section style={{ gridColumn: '1', gridRow: '1 / span 2', border: '1px solid #000', backgroundColor: '#fff', padding: '10px', marginRight: '20px' }}>
            <h3>{renderSectionTitle('H')}</h3>
            <div style={{ display: 'flex', height: 'calc(100% - 40px)' }}>
              <div style={{ flex: '2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].map(label => (
                  <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
                ))}
              </div>
            </div>
          </section>
          {/* 외서 섹션 */}
          <section style={{ gridColumn: '2', gridRow: '1', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('I')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['I1', 'I2', 'I3', 'I4', 'I5'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 그래픽노블/그림책 섹션 */}
          <section style={{ gridColumn: '3', gridRow: '1', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('J')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 아트북 DP 섹션 (A1 포함) */}
          <section style={{ gridColumn: '5', gridRow: '1', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('A')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 아트북 DP 섹션 (B1 포함) */}
          <section style={{ gridColumn: '6', gridRow: '2', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('B')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 아트북 재고 섹션 */}
          <section style={{ gridColumn: '1', gridRow: '3', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('G')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['G1', 'G2', 'G3', 'G4', 'G5', 'G6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 시리즈물 섹션 */}
          <section style={{ gridColumn: '2 / span 2', gridRow: '3', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('EF')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              <div style={{ flex: '1', marginRight: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(label => (
                  <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
                ))}
              </div>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {['E1', 'E2', 'E3', 'E4', 'E5', 'E6'].map(label => (
                  <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
                ))}
              </div>
            </div>
          </section>
          {/* DP 섹션 */}
          <section style={{ gridColumn: '4', gridRow: '3', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('D')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
          {/* 아트북 DP 섹션 (C1 포함) */}
          <section style={{ gridColumn: '5', gridRow: '3', border: '1px solid #000', backgroundColor: '#fff', padding: '10px' }}>
            <h3>{renderSectionTitle('C')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 40px)' }}>
              {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map(label => (
                <DroppableButton key={label} label={label} onDrop={(fromIndex) => handleDrop(fromIndex, label)} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </DndProvider>
  );
};

export default NextPage; 