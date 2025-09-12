import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 9L12 5 2 9l10 4 10-4v6" />
      <path d="M6 10.6V16c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5.4" />
      <path d="M4 12v-3" />
    </svg>
  );
}
