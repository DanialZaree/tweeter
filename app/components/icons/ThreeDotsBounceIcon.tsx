import type { SVGProps } from 'react';

export default function ThreeDotsBounceIcon({
  size = 24,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...props}
    >
      <circle cx="4" cy="12" r="3">
        <animate id="dotA" attributeName="cy" begin="0;dotC.end+0.25s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12" />
      </circle>
      <circle cx="12" cy="12" r="3">
        <animate attributeName="cy" begin="dotA.begin+0.1s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12" />
      </circle>
      <circle cx="20" cy="12" r="3">
        <animate id="dotC" attributeName="cy" begin="dotA.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12" />
      </circle>
    </svg>
  );
}

export { ThreeDotsBounceIcon };
