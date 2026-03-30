import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Work" },
  { href: "/journal", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setAtTop(latest < 60);
  });

  const onHome = location === "/";
  const transparent = onHome && atTop;

  return (
    <>
      {/* Fixed header — transparent on hero, minimal after scroll */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: transparent ? "transparent" : "rgba(255,255,255,0.85)",
          backdropFilter: transparent ? "none" : "blur(12px)",
          borderBottom: transparent ? "none" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-6 md:px-10 h-14">
          <Link
            href="/"
            className="font-serif font-semibold text-lg tracking-wide transition-colors"
            style={{ color: transparent ? "rgba(255,255,255,0.9)" : "inherit" }}
            data-testid="link-home"
          >
            JD
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="transition-opacity hover:opacity-60"
            style={{ color: transparent ? "rgba(255,255,255,0.8)" : "inherit" }}
            aria-label="Open menu"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Full-screen drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: "#0f0f0f",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Close */}
              <div className="flex justify-end px-6 pt-5 pb-8">
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/50 hover:text-white/90 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col px-8 gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-serif text-2xl transition-colors"
                      style={{
                        color: location === link.href ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.45)",
                      }}
                      data-testid={`link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Footer in drawer */}
              <div className="mt-auto px-8 pb-10">
                <div className="flex gap-5">
                  {[
                    { label: "Substack", href: "https://substack.com/@josephdiener" },
                    { label: "LinkedIn", href: "https://linkedin.com/in/josephpdiener" },
                    { label: "X", href: "https://x.com/Joseph__Diener" },
                    { label: "GitHub", href: "https://github.com/JPDIEN" },
                  ].map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-wider transition-colors"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
