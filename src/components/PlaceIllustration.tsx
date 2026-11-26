import { useId } from "react";

export function PlaceIllustration({
  className = "",
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  const titleId = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 1500 720"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : titleId}
      preserveAspectRatio="xMidYMid slice"
    >
      {!decorative && <title id={titleId}>Ilustrim i rrafshit dhe kodrave të Anamoravës</title>}
      <rect width="1500" height="720" fill="#d8dfd5" />
      <path d="M0 340 185 218l128 81 160-176 179 186 172-137 176 158 167-215 163 140 170-101v366H0Z" fill="#a5b4a4" />
      <path d="m0 402 174-97 161 70 199-168 182 161 128-61 197 117 179-146 144 104 135-36v374H0Z" fill="#748b78" />
      <path d="M0 482c204-65 278-4 437-41s239-111 409-43 267 22 352-2 203 18 302-11v335H0Z" fill="#3f6456" />
      <path d="M0 526c225 15 305-41 474-4s255 82 440 35 376-19 586 39v124H0Z" fill="#2f4f43" />
      <path d="M0 618c184-48 325 53 511 14s298-53 474-15 359 79 515 1v102H0Z" fill="#203b33" />
      <path d="M788 720c64-130 39-216 117-300 50-54 87-64 139-127" fill="none" stroke="#d6c9a8" strokeWidth="7" opacity=".72" />
      <g fill="#f0e9d6" opacity=".92">
        <circle cx="1048" cy="379" r="5" />
        <circle cx="1064" cy="370" r="3" />
        <circle cx="1035" cy="368" r="3" />
        <circle cx="1020" cy="359" r="2" />
      </g>
      <g fill="none" stroke="#f1ecdd" strokeWidth="1.25" opacity=".35">
        <path d="M0 427c190-70 315 23 503-32s251-119 413-47 290 49 421-3 108-15 163-24" />
        <path d="M0 451c179-57 328 22 508-28s261-105 408-39 301 45 421-3 106-11 163-20" />
        <path d="M0 575c197-35 282 19 464-3s308-67 462-9 358 62 574 13" />
      </g>
    </svg>
  );
}
