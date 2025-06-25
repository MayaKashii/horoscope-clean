'use client';
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const HoroscopeService = () => {
const [parentBirthDate, setParentBirthDate] = useState('');
const [parentBirthTime, setParentBirthTime] = useState('');
const [childBirthDate, setChildBirthDate] = useState('');
const [childBirthTime, setChildBirthTime] = useState('');
const [chartData, setChartData] = useState(null);
const [loading, setLoading] = useState(false);

// 四元素の計算ロジック（実際の計算ロジックに置き換え）
const calculateElements = (birthDate, birthTime) => {
// ここに実際の計算ロジックを実装
return {
fire: Math.floor(Math.random() * 10) + 1,
earth: Math.floor(Math.random() * 10) + 1,
air: Math.floor(Math.random() * 10) + 1,
water: Math.floor(Math.random() * 10) + 1
};
};

const generateChart = async () => {
if (!parentBirthDate || !childBirthDate) {
alert('生年月日を入力してください');
return;
}


setLoading(true);
try {
  const parentElements = calculateElements(parentBirthDate, parentBirthTime);
  const childElements = calculateElements(childBirthDate, childBirthTime);

  const data = [
    { 
      subject: '風 (思考)',
      child: childElements.air,
      parent: parentElements.air,
      fullMark: 15 
    },
    { 
      subject: '火 (直感)',
      child: childElements.fire,
      parent: parentElements.fire,
      fullMark: 15 
    },
    { 
      subject: '水 (感情)',
      child: childElements.water,
      parent: parentElements.water,
      fullMark: 15 
    },
    { 
      subject: '土 (感覚)',
      child: childElements.earth,
      parent: parentElements.earth,
      fullMark: 15 
    }
  ];

  setChartData(data);
} catch (error) {
  alert('計算中にエラーが発生しました');
  console.error(error);
} finally {
  setLoading(false);
}


};

return (
<div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
<div style={{
border: '1px solid #e5e7eb',
borderRadius: '8px',
padding: '24px',
backgroundColor: 'white',
boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}}>
<h1 style={{
fontSize: '24px',
fontWeight: 'bold',
textAlign: 'center',
marginBottom: '24px'
}}>
親子の四元素診断
</h1>

```
    {/* 入力フォーム */}
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px' 
          }}>
            親の生年月日
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={parentBirthDate}
            onChange={(e) => setParentBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px' 
          }}>
            親の出生時刻（任意）
          </label>
          <input
            type="time"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={parentBirthTime}
            onChange={(e) => setParentBirthTime(e.target.value)}
          />
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px' 
          }}>
            子の生年月日
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={childBirthDate}
            onChange={(e) => setChildBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px' 
          }}>
            子の出生時刻（任意）
          </label>
          <input
            type="time"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={childBirthTime}
            onChange={(e) => setChildBirthTime(e.target.value)}
          />
        </div>
      </div>

      <button
        style={{
          width: '100%',
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
        onClick={generateChart}
        disabled={loading}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {loading ? '計算中...' : '診断する'}
      </button>
    </div>

    {/* チャート表示 */}
    {chartData && (
      <div>
        <div style={{ height: '500px', width: '100%', marginBottom: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              
              <Radar
                name="子"
                dataKey="child"
                stroke="#D4A5A5"
                fill="#D4A5A5"
                fillOpacity={0.5}
              />
              
              <Radar
                name="親"
                dataKey="parent"
                stroke="#9E7676"
                fill="#9E7676"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 解説エリア */}
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            診断結果の解説
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginBottom: '16px' 
          }}>
            このグラフは親子それぞれの四元素バランスを表しています。
            重なり合う部分は共感しやすい領域、異なる部分は互いに補い合える可能性を示しています。
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            fontSize: '14px'
          }}>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                共通点
              </h4>
              <p style={{ color: '#6b7280' }}>
                似た傾向が見られる要素があり、互いの気持ちが理解しやすい関係性です。
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                相違点
              </h4>
              <p style={{ color: '#6b7280' }}>
                異なる要素も見られ、新しい視点を提供し合える可能性があります。
              </p>
            </div>
          </div>
        </div>

        {/* LINE共有ボタン */}
        <div style={{ textAlign: 'center' }}>
          <button 
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#16a34a';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#22c55e';
            }}
          >
            LINEで詳しい解説を見る
          </button>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '8px' 
          }}>
            ※ LINE登録で詳しい解説とアドバイスをお届けします
          </p>
        </div>
      </div>
    )}
  </div>
</div>


);
};

export default HoroscopeService;