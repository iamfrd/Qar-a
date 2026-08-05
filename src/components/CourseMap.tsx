import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import type { CategoryInfo, OfferingSummary } from '../lib/api';
import { formatMinor } from '../lib/api';
import { BAKU_CENTER } from '../data/areas';
import { formatDistance } from '../lib/utils';
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

export function CourseMap({
  courses,
  categories = [],
  height = '100%',
  onSearchArea,
}: {
  courses: OfferingSummary[];
  categories?: CategoryInfo[];
  height?: string;
  onSearchArea?: (bounds: { south: number; west: number; north: number; east: number }) => void;
}) {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const userCoords: [number, number] | null = currentUser?.location ? [currentUser.location.lat, currentUser.location.lng] : null;
  const center = userCoords ?? BAKU_CENTER;

  const byBranch = useMemo(() => {
    const map = new Map<string, OfferingSummary[]>();
    for (const c of courses) {
      const list = map.get(c.branch.id) ?? [];
      list.push(c);
      map.set(c.branch.id, list);
    }
    return map;
  }, [courses]);

  const selectedCourses = selectedBranchId ? byBranch.get(selectedBranchId) ?? [] : [];
  const selectedBranch = selectedCourses[0]?.branch ?? null;

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
          const primary = list.slice().sort((a, b) => Number(b.promoted) - Number(a.promoted))[0];
          const category = categoryById.get(primary.categoryId);
          return (
            <Marker
              key={branchId}
              position={[primary.branch.lat, primary.branch.lng]}
              icon={categoryIcon(category?.color ?? '#111827', category?.icon ?? '📍', primary.promoted)}
              eventHandlers={{ click: () => setSelectedBranchId(branchId) }}
            />
          );
        })}
      </MapContainer>

      {moved && (
        <button
          onClick={() => {
            setMoved(false);
            const bounds = mapRef.current?.getBounds();
            if (bounds && onSearchArea) {
              onSearchArea({
                south: bounds.getSouth(),
                west: bounds.getWest(),
                north: bounds.getNorth(),
                east: bounds.getEast(),
              });
            }
          }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-ink-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
        >
          🔄 Bu ərazidə axtar
        </button>
      )}

      {selectedBranch && selectedCourses.length > 0 && (
        <div className="absolute left-3 right-3 bottom-3 z-[1000]">
          {selectedCourses.length === 1 ? (
            <CoursePreviewCard course={selectedCourses[0]} category={categoryById.get(selectedCourses[0].categoryId)} onClose={() => setSelectedBranchId(null)} />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-3 max-h-64 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-ink-900">{selectedBranch.name} — {selectedCourses.length} kurs</p>
                <button onClick={() => setSelectedBranchId(null)} className="text-ink-400">✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {selectedCourses.map((c) => (
                  <button key={c.offeringId} onClick={() => navigate(`/app/course/${c.offeringId}`)} className="flex items-center justify-between text-left px-3 py-2 rounded-xl bg-ink-50 hover:bg-ink-100">
                    <span className="text-sm font-semibold text-ink-800 truncate">{c.title}</span>
                    <span className="text-xs font-bold text-ink-900 shrink-0 ml-2">{formatMinor(c.effectivePriceMinor)}</span>
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

function CoursePreviewCard({ course, category, onClose }: { course: OfferingSummary; category?: CategoryInfo; onClose: () => void }) {
  const navigate = useNavigate();
  const distance = course.distanceKm;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-3 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${category?.color ?? '#111827'}1a` }}>
          {category?.icon ?? '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: category?.color }}>{category?.nameAz ?? course.subcategory}</p>
              <h3 className="font-bold text-sm text-ink-900 truncate">{course.title}</h3>
            </div>
            <button onClick={onClose} className="text-ink-400 shrink-0">✕</button>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            {distance !== null && distance !== undefined && <span className="text-xs text-ink-400">• {formatDistance(distance)}</span>}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {course.qargaExclusive && <Badge tone="gold">Endirim</Badge>}
            {course.freeTrial && <Badge tone="teal">Pulsuz sınaq</Badge>}
            <Badge tone="neutral">{course.seatsAvailable} yer</Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/app/course/${course.offeringId}`)}>Ətraflı bax</Button>
        <Button size="sm" fullWidth onClick={() => navigate(`/app/register/${course.offeringId}`)}>Qeydiyyat</Button>
      </div>
    </div>
  );
}
