import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import { getCategory } from '../data/categories';
import { getBranch } from '../data/mockData';
import { BAKU_CENTER } from '../data/areas';
import { formatAZN, formatDistance } from '../lib/utils';
import { courseDistanceKm } from '../lib/search';
import { RatingStars } from './RatingStars';
import { Badge } from './Badge';
import { Button } from './Button';
import { useAppStore } from '../store/useAppStore';

function categoryIcon(color: string, icon: string, promoted: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${promoted ? 40 : 34}px;height:${promoted ? 40 : 34}px;
      background:${color};border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      border:${promoted ? '3px solid #d4a017' : '2px solid white'};
    "><span style="transform:rotate(45deg);font-size:${promoted ? 18 : 15}px;">${icon}</span></div>`,
    iconSize: [promoted ? 40 : 34, promoted ? 40 : 34],
    iconAnchor: [promoted ? 20 : 17, promoted ? 40 : 34],
    popupAnchor: [0, -30],
  });
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapEvents({ onMoved }: { onMoved: () => void }) {
  useMapEvents({ moveend: onMoved, zoomend: onMoved });
  return null;
}

function FlyToUser({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 0.8 });
  }, [coords, map]);
  return null;
}

export function CourseMap({ courses, height = '100%' }: { courses: Course[]; height?: string }) {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const userCoords: [number, number] | null = currentUser?.location ? [currentUser.location.lat, currentUser.location.lng] : null;
  const center = userCoords ?? BAKU_CENTER;

  const byBranch = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of courses) {
      const list = map.get(c.branchId) ?? [];
      list.push(c);
      map.set(c.branchId, list);
    }
    return map;
  }, [courses]);

  const selectedCourses = selectedBranchId ? byBranch.get(selectedBranchId) ?? [] : [];
  const selectedBranch = selectedBranchId ? getBranch(selectedBranchId) : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        ref={(m) => { mapRef.current = m; }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMoved={() => setMoved(true)} />
        {userCoords && <FlyToUser coords={userCoords} />}
        {userCoords && <Marker position={userCoords} icon={userIcon} />}
        {[...byBranch.entries()].map(([branchId, list]) => {
          const branch = getBranch(branchId);
          if (!branch) return null;
          const primary = list.slice().sort((a, b) => Number(b.promoted) - Number(a.promoted))[0];
          const category = getCategory(primary.categoryId);
          return (
            <Marker
              key={branchId}
              position={[branch.lat, branch.lng]}
              icon={categoryIcon(category?.color ?? '#111827', category?.icon ?? '📍', primary.promoted)}
              eventHandlers={{ click: () => setSelectedBranchId(branchId) }}
            />
          );
        })}
      </MapContainer>

      {moved && (
        <button
          onClick={() => setMoved(false)}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-ink-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
        >
          🔄 Bu ərazidə axtar
        </button>
      )}

      {selectedBranch && selectedCourses.length > 0 && (
        <div className="absolute left-3 right-3 bottom-3 z-[1000]">
          {selectedCourses.length === 1 ? (
            <CoursePreviewCard course={selectedCourses[0]} onClose={() => setSelectedBranchId(null)} />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-3 max-h-64 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-ink-900">{selectedBranch.name} — {selectedCourses.length} kurs</p>
                <button onClick={() => setSelectedBranchId(null)} className="text-ink-400">✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {selectedCourses.map((c) => (
                  <button key={c.id} onClick={() => navigate(`/app/course/${c.id}`)} className="flex items-center justify-between text-left px-3 py-2 rounded-xl bg-ink-50 hover:bg-ink-100">
                    <span className="text-sm font-semibold text-ink-800 truncate">{c.title}</span>
                    <span className="text-xs font-bold text-ink-900 shrink-0 ml-2">{formatAZN(c.discountPrice ?? c.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CoursePreviewCard({ course, onClose }: { course: Course; onClose: () => void }) {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const category = getCategory(course.categoryId);
  const distance = courseDistanceKm(course, currentUser?.location ?? null);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-3 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${category?.color}1a` }}>
          {course.photos[0] ?? category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: category?.color }}>{category?.name.az}</p>
              <h3 className="font-bold text-sm text-ink-900 truncate">{course.title}</h3>
            </div>
            <button onClick={onClose} className="text-ink-400 shrink-0">✕</button>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            {distance !== null && <span className="text-xs text-ink-400">• {formatDistance(distance)}</span>}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {course.qargaExclusive && <Badge tone="gold">Endirim</Badge>}
            {course.freeTrial && <Badge tone="teal">Pulsuz sınaq</Badge>}
            <Badge tone="neutral">{course.seatsAvailable} yer</Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/app/course/${course.id}`)}>Ətraflı bax</Button>
        <Button size="sm" fullWidth onClick={() => navigate(`/app/register/${course.id}`)}>Qeydiyyat</Button>
      </div>
    </div>
  );
}
