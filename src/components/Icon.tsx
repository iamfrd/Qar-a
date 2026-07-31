/**
 * SVG ikon dəsti.
 *
 * Emoji naviqasiya, panel, form və status ikonu kimi işlədilmir — Windows-da
 * bəziləri boş kvadrat kimi görünür, ekran oxuyucu onları oxumur, ölçüsü
 * platformadan asılı dəyişir. Bu ikonlar `currentColor` alır, ona görə
 * mətnlə eyni rəngi izləyir.
 */
import type { SVGProps, ReactElement } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function Svg({ size = 20, title, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// ------------------------------------------------------------ kateqoriyalar

const CATEGORY_PATHS: Record<string, ReactElement> = {
  'ingilis-dili':        <><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" /></>,
  'rus-dili':            <><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" /></>,
  'alman-dili':          <><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" /></>,
  'ielts':               <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 13h6M9 17h4" /></>,
  'toefl':               <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 13h6M9 17h4" /></>,
  'mekteb-fenleri':      <><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 16h13" /></>,
  'riyaziyyat':          <><path d="M4 20 20 4" /><path d="M4 20h16" /><path d="M4 20V9" /></>,
  'proqramlasdirma':     <><path d="m8 9-3 3 3 3" /><path d="m16 9 3 3-3 3" /><path d="m13 6-2 12" /></>,
  'qrafik-dizayn':       <><circle cx="12" cy="12" r="8" /><circle cx="9.5" cy="10" r="1.2" /><circle cx="14.5" cy="10" r="1.2" /><circle cx="12" cy="15" r="1.2" /></>,
  'reqemsal-marketinq':  <><path d="M4 19V11M10 19V6M16 19v-5M22 19H2" /></>,
  'muhasibatliq':        <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
  'musiqi':              <><path d="M9 18V5l10-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></>,
  'reqs':                <><circle cx="13" cy="4.5" r="1.8" /><path d="M13 7v5l4 3M13 12l-3 3-1 5M10 15l-3-2" /></>,
  'incesenet':           <><path d="M4 20s2-6 8-10 8-6 8-6-1 5-5 9-8 6-11 7z" /><path d="M4 20l3-3" /></>,
  'suruculuk':           <><path d="M5 15h14M6 15l1-5a2 2 0 0 1 2-1.5h6A2 2 0 0 1 17 10l1 5" /><rect x="3" y="15" width="18" height="4" rx="1.5" /><path d="M7 19v1.5M17 19v1.5" /></>,
  'fitness':             <><path d="M4 9v6M20 9v6M7 7v10M17 7v10M7 12h10" /></>,
  'asbazliq':            <><path d="M6 13a6 6 0 0 1 12 0" /><path d="M4 13h16" /><path d="M6 17h12" /><path d="M12 7V4" /></>,
  'gozellik':            <><path d="M9 4h6l-1 8H10z" /><rect x="9" y="12" width="6" height="8" rx="1.5" /></>,
  'pese-hazirligi':      <><path d="m12 4 9 4-9 4-9-4z" /><path d="M7 10v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" /></>,
  'usaq-tehsili':        <><circle cx="12" cy="8" r="4" /><path d="M5 21c0-3.9 3.1-6 7-6s7 2.1 7 6" /></>,
  'universitete-hazirliq': <><path d="M3 10 12 5l9 5" /><path d="M5 10v9M19 10v9M9 19v-6h6v6" /><path d="M3 19h18" /></>,
  'karyera-inkisafi':    <><path d="M12 3c3 2.5 5 6 5 9.5a5 5 0 0 1-10 0C7 9 9 5.5 12 3z" /><path d="M9 21h6" /></>,
};

const FALLBACK = <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></>;

export function CategoryIcon({ categoryId, size = 20, ...rest }: P & { categoryId: string }) {
  return <Svg size={size} {...rest}>{CATEGORY_PATHS[categoryId] ?? FALLBACK}</Svg>;
}

// ------------------------------------------------------------------ interfeys

export const Icon = {
  map:        (p: P) => <Svg {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></Svg>,
  search:     (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>,
  heart:      (p: P) => <Svg {...p}><path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6C19 15.4 12 20 12 20z" /></Svg>,
  heartFull:  (p: P) => <Svg {...p} fill="currentColor" stroke="none"><path d="M12 20.5S4 15.6 4 10.4A4.7 4.7 0 0 1 12 7.4a4.7 4.7 0 0 1 8 3c0 5.2-8 10.1-8 10.1z" /></Svg>,
  user:       (p: P) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></Svg>,
  users:      (p: P) => <Svg {...p}><circle cx="9" cy="8" r="3.4" /><path d="M2.5 20c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8" /><path d="M16 5.6a3.4 3.4 0 0 1 0 6.6M18 14.6c2.2.6 3.6 2.4 3.6 5" /></Svg>,
  building:   (p: P) => <Svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" /></Svg>,
  book:       (p: P) => <Svg {...p}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 16h13" /></Svg>,
  receipt:    (p: P) => <Svg {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></Svg>,
  calendar:   (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>,
  coin:       (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10a2.5 2.5 0 0 1 5 0c0 2.5-5 1.5-5 4a2.5 2.5 0 0 0 5 0" /></Svg>,
  flag:       (p: P) => <Svg {...p}><path d="M6 21V4" /><path d="M6 5h11l-2 3.5L17 12H6z" /></Svg>,
  lifebuoy:   (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" /></Svg>,
  chart:      (p: P) => <Svg {...p}><path d="M4 19V11M10 19V6M16 19v-5M22 19H2" /></Svg>,
  star:       (p: P) => <Svg {...p}><path d="m12 3 2.7 5.9 6.3.6-4.7 4.3 1.3 6.2L12 16.8 6.4 20l1.3-6.2L3 9.5l6.3-.6z" /></Svg>,
  starFull:   (p: P) => <Svg {...p} fill="currentColor" stroke="none"><path d="m12 2.5 2.9 6.4 6.8.6-5.1 4.6 1.5 6.7L12 17.2 5.9 20.8l1.5-6.7-5.1-4.6 6.8-.6z" /></Svg>,
  check:      (p: P) => <Svg {...p} strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></Svg>,
  verified:   (p: P) => <Svg {...p}><path d="m12 3 2.3 1.7 2.8-.3 1 2.7 2.4 1.6-1 2.7 1 2.7-2.4 1.6-1 2.7-2.8-.3L12 21l-2.3-1.7-2.8.3-1-2.7L3.5 15l1-2.7-1-2.7 2.4-1.6 1-2.7 2.8.3z" /><path d="m9 12 2 2 4-4" strokeWidth={2} /></Svg>,
  tag:        (p: P) => <Svg {...p}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="7.5" r="1.4" /></Svg>,
  pin:        (p: P) => <Svg {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></Svg>,
  clock:      (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  gift:       (p: P) => <Svg {...p}><rect x="3.5" y="9" width="17" height="11" rx="1.5" /><path d="M3.5 13h17M12 9v11" /><path d="M12 9S9.5 4.5 7.5 6s2 3 4.5 3 6.5 1.5 4.5-3S12 9 12 9z" /></Svg>,
  bell:       (p: P) => <Svg {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20h4" /></Svg>,
  message:    (p: P) => <Svg {...p}><path d="M4 5h16v11H8l-4 4z" /></Svg>,
  settings:   (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3" /></Svg>,
  folder:     (p: P) => <Svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Svg>,
  shield:     (p: P) => <Svg {...p}><path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z" /></Svg>,
  arrowRight: (p: P) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  wallet:     (p: P) => <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.3" /></Svg>,
};

export type IconName = keyof typeof Icon;
