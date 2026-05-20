"use client";

export type OwlMood =
  | "idle"
  | "happy"
  | "sad"
  | "thinking"
  | "writing"
  | "teaching"
  | "celebrating"
  | "sleeping"
  | "annoyed";

interface OwlMascotProps {
  mood?: OwlMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function OwlMascot({ mood = "idle", size = "md", className = "" }: OwlMascotProps) {
  const sizeMap = { sm: 80, md: 140, lg: 200, xl: 260 };
  const px = sizeMap[size];

  // Pupil offsets per mood
  const pOff: Record<OwlMood, [number, number]> = {
    idle: [0, 0],
    happy: [0, -1],
    sad: [0, 3],
    thinking: [-3, -4],
    writing: [2, 5],
    teaching: [0, -2],
    celebrating: [0, -1],
    sleeping: [0, 0],
    annoyed: [4, 2],
  };
  const [px_off, py_off] = pOff[mood];

  const eyesOpen = mood !== "sleeping";
  const showBlush = mood === "happy" || mood === "celebrating";
  const showTears = mood === "sad";
  const showSparkles = mood === "celebrating";
  const showPencil = mood === "writing";
  const showThought = mood === "thinking";
  const showZzz = mood === "sleeping";
  const showPointer = mood === "teaching";
  const showAnnoyed = mood === "annoyed";

  return (
    <div
      className={`owl-mascot owl-mood-${mood} ${className}`}
      style={{ width: px, height: px, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        {/* Shadow */}
        <ellipse cx="100" cy="230" rx="40" ry="7" fill="black" opacity="0.08" className="owl-shadow" />

        <g className="owl-body-group">
          {/* Feet */}
          <ellipse cx="80" cy="220" rx="13" ry="5" fill="#ffab69" />
          <ellipse cx="120" cy="220" rx="13" ry="5" fill="#ffab69" />
          <circle cx="70" cy="222" r="3.5" fill="#ffab69" />
          <circle cx="80" cy="224" r="3.5" fill="#ffab69" />
          <circle cx="90" cy="222" r="3.5" fill="#ffab69" />
          <circle cx="110" cy="222" r="3.5" fill="#ffab69" />
          <circle cx="120" cy="224" r="3.5" fill="#ffab69" />
          <circle cx="130" cy="222" r="3.5" fill="#ffab69" />

          {/* Body */}
          <ellipse cx="100" cy="172" rx="50" ry="52" fill="#6b4f3a" />
          {/* Belly */}
          <ellipse cx="100" cy="176" rx="34" ry="36" fill="#ffdcc4" />
          {/* Belly chevrons */}
          <path d="M86 162 L91 168 L96 162" stroke="#e8c9a8" strokeWidth="1.5" fill="none" />
          <path d="M96 162 L101 168 L106 162" stroke="#e8c9a8" strokeWidth="1.5" fill="none" />
          <path d="M106 162 L111 168 L116 162" stroke="#e8c9a8" strokeWidth="1.5" fill="none" />
          <path d="M91 173 L96 179 L101 173" stroke="#e8c9a8" strokeWidth="1.5" fill="none" />
          <path d="M101 173 L106 179 L111 173" stroke="#e8c9a8" strokeWidth="1.5" fill="none" />

          {/* Left wing */}
          <path d="M50 148 C32 162,30 188,46 202 C50 196,52 178,50 162Z" fill="#513825" className="owl-wing-left" />
          {/* Right wing */}
          <path d="M150 148 C168 162,170 188,154 202 C150 196,148 178,150 162Z" fill="#513825" className="owl-wing-right" />

          {/* Head */}
          <circle cx="100" cy="96" r="56" fill="#6b4f3a" />
          {/* Face disc */}
          <ellipse cx="100" cy="99" rx="46" ry="40" fill="#ffdcc4" />

          {/* Ear tufts */}
          <path d="M56 56 L44 26 L70 50Z" fill="#513825" />
          <path d="M144 56 L156 26 L130 50Z" fill="#513825" />
          <path d="M58 54 L50 34 L66 50Z" fill="#ffdcc4" opacity="0.5" />
          <path d="M142 54 L150 34 L134 50Z" fill="#ffdcc4" opacity="0.5" />

          {/* ── Eyes ── */}
          {eyesOpen ? (
            <g className="owl-eyes">
              {/* Left eye */}
              <circle cx="78" cy="92" r="19" fill="white" stroke="#513825" strokeWidth="2" />
              <circle cx={78 + px_off} cy={92 + py_off} r="11" fill="#3a2a1a" />
              <circle cx={78 + px_off} cy={92 + py_off} r="5.5" fill="#000" />
              <circle cx={74 + px_off} cy={87 + py_off} r="3.5" fill="white" opacity="0.9" />
              <circle cx={82 + px_off} cy={86 + py_off} r="1.8" fill="white" opacity="0.6" />

              {/* Right eye */}
              <circle cx="122" cy="92" r="19" fill="white" stroke="#513825" strokeWidth="2" />
              <circle cx={122 + px_off} cy={92 + py_off} r="11" fill="#3a2a1a" />
              <circle cx={122 + px_off} cy={92 + py_off} r="5.5" fill="#000" />
              <circle cx={118 + px_off} cy={87 + py_off} r="3.5" fill="white" opacity="0.9" />
              <circle cx={126 + px_off} cy={86 + py_off} r="1.8" fill="white" opacity="0.6" />

              {/* Celebrating star highlights */}
              {mood === "celebrating" && (
                <>
                  <path d="M74 87 l1.5-3 1.5 3 3-1.5-2.5 2.5 2.5 2.5-3-1.5L75 92l-1.5-2.5-3 1.5 2.5-2.5L70.5 85.5Z" fill="white" opacity="0.85" className="owl-star" />
                  <path d="M118 87 l1.5-3 1.5 3 3-1.5-2.5 2.5 2.5 2.5-3-1.5-1.5 3-1.5-2.5-3 1.5 2.5-2.5-2.5-2.5Z" fill="white" opacity="0.85" className="owl-star" />
                </>
              )}

              {/* Eyebrows: sad */}
              {mood === "sad" && (
                <>
                  <line x1="63" y1="74" x2="88" y2="70" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="137" y1="74" x2="112" y2="70" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}
              {/* Eyebrows: thinking */}
              {mood === "thinking" && (
                <>
                  <line x1="63" y1="70" x2="88" y2="74" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="137" y1="73" x2="112" y2="70" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}
            </g>
          ) : (
            /* Sleeping: closed eye arcs */
            <g className="owl-eyes-closed">
              <path d="M60 92 Q78 84 96 92" stroke="#513825" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M104 92 Q122 84 140 92" stroke="#513825" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Beak */}
          <path d="M94 110 L100 120 L106 110Z" fill="#ffab69" stroke="#e89550" strokeWidth="1" />

          {/* Happy / celebrating mouth */}
          {(mood === "happy" || mood === "celebrating") && (
            <path d="M93 122 Q100 128 107 122" stroke="#6b4f3a" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {/* Annoyed flat mouth */}
          {mood === "annoyed" && (
            <line x1="93" y1="122" x2="107" y2="122" stroke="#6b4f3a" strokeWidth="2" strokeLinecap="round" />
          )}
          {/* Sad mouth */}
          {mood === "sad" && (
            <path d="M93 124 Q100 119 107 124" stroke="#6b4f3a" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Blush cheeks */}
          {showBlush && (
            <>
              <ellipse cx="60" cy="102" rx="9" ry="5" fill="#ffab69" opacity="0.3" className="owl-blush" />
              <ellipse cx="140" cy="102" rx="9" ry="5" fill="#ffab69" opacity="0.3" className="owl-blush" />
            </>
          )}

          {/* Tears */}
          {showTears && (
            <>
              <ellipse cx="68" cy="107" rx="2.5" ry="4.5" fill="#87CEEB" opacity="0.7" className="owl-tear owl-tear-1" />
              <ellipse cx="132" cy="109" rx="2.5" ry="4.5" fill="#87CEEB" opacity="0.7" className="owl-tear owl-tear-2" />
            </>
          )}

          {/* Annoyed: half-lidded eyelids + sweat drop */}
          {showAnnoyed && (
            <>
              {/* Half-closed eyelids */}
              <path d="M59 86 Q78 78 97 86" fill="#6b4f3a" opacity="0.85" />
              <path d="M103 86 Q122 78 141 86" fill="#6b4f3a" opacity="0.85" />
              {/* Annoyed eyebrows — flat and unamused */}
              <line x1="62" y1="72" x2="90" y2="74" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="138" y1="72" x2="110" y2="74" stroke="#513825" strokeWidth="2.5" strokeLinecap="round" />
              {/* Sweat drop */}
              <ellipse cx="148" cy="75" rx="3" ry="5" fill="#87CEEB" opacity="0.6" className="owl-tear owl-tear-1" />
            </>
          )}
        </g>

        {/* ── Accessories ── */}

        {/* Pencil (writing) */}
        {showPencil && (
          <g className="owl-pencil">
            <g transform="translate(152,165) rotate(-25)">
              <rect x="0" y="0" width="5" height="30" rx="1" fill="#f5c542" />
              <rect x="0" y="0" width="5" height="6" rx="1" fill="#e8a0a0" />
              <polygon points="0,30 5,30 2.5,37" fill="#3a2a1a" />
            </g>
          </g>
        )}

        {/* Teaching pointer */}
        {showPointer && (
          <g className="owl-pointer">
            <g transform="translate(158,140) rotate(-15)">
              <rect x="0" y="0" width="3" height="40" rx="1" fill="#6b4f3a" />
              <circle cx="1.5" cy="0" r="4" fill="#ffab69" />
            </g>
            {/* Lightbulb */}
            <text x="170" y="125" fontSize="22" className="owl-lightbulb">💡</text>
          </g>
        )}

        {/* Thought bubble (thinking) */}
        {showThought && (
          <g className="owl-thought">
            <circle cx="155" cy="55" r="18" fill="white" stroke="#d3c4ba" strokeWidth="1.5" />
            <circle cx="145" cy="72" r="7" fill="white" stroke="#d3c4ba" strokeWidth="1" />
            <circle cx="140" cy="80" r="4" fill="white" stroke="#d3c4ba" strokeWidth="1" />
            <text x="147" y="60" fontSize="14" textAnchor="middle" fill="#6b4f3a" fontWeight="bold">...</text>
          </g>
        )}

        {/* Zzz (sleeping) */}
        {showZzz && (
          <g>
            <text x="140" y="70" fontSize="16" fill="#6b4f3a" opacity="0.8" fontWeight="bold" className="owl-zzz owl-zzz-1">Z</text>
            <text x="155" y="52" fontSize="20" fill="#6b4f3a" opacity="0.6" fontWeight="bold" className="owl-zzz owl-zzz-2">Z</text>
            <text x="168" y="35" fontSize="24" fill="#6b4f3a" opacity="0.4" fontWeight="bold" className="owl-zzz owl-zzz-3">Z</text>
          </g>
        )}

        {/* Sparkles / confetti (celebrating) */}
        {showSparkles && (
          <g>
            <text x="30" y="50" fontSize="16" className="owl-sparkle owl-sparkle-1">✨</text>
            <text x="160" y="35" fontSize="14" className="owl-sparkle owl-sparkle-2">⭐</text>
            <text x="25" y="90" fontSize="12" className="owl-sparkle owl-sparkle-3">🎉</text>
            <text x="170" y="80" fontSize="14" className="owl-sparkle owl-sparkle-4">✨</text>
            <text x="50" y="30" fontSize="10" className="owl-sparkle owl-sparkle-5">🌟</text>
            <text x="145" y="20" fontSize="12" className="owl-sparkle owl-sparkle-6">🎊</text>
          </g>
        )}
      </svg>
    </div>
  );
}
