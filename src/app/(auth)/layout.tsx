/**
 * Auth layout — centered card with branding.
 * Server component. No auth check needed here.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3eee4] px-5 py-8 text-[#29241d] sm:px-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:p-0">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#8d795b_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#26352f] p-12 text-[#f7f1e5] lg:flex xl:p-16">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-[#d6a950]/30" />
        <div className="absolute -right-12 -top-8 h-72 w-72 rounded-full border border-[#d6a950]/20" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-[#d6a950]/50 text-[#e1b65e]">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">Library Atlas</span>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#e1b65e]">
            Private catalogue
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-[-0.025em] xl:text-6xl">
            Every volume,
            <br />
            exactly where it belongs.
          </h1>
          <p className="mt-7 max-w-md text-[17px] leading-7 text-[#d8d9d1]">
            Catalogue Arabic works, track complete sets, and locate each physical volume by shelf.
          </p>
        </div>

        <p className="relative max-w-sm border-l border-[#d6a950]/50 pl-4 text-sm leading-6 text-[#bfc8c1]">
          Secure organization access. Membership requires key supplied by library administrator.
        </p>
      </section>

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-[440px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#26352f] text-[#e1b65e]">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.16em]">Library Atlas</span>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
