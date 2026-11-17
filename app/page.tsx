import Image from "next/image";
import Link from "next/link";
import AreaChart from "@/components/AreaChart";
import CodeBlock from "@/components/CodeBlock";
import HeroTankCard from "@/components/HeroTankCard";
import { cubeArea } from "@/lib/tank";

const TANK_PY = `import sympy as sp
from scipy.optimize import minimize

# Open-top tank: base x by y, height z (m)
x, y, z, lam = sp.symbols('x y z lambda',
                          positive=True)
V = 32                            # volume, m^3
f = x*y + 2*x*z + 2*y*z           # steel area
g = x*y*z - V                     # constraint

# Lagrange: grad f = lambda * grad g, g = 0
eqs = [sp.diff(f, v) - lam*sp.diff(g, v)
       for v in (x, y, z)] + [g]
s = sp.solve(eqs, [x, y, z, lam], dict=True)[0]
print("Exact  :", s, " A =", f.subs(s))

# Numerical check with an optimizer (SLSQP)
A = lambda p: p[0]*p[1] + 2*p[2]*(p[0] + p[1])
con = {'type': 'eq',
       'fun': lambda p: p[0]*p[1]*p[2] - V}
r = minimize(A, [1, 2, 3], constraints=con,
             bounds=[(0.1, None)] * 3)
print("Numeric:", r.x.round(4),
      " A =", round(r.fun, 4))`;

const OUTPUT = `$ python tank.py
Exact  : {lambda: 1, x: 4, y: 4, z: 2}  A = 48
Numeric: [4. 4. 2.]  A = 48.0`;

const TEAM: { name: string; id: string; dept: string }[] = [
  { name: "Mohamed Ali Sayed Ahmed", id: "2024020479", dept: "MET" },
  { name: "Ehab Adel Ali", id: "2023037860", dept: "MET" },
  { name: "Mohamed Ahmed Abdelsalam", id: "2023035224", dept: "ENR" },
  { name: "Ahmed Mohamed Gamal", id: "2024000450", dept: "MET" },
  { name: "Ahmed Hassan Saad", id: "2023024130", dept: "MET" },
  { name: "Ahmed Mohamed Gomaa", id: "2024019205", dept: "MET" },
  { name: "Ehab Mohamed Mostafa Mohamed", id: "2024034589", dept: "MET" },
  { name: "Abdul Halim Mahmoud Abdullah Al-Rifai", id: "2024039266", dept: "MET" },
  { name: "Hamza Mohamed Abdallah Hassanein Ramadan", id: "2024039025", dept: "MET" },
  { name: "Hussien Elsayed Hussien Saad", id: "2024039044", dept: "MET" },
];

const NAV = [
  { href: "#problem", label: "Problem" },
  { href: "#model", label: "Model" },
  { href: "#code", label: "Code" },
  { href: "#results", label: "Results" },
  { href: "#team", label: "Team" },
];

const btnBase =
  "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors";

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Badr University in Cairo, home">
          <Image src="/buc-logo.png" alt="Badr University in Cairo" width={132} height={48} priority className="h-10 w-auto" />
        </Link>
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="rounded-md px-3 py-2 text-sm font-medium text-[#33415c] hover:bg-soft hover:text-brand">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/simulation"
          className="ml-auto rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand md:ml-2"
        >
          3D lab
        </Link>
      </nav>
      {/* Compact section links on small screens */}
      <ul className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden">
        {NAV.map((n) => (
          <li key={n.href}>
            <a href={n.href} className="block whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-[#33415c] hover:bg-soft">
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}

function Hero() {
  const facts = [
    { k: "Best size", v: "4 × 4 × 2 m" },
    { k: "Least steel", v: "48 m²" },
    { k: "Multiplier", v: "λ = 1" },
  ];
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Math 3 · BAS 113 · Lagrange multipliers
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Designing a Water Tank with the Least Steel
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            An open-top steel tank must hold 32 m³ of water. Which base and height use the least steel? We set it up as
            a constrained optimization problem, solve it with Lagrange multipliers, and check the answer in Python.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulation" className={`${btnBase} bg-accent text-navy hover:bg-[#f8ad6b]`}>
              Open the 3D lab
            </Link>
            <a href="#code" className={`${btnBase} text-white ring-1 ring-white/40 hover:bg-white/10`}>
              View the code
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {facts.map((f) => (
              <div key={f.k} className="border-t-[3px] border-accent pt-3">
                <dt className="text-xs uppercase tracking-wider text-white/60">{f.k}</dt>
                <dd className="mt-1 font-mono text-base text-white sm:text-lg">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroTankCard />
      </div>
    </section>
  );
}

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-[220px_1fr] md:gap-10 lg:py-20">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="font-mono text-sm font-medium text-accent-dark">{num}</div>
          <h2 id={`${id}-h`} className="mt-2 font-display text-2xl font-bold leading-tight text-brand sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-brand">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed text-[#33415c]">{children}</div>
    </div>
  );
}

function Eq({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[15px] text-[#0F2350]">{children}</div>;
}

export default function Home() {
  const cube = cubeArea(32);

  return (
    <>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />

        <Section id="problem" num="01" title="The problem">
          <p className="max-w-2xl text-lg leading-relaxed text-[#33415c]">
            A factory needs an <strong className="text-brand">open-top</strong> rectangular steel tank that holds exactly{" "}
            <strong className="text-brand">32 m³</strong> of water. Steel is the main cost, so we want the dimensions
            that use the smallest total area of sheet metal: the base plus the four walls, with no lid.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card title="Given">
              Volume <span className="font-mono">V = xyz = 32 m³</span>. The top is open.
            </Card>
            <Card title="Shape">
              Rectangular box with base <span className="font-mono">x × y</span> and height{" "}
              <span className="font-mono">z</span>, all in metres.
            </Card>
            <Card title="Goal">
              Minimize steel area <span className="font-mono">A = xy + 2xz + 2yz</span>.
            </Card>
          </div>
        </Section>

        <Section id="model" num="02" title="The mathematical model">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold text-[#5b6b86]">Objective</h3>
              <Eq>f(x, y, z) = xy + 2xz + 2yz</Eq>
              <h3 className="mt-4 text-sm font-semibold text-[#5b6b86]">Constraint</h3>
              <Eq>g(x, y, z) = xyz − 32 = 0</Eq>
              <h3 className="mt-4 text-sm font-semibold text-[#5b6b86]">Lagrange condition</h3>
              <Eq>∇f = λ ∇g</Eq>
            </div>
            <div className="rounded-xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold text-[#5b6b86]">The three equations</h3>
              <ol className="mt-2 space-y-2">
                {[
                  ["(1)", "y + 2z = λyz"],
                  ["(2)", "x + 2z = λxz"],
                  ["(3)", "2x + 2y = λxy"],
                ].map(([n, e]) => (
                  <li key={n} className="flex gap-3">
                    <span className="font-mono text-sm text-accent-dark">{n}</span>
                    <Eq>{e}</Eq>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-[#33415c]">
                Multiply (1) by x and (2) by y and subtract: <span className="font-mono">2z(x − y) = 0</span>, so{" "}
                <span className="font-mono">x = y</span>. Then (1)·x vs (3)·z gives <span className="font-mono">x = 2z</span>.
                Substituting into the constraint: <span className="font-mono">x · x · x/2 = 32</span>, so{" "}
                <span className="font-mono">x³ = 64</span>.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border-l-4 border-accent bg-navy px-6 py-5 text-white">
            <div className="text-xs uppercase tracking-wider text-white/60">Conclusion</div>
            <div className="mt-1 font-mono text-lg text-optimum sm:text-xl">x = y = 4 m, z = 2 m, λ = 1</div>
            <div className="mt-1 text-sm text-white/75">
              Least steel: A = 16 + 16 + 16 = <span className="font-mono">48 m²</span>. The tank is twice as wide as it is
              tall.
            </div>
          </div>
        </Section>

        <Section id="code" num="03" title="The software code">
          <p className="mb-6 max-w-2xl text-[#33415c]">
            SymPy solves the Lagrange system exactly, and SciPy&apos;s SLSQP optimizer checks the answer numerically.
          </p>
          <CodeBlock code={TANK_PY} filename="tank.py" />
          <figure className="mt-4 overflow-hidden rounded-xl bg-[#05102a] ring-1 ring-[#0A1A3C]">
            <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-xs text-white/60">Output</figcaption>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-optimum" tabIndex={0}>
              {OUTPUT}
            </pre>
          </figure>
        </Section>

        <Section id="results" num="04" title="The code results">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="text-xs uppercase tracking-wider text-[#5b6b86]">Optimal size</div>
              <div className="mt-1 font-mono text-2xl text-brand">4 × 4 × 2 m</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-5 ring-2 ring-optimum">
              <div className="text-xs uppercase tracking-wider text-[#5b6b86]">Least steel</div>
              <div className="mt-1 font-mono text-2xl text-brand">48 m²</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-5">
              <div className="text-xs uppercase tracking-wider text-[#5b6b86]">Cube, same volume</div>
              <div className="mt-1 font-mono text-2xl text-brand">{cube.toFixed(1)} m²</div>
              <div className="mt-1 text-xs text-[#5b6b86]">+{(((cube - 48) / 48) * 100).toFixed(1)}% more steel</div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-line bg-white p-4 sm:p-6">
            <h3 className="font-display text-lg font-bold text-brand">Steel area for a square base (y = x)</h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              With <span className="font-mono">y = x</span> and <span className="font-mono">z = 32/x²</span>, the area is{" "}
              <span className="font-mono">A(x) = x² + 128/x</span>. Its minimum is at x = 4.
            </p>
            <div className="mt-4">
              <AreaChart />
            </div>
          </div>
        </Section>

        <Section id="team" num="05" title="Team">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((m) => (
              <li key={m.id} className="flex flex-col rounded-xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold leading-snug text-[#1b2638]">{m.name}</span>
                  <span className="shrink-0 rounded-md bg-soft px-2 py-0.5 font-mono text-xs font-medium text-brand">
                    {m.dept}
                  </span>
                </div>
                <span className="mt-2 font-mono text-sm text-[#5b6b86]">ID {m.id}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-soft px-5 py-4 text-[#33415c]">
            Supervised by <strong className="text-brand">Assoc. Prof. Dr. Mourad Semary</strong>
          </p>
        </Section>
      </main>

      <footer className="bg-navy text-white/75">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-white">Badr University in Cairo</div>
            <div>Faculty of Engineering &amp; Technology · Basic Science Department</div>
          </div>
          <div className="font-mono text-xs">Math 3 (BAS 113) · Fall 2026–2027</div>
        </div>
      </footer>
    </>
  );
}
