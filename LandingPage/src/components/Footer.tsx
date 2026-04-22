import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { LogoMark } from './LogoMark';

const appOrigin = (import.meta.env.VITE_FRONTEND_URL || '').replace(/\/$/, '');

function appPath(path: string) {
  if (appOrigin) return `${appOrigin}${path.startsWith('/') ? path : `/${path}`}`;
  return path;
}

export default function Footer() {
  return (
    <footer className="bg-ce-footer-bg text-ce-footer-text">
      <div className="container py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:ce-focus">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ce-accent text-ce-on-accent">
                <LogoMark className="h-[22px] w-[22px]" />
              </span>
              <span className="font-display text-lg font-bold text-ce-on-accent">ClassEcon</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ce-footer-muted">
              Classroom economy software that keeps incentives, jobs, and balances legible—for teachers running real
              schedules and students building real habits.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://twitter.com"
                className="rounded-lg p-2 text-ce-footer-muted transition hover:bg-white/5 hover:text-ce-on-accent"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="rounded-lg p-2 text-ce-footer-muted transition hover:bg-white/5 hover:text-ce-on-accent"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                className="rounded-lg p-2 text-ce-footer-muted transition hover:bg-white/5 hover:text-ce-on-accent"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-7 md:grid-cols-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-ce-on-accent">Product</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/for-students" className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent">
                    For students
                  </Link>
                </li>
                <li>
                  <Link to="/for-teachers" className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent">
                    For teachers
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/waitlist" className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent">
                    Waitlist
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-ce-on-accent">Company</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/contact" className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent">
                    Contact
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-ce-footer-muted/60">About (soon)</span>
                </li>
                <li>
                  <a
                    href={appPath('/privacy')}
                    className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href={appPath('/terms')}
                    className="text-sm text-ce-footer-muted transition hover:text-ce-on-accent"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-ce-footer-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ClassEcon. All rights reserved.</p>
          <p>Made for classrooms, not boardrooms.</p>
        </div>
      </div>
    </footer>
  );
}
