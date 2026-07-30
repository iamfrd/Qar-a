interface CrowMascotProps {
  size?: number;
  mood?: 'default' | 'happy' | 'thinking' | 'sleeping' | 'waving';
  className?: string;
  animated?: boolean;
}

export function CrowMascot({ size = 64, mood = 'default', className = '', animated = false }: CrowMascotProps) {
  const eyes = () => {
    if (mood === 'sleeping') {
      return (
        <>
          <path d="M40 46q5-4 10 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M58 46q5-4 10 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (mood === 'thinking') {
      return (
        <>
          <circle cx="45" cy="46" r="4.2" fill="#fff" />
          <circle cx="46.5" cy="44.5" r="2" fill="#14151a" />
          <circle cx="63" cy="46" r="4.2" fill="#fff" />
          <circle cx="61.5" cy="44.5" r="2" fill="#14151a" />
        </>
      );
    }
    return (
      <>
        <circle cx="45" cy="46" r="4.6" fill="#fff" />
        <circle cx="46" cy="46" r="2.3" fill="#14151a" />
        <circle cx="63" cy="46" r="4.6" fill="#fff" />
        <circle cx="64" cy="46" r="2.3" fill="#14151a" />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 108 120"
      width={size}
      height={(size * 120) / 108}
      className={`${className} ${animated ? 'animate-crow-bob' : ''}`}
      role="img"
      aria-label="Qarğa mascot"
    >
      <ellipse cx="54" cy="100" rx="26" ry="6" fill="#000" opacity="0.08" />
      {/* tail */}
      <path d="M20 78q-14 6 -18 20q10 -2 20 -10z" fill="#1c1e24" />
      {/* body */}
      <ellipse cx="54" cy="76" rx="34" ry="32" fill="#1c1e24" />
      <ellipse cx="54" cy="76" rx="34" ry="32" fill="url(#crowGloss)" opacity="0.5" />
      {/* wing */}
      <path
        d={mood === 'waving' ? 'M82 60q18 -6 20 -22q-4 14 -22 18z' : 'M78 64q20 4 18 26q-14 -4 -22 -14z'}
        fill="#111217"
      />
      {/* belly highlight */}
      <ellipse cx="50" cy="88" rx="16" ry="12" fill="#26282f" opacity="0.6" />
      {/* head */}
      <circle cx="54" cy="46" r="30" fill="#1c1e24" />
      <circle cx="54" cy="46" r="30" fill="url(#crowGloss)" opacity="0.5" />
      {/* beak */}
      <path d="M50 54 q-14 4 -18 10 q10 3 20 -1z" fill="#e8b23a" />
      <path d="M50 54 q-14 4 -18 10 q10 3 20 -1z" fill="#d4a017" opacity="0.4" />
      {eyes()}
      {/* feet */}
      <path d="M42 104l-4 8M42 104l2 9M42 104l6 6" stroke="#e8b23a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M64 104l-4 8M64 104l2 9M64 104l6 6" stroke="#e8b23a" strokeWidth="2.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="crowGloss" x1="20" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3d4a63" />
          <stop offset="0.5" stopColor="#1c1e24" />
          <stop offset="1" stopColor="#0b0c0f" />
        </linearGradient>
      </defs>
    </svg>
  );
}
