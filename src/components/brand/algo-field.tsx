// پس‌زمینه‌ی یکپارچه‌ی هویت (نود، خط، نقطه): یک طرح بزرگ و یکتا به‌جای کاشی تکراری.
// خط‌ها مثل مسیرهای یک شبکه از لبه‌ها وارد می‌شوند، با گوشه‌های گرد یا ۴۵ درجه می‌پیچند و به نود می‌رسند،
// چون هیچ تکه‌ای تکرار نمی‌شود، کل صفحه یک نقشه‌ی واحد دیده می‌شود. همیشه ثابت پشت صفحه و بسیار کم‌رنگ است.
import { cn } from "@/lib/utils";

const W = 1600, H = 1000, U = 40;
// مولد عدد شبه‌تصادفی با بذر ثابت: طرح در سرور و مرورگر یکسان ساخته می‌شود
function prng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]] as const;

function build() {
  const r = prng(20261116);
  const int = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const paths: string[] = [], nodes: [number, number][] = [], rings: [number, number][] = [], dots: [number, number][] = [];
  // نقطه‌های شروع روی شبکه‌ای درشت پخش می‌شوند تا هیچ گوشه‌ای خالی یا شلوغ نماند
  const cols = 6, rows = 4;
  for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
    if (r() < 0.22) continue;
    let x = Math.round(((gx + 0.15 + r() * 0.7) * W) / cols / U) * U;
    let y = Math.round(((gy + 0.15 + r() * 0.7) * H) / rows / U) * U;
    let d = int(0, 3) * 2; // شروع افقی یا عمودی
    let p = `M${x} ${y}`;
    (r() < 0.5 ? nodes : rings).push([x, y]);
    const segs = int(2, 4);
    for (let s = 0; s < segs; s++) {
      const len = int(2, 6) * U;
      const [dx, dy] = DIRS[d];
      const k = dx && dy ? Math.SQRT1_2 : 1;
      const nx = x + dx * len * k, ny = y + dy * len * k;
      if (s < segs - 1) {
        // پیچ: ۴۵ یا ۹۰ درجه، با گوشه‌ی گرد
        const turn = (r() < 0.6 ? 2 : 1) * (r() < 0.5 ? 1 : -1);
        const nd = (d + turn + 8) % 8;
        const rad = turn % 2 === 0 ? U : U * 0.6;
        const [ex, ey] = DIRS[nd];
        const ek = ex && ey ? Math.SQRT1_2 : 1;
        const bx = nx - dx * rad * k, by = ny - dy * rad * k;
        const ax = nx + ex * rad * ek, ay = ny + ey * rad * ek;
        p += `L${bx.toFixed(1)} ${by.toFixed(1)}Q${nx.toFixed(1)} ${ny.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)}`;
        if (r() < 0.35) dots.push([nx, ny]);
        x = ax; y = ay; d = nd;
      } else {
        p += `L${nx.toFixed(1)} ${ny.toFixed(1)}`;
        x = nx; y = ny;
        (r() < 0.6 ? nodes : rings).push([x, y]);
      }
    }
    paths.push(p);
  }
  // چند کمان بزرگ مثل قوس‌های نشان الگونت، تا خط‌ها خشک و شطرنجی نباشند
  const arcs: string[] = [];
  for (let i = 0; i < 6; i++) {
    const cx = int(1, 39) * U, cy = int(1, 24) * U, rr = int(2, 5) * U;
    const a0 = int(0, 3) * (Math.PI / 2), a1 = a0 + (r() < 0.5 ? Math.PI / 2 : Math.PI);
    const sx = cx + rr * Math.cos(a0), sy = cy + rr * Math.sin(a0), ex = cx + rr * Math.cos(a1), ey = cy + rr * Math.sin(a1);
    arcs.push(`M${sx.toFixed(1)} ${sy.toFixed(1)}A${rr} ${rr} 0 ${a1 - a0 > Math.PI / 2 + 0.01 ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    dots.push([ex, ey]);
  }
  return { d: [...paths, ...arcs].join(""), nodes, rings, dots };
}
const FIELD = build();

/** پترن یکپارچه‌ی پس‌زمینه، رنگ با text-* و شدت با opacity کلاس تعیین می‌شود */
export function AlgoField({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={cn("pointer-events-none fixed inset-0 -z-10 h-dvh w-full", className)}>
      <path d={FIELD.d} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="currentColor">
        {FIELD.nodes.map(([x, y], i) => <circle key={`n${i}`} cx={x} cy={y} r="4" />)}
        {FIELD.dots.map(([x, y], i) => <circle key={`d${i}`} cx={x} cy={y} r="2" />)}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        {FIELD.rings.map(([x, y], i) => <circle key={`r${i}`} cx={x} cy={y} r="6" />)}
      </g>
    </svg>
  );
}
