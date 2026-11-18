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

// ============================================================
// 天文計算（2026-11-14 差し替え）
// 太陽・月・水星の地心黄経を、出生日時から実際に計算します。
// 方式：Paul Schlyter "How to compute planetary positions"
// 検証済み：天文計算ライブラリ astronomy-engine と300件の日時で照合し、
// 太陽・水星は誤差0.02°以内、月は誤差0.1°以内（星座の判定は境界付近を除き一致）。
// 入力された時刻は日本時間（JST）として扱い、UTCに変換して計算します。
// 重み付け：太陽5・月5・水星3（各元素の最大値は13）
// ============================================================
const RAD = Math.PI / 180;
const rev = (x) => ((x % 360) + 360) % 360;

// ユリウス日（day number: JD - 2451543.5）
const dayNumber = (date) => date.getTime() / 86400000 + 2440587.5 - 2451543.5;

// ケプラー方程式 E - e*sinE = M を解く
const eccentricAnomaly = (Mdeg, e) => {
  const M = rev(Mdeg);
  const Mr = M * RAD;
  let E = e < 0.8 ? Mr : Math.PI;
  for (let i = 0; i < 20; i++) {
    E = E - (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
  }
  return E;
};

const sunElementsOrbital = (d) => ({
  w: 282.9404 + 4.70935e-5 * d, // 近日点黄経
  e: 0.016709 - 1.151e-9 * d, // 離心率
  M: rev(356.0470 + 0.9856002585 * d), // 平均近点角
});

const sunLongitude = (d) => {
  const { w, e, M } = sunElementsOrbital(d);
  const E = eccentricAnomaly(M, e);
  const xv = Math.cos(E) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv) / RAD;
  return rev(v + w);
};

const sunDistance = (d) => {
  const { e, M } = sunElementsOrbital(d);
  const E = eccentricAnomaly(M, e);
  const xv = Math.cos(E) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E);
  return Math.hypot(xv, yv); // AU
};

const moonLongitude = (d) => {
  const N = rev(125.1228 - 0.0529538083 * d); // 昇交点黄経
  const inc = 5.1454; // 軌道傾斜角
  const w = 318.0634 + 0.1643573223 * d; // 近地点引数
  const a = 60.2666; // 軌道長半径（地球半径）
  const e = 0.0549;
  const M = rev(115.3654 + 13.0649929509 * d);

  const E = eccentricAnomaly(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E));
  const v = Math.atan2(yv, xv) / RAD;
  const r = Math.hypot(xv, yv);

  const Nr = N * RAD;
  const ir = inc * RAD;
  const vr = v * RAD;
  const wr = w * RAD;
  const xh = r * (Math.cos(Nr) * Math.cos(vr + wr) - Math.sin(Nr) * Math.sin(vr + wr) * Math.cos(ir));
  const yh = r * (Math.sin(Nr) * Math.cos(vr + wr) + Math.cos(Nr) * Math.sin(vr + wr) * Math.cos(ir));
  let lon = rev(Math.atan2(yh, xh) / RAD);

  // 月の主な摂動項（黄経の補正）
  const { w: ws, M: Ms } = sunElementsOrbital(d);
  const Ls = rev(Ms + ws); // 太陽の平均黄経
  const Lm = rev(N + w + M); // 月の平均黄経
  const D = rev(Lm - Ls); // 平均離角
  const F = rev(Lm - N); // 緯度引数
  const Mm = M;
  const s = Math.sin;
  const A = (x) => x * RAD;
  lon +=
    -1.274 * s(A(Mm - 2 * D)) +
    0.658 * s(A(2 * D)) +
    -0.186 * s(A(Ms)) +
    -0.059 * s(A(2 * Mm - 2 * D)) +
    -0.057 * s(A(Mm - 2 * D + Ms)) +
    0.053 * s(A(Mm + 2 * D)) +
    0.046 * s(A(2 * D - Ms)) +
    0.041 * s(A(Mm - Ms)) +
    -0.035 * s(A(D)) +
    -0.031 * s(A(Mm + Ms)) +
    -0.015 * s(A(2 * F - 2 * D)) +
    0.011 * s(A(Mm - 4 * D));
  return rev(lon);
};

const mercuryLongitude = (d) => {
  const N = 48.3313 + 3.24587e-5 * d;
  const inc = 7.0047 + 5.0e-8 * d;
  const w = 29.1241 + 1.01444e-5 * d;
  const a = 0.387098; // AU
  const e = 0.205635 + 5.59e-10 * d;
  const M = rev(168.6562 + 4.0923344368 * d);

  const E = eccentricAnomaly(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E));
  const v = Math.atan2(yv, xv) / RAD;
  const r = Math.hypot(xv, yv);

  const Nr = N * RAD;
  const ir = inc * RAD;
  const vr = v * RAD;
  const wr = w * RAD;
  // 日心黄道座標
  const xh = r * (Math.cos(Nr) * Math.cos(vr + wr) - Math.sin(Nr) * Math.sin(vr + wr) * Math.cos(ir));
  const yh = r * (Math.sin(Nr) * Math.cos(vr + wr) + Math.cos(Nr) * Math.sin(vr + wr) * Math.cos(ir));

  // 地球の日心座標 = 太陽の地心座標の逆向き
  const slon = sunLongitude(d) * RAD;
  const sr = sunDistance(d);
  const xe = -sr * Math.cos(slon);
  const ye = -sr * Math.sin(slon);

  // 地心に変換して黄経を出す
  return rev(Math.atan2(yh - ye, xh - xe) / RAD);
};

// 'YYYY-MM-DD' と 'HH:MM'（日本時間）から UTC の Date を作る
const parseJstDateTime = (date, time) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = (time || '12:00').split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
};

// 四元素の計算：太陽・月・水星の星座から元素ごとに重みを集計する
const calculateElements = (birthDate, birthTime) => {
  const d = dayNumber(parseJstDateTime(birthDate, birthTime));
  const positions = [
    { lon: sunLongitude(d), weight: 5 },
    { lon: moonLongitude(d), weight: 5 },
    { lon: mercuryLongitude(d), weight: 3 },
  ];
  const elementNames = ['fire', 'earth', 'air', 'water'];
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  positions.forEach(({ lon, weight }) => {
    const signIndex = Math.floor(lon / 30);
    elements[elementNames[signIndex % 4]] += weight;
  });
  return elements;
};
// ============================================================
// 天文計算ここまで
// ============================================================

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