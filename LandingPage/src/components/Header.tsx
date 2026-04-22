import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BetaAccessModal } from './BetaAccessModal';
import { LogoMark } from './LogoMark';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'For Students', href: '/for-students' },
    { name: 'For Teachers', href: '/for-teachers' },
    { name: 'For Families', href: '/#for-families' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-ce-border bg-ce-surface/90 backdrop-blur-md">
        <nav className="container">
          <div className="flex h-[3.25rem] items-center justify-between sm:h-16">
            <Link to="/" className="group flex items-center gap-2.5 rounded-lg focus-visible:ce-focus">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ce-accent text-ce-on-accent transition group-hover:bg-ce-accent-hover">
                <LogoMark className="h-[22px] w-[22px]" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ce-ink sm:text-xl">ClassEcon</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(item.href)
                      ? 'bg-ce-muted text-ce-accent'
                      : 'text-ce-ink-muted hover:bg-ce-muted/80 hover:text-ce-ink'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setBetaModalOpen(true)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ce-ink-muted transition hover:bg-ce-muted/80 hover:text-ce-ink"
              >
                Sign in
              </button>
              <Link
                to="/waitlist"
                className="rounded-xl bg-ce-accent px-4 py-2 text-sm font-semibold text-ce-on-accent transition hover:bg-ce-accent-hover focus-visible:ce-focus"
              >
                Early access
              </Link>
            </div>

            <button
              type="button"
              className="rounded-lg p-2 text-ce-ink hover:bg-ce-muted md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-ce-border py-4 md:hidden">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`rounded-lg px-3 py-2.5 text-base font-medium ${
                      isActive(item.href) ? 'bg-ce-muted text-ce-accent' : 'text-ce-ink hover:bg-ce-muted/70'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  type="button"
                  className="mt-2 rounded-lg px-3 py-2.5 text-left text-base font-semibold text-ce-ink hover:bg-ce-muted/70"
                  onClick={() => {
                    setBetaModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign in
                </button>
                <Link
                  to="/waitlist"
                  className="mt-1 rounded-xl bg-ce-accent py-3 text-center text-base font-semibold text-ce-on-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Early access
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <BetaAccessModal isOpen={betaModalOpen} onClose={() => setBetaModalOpen(false)} />
    </>
  );
}
