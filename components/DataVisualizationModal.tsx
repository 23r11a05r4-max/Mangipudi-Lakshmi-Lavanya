
import React, { useMemo, useState, useEffect } from 'react';
import { NewsItem, Vote } from '../types';
import { CloseIcon, ChartBarIcon, LocationIcon } from './icons';

interface DataVisualizationModalProps {
  item: NewsItem;
  onClose: () => void;
}

type ViewType = 'map' | 'pie' | 'line';

// Helper components for charts, defined within the modal file for simplicity

const PieChart: React.FC<{ data: { real: number, fake: number } }> = ({ data }) => {
    const total = data.real + data.fake;
    if (total === 0) return <div className="flex items-center justify-center h-full text-gray-500">No votes to display</div>;
    
    const realPercent = data.real / total;
    const realAngle = realPercent * 360;
    
    const getCoords = (percent: number) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];
    const [realX, realY] = getCoords(realPercent);
    const largeArcFlag = realPercent > 0.5 ? 1 : 0;

    const pathData = `M 1 0 A 1 1 0 ${largeArcFlag} 1 ${realX} ${realY} L 0 0`;

    return (
        <div className="flex flex-col items-center justify-center p-4 h-full">
            <svg viewBox="-1 -1 2 2" className="w-48 h-48 transform -rotate-90">
                <path d={pathData} fill="#F56565" />
                <path d={`M ${realX} ${realY} A 1 1 0 ${1-largeArcFlag} 1 1 0 L 0 0`} fill="#48BB78" />
            </svg>
            <div className="mt-4 text-center">
                <p className="font-bold text-2xl text-white">{total} Total Votes</p>
                <div className="flex gap-4 mt-2">
                    <p><span className="font-semibold text-green-400">Real:</span> {data.real} ({(realPercent * 100).toFixed(1)}%)</p>
                    <p><span className="font-semibold text-red-400">Fake:</span> {data.fake} ({((1-realPercent) * 100).toFixed(1)}%)</p>
                </div>
            </div>
        </div>
    );
}

const LineGraph: React.FC<{ votes: Vote[] }> = ({ votes }) => {
    const dataByDay = useMemo(() => {
        if (votes.length === 0) return [];
        const sortedVotes = [...votes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const dayMap = new Map<string, {real: number, fake: number}>();
        
        sortedVotes.forEach(vote => {
            const day = new Date(vote.timestamp).toISOString().split('T')[0];
            if (!dayMap.has(day)) dayMap.set(day, { real: 0, fake: 0 });
            const counts = dayMap.get(day)!;
            if(vote.isReal) counts.real++; else counts.fake++;
        });

        let cumulativeReal = 0;
        let cumulativeFake = 0;
        return Array.from(dayMap.entries()).map(([day, counts]) => {
            cumulativeReal += counts.real;
            cumulativeFake += counts.fake;
            return { day, real: cumulativeReal, fake: cumulativeFake };
        });
    }, [votes]);

    if(dataByDay.length < 2) return <div className="flex items-center justify-center h-full text-gray-500">Need votes over multiple days to show a trend</div>;

    const width = 500, height = 300, padding = 40;
    const maxVal = Math.max(...dataByDay.map(d => d.real), ...dataByDay.map(d => d.fake));
    const pointToSvg = (val: number, index: number) => ({
        x: padding + index * ((width - 2 * padding) / (dataByDay.length - 1)),
        y: (height - padding) - (val / maxVal) * (height - 2 * padding)
    });
    
    const realPath = dataByDay.map((d, i) => {
        const {x, y} = pointToSvg(d.real, i);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

    const fakePath = dataByDay.map((d, i) => {
        const {x, y} = pointToSvg(d.fake, i);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

    return (
        <div className="p-4 h-full flex flex-col items-center">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Cumulative Votes Over Time</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="gray" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="gray" />
                <text x={width / 2} y={height - 5} textAnchor="middle" fill="gray" fontSize="10">Time</text>
                <text x={10} y={height/2} transform={`rotate(-90, 15, ${height/2})`} textAnchor="middle" fill="gray" fontSize="10">Votes</text>
                <text x={padding} y={padding - 5} fill="gray" fontSize="10">{maxVal}</text>

                {/* Paths */}
                <path d={realPath} fill="none" stroke="#48BB78" strokeWidth="2" />
                <path d={fakePath} fill="none" stroke="#F56565" strokeWidth="2" />

                {/* Points */}
                {dataByDay.map((d, i) => <circle key={`r-${i}`} {...pointToSvg(d.real, i)} r="3" fill="#48BB78" />)}
                {dataByDay.map((d, i) => <circle key={`f-${i}`} {...pointToSvg(d.fake, i)} r="3" fill="#F56565" />)}
            </svg>
            <div className="flex gap-4 text-sm mt-2">
                <div><span className="w-3 h-3 inline-block bg-green-500 rounded-full mr-1"></span>Real</div>
                <div><span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span>Fake</div>
            </div>
        </div>
    );
}

// Main component starts here
const DataVisualizationModal: React.FC<DataVisualizationModalProps> = ({ item, onClose }) => {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('map');

  const { aggregatedData, totalReal, totalFake } = useMemo(() => {
    const data: Record<string, { real: number; fake: number; total: number }> = {};
    let totalR = 0, totalF = 0;
    item.votes.forEach(vote => {
      const locationKey = vote.location || 'Unknown';
      if (!data[locationKey]) {
        data[locationKey] = { real: 0, fake: 0, total: 0 };
      }
      if (vote.isReal) { data[locationKey].real++; totalR++; } 
      else { data[locationKey].fake++; totalF++; }
      data[locationKey].total++;
    });
    const sortedData = Object.entries(data).sort(([,a], [,b]) => b.total - a.total);
    return { aggregatedData: sortedData, totalReal: totalR, totalFake: totalF };
  }, [item.votes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const mapWidth = 400, mapHeight = 300;
  const simpleHashCode = (str: string) => { let h = 0; for(let i=0;i<str.length;i++) h=(h<<5)-h+str.charCodeAt(i),h|=0; return Math.abs(h); };

  const renderView = () => {
    switch(activeView) {
        case 'pie': return <PieChart data={{ real: totalReal, fake: totalFake }} />;
        case 'line': return <LineGraph votes={item.votes} />;
        case 'map':
        default: return (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-gray-200">Breakdown by Location</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {aggregatedData.length > 0 ? aggregatedData.map(([location, data]) => {
                          const realPercent = (data.real / data.total) * 100;
                          return (
                            <div key={location} onMouseEnter={() => setHoveredLocation(location)} onMouseLeave={() => setHoveredLocation(null)} className="p-2 rounded-md transition-colors hover:bg-gray-700/50">
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium text-gray-300">{location}</span>
                                <span className="text-xs text-gray-400">{data.total} vote(s)</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-4 flex overflow-hidden border-2 border-gray-900/50">
                                <div className="bg-green-500 h-full" style={{ width: `${realPercent}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${100 - realPercent}%` }}></div>
                              </div>
                            </div>
                          )
                        }) : <p className="text-gray-500 italic p-2">No votes have been cast yet.</p>}
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-gray-200">Geographic Distribution</h3>
                    <div className="relative bg-gray-900/50 rounded-lg p-2 aspect-[4/3]">
                       <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full">
                         <rect width={mapWidth} height={mapHeight} fill="#1A202C" rx="8" />
                         {aggregatedData.map(([location, data]) => {
                           const cx = (simpleHashCode(location) % (mapWidth-60))+30, cy = (simpleHashCode(location+'_s') % (mapHeight-60))+30;
                           const radius = Math.min(8+data.total*1.5, 35);
                           const majorityColor = data.real>data.fake ? '#48BB78' : (data.fake>data.real ? '#F56565' : '#F6E05E');
                           return <g key={location} onMouseEnter={() => setHoveredLocation(location)} onMouseLeave={() => setHoveredLocation(null)} className="cursor-pointer"><circle cx={cx} cy={cy} r={radius} fill={majorityColor} fillOpacity={0.7} stroke={hoveredLocation===location?"white":"#1A202C"} strokeWidth="2" className="transition-all" /></g>;
                         })}
                       </svg>
                       {aggregatedData.filter(([l])=>hoveredLocation===l).map(([location,data])=>{
                           const cx = (simpleHashCode(location) % (mapWidth - 60)) + 30, cy = (simpleHashCode(location + '_s') % (mapHeight - 60)) + 30;
                           return <div key={location} className="absolute bg-gray-700 p-2 rounded-lg text-xs border border-gray-600 shadow-lg pointer-events-none text-white" style={{ left:`${(cx/mapWidth)*100}%`, top:`${(cy/mapHeight)*100}%`, transform:'translate(-50%,-120%)' }}><p className="font-bold mb-1">{location}</p><p>Total: {data.total}</p><p className="text-green-400">Real: {data.real}</p><p className="text-red-400">Fake: {data.fake}</p></div>
                       })}
                    </div>
                </div>
             </div>
        );
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="vis-modal-title" className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
          <div className="flex-grow min-w-0">
            <h2 id="vis-modal-title" className="text-xl font-bold text-white truncate pr-4">Vote Analytics: <span className="text-blue-300">{item.title}</span></h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal"><CloseIcon /></button>
        </header>

        <nav className="p-2 border-b border-gray-700">
            <div className="flex justify-center items-center bg-gray-900/50 rounded-lg p-1 w-max mx-auto">
                <button onClick={() => setActiveView('map')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'map' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Map View</button>
                <button onClick={() => setActiveView('pie')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'pie' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Pie Chart</button>
                <button onClick={() => setActiveView('line')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'line' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Trend Line</button>
            </div>
        </nav>

        <main className="p-4 md:p-6 flex-grow">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default DataVisualizationModal;
