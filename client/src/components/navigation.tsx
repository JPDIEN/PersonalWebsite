import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Work" },
  { href: "/journal", label: "Writing" },
  { href: "/now", label: "Now" },
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
      {/* Desktop sidebar — fixed left panel */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-48 z-50 flex-col py-10 px-5"
        style={{
          background: "hsl(var(--sidebar))",
          borderRight: "1px solid hsl(var(--sidebar-border))",
        }}
      >
        <Link
          href="/"
          className="font-serif font-semibold text-xl tracking-wide mb-10 block"
          style={{ color: "hsl(var(--sidebar-foreground))" }}
          data-testid="link-home"
        >
          JD
        </Link>

        <nav className="flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 px-2 rounded-md text-sm transition-colors block"
              style={{
                color: location === link.href
                  ? "hsl(var(--sidebar-foreground))"
                  : "hsl(var(--muted-foreground))",
                background: location === link.href
                  ? "hsl(var(--sidebar-accent))"
                  : "transparent",
                fontWeight: location === link.href ? 500 : 400,
              }}
              data-testid={`link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Terminal button at the bottom of sidebar */}
        <div className="mt-auto">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-terminal"))}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left w-full rounded-md px-2 py-2"
            style={{
              color: "hsl(var(--muted-foreground))",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span className="font-mono text-xs">&gt;_</span>
            <span className="text-xs tracking-wider">terminal</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: transparent ? "transparent" : "rgba(255,255,255,0.85)",
          backdropFilter: transparent ? "none" : "blur(12px)",
          borderBottom: transparent ? "none" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-6 h-14">
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

      {/* Mobile full-screen drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col md:hidden"
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
                        color: location === link.href ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.6)",
                      }}
                      data-testid={`link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Footer in drawer */}
              <div className="mt-auto px-8 pb-10 space-y-5">
                {/* Terminal shortcut */}
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => window.dispatchEvent(new CustomEvent("open-terminal")), 200);
                  }}
                  className="flex items-center gap-2 transition-opacity hover:opacity-70"
                  style={{ color: "rgba(255,255,255,0.45)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <span className="font-mono text-xs tracking-widest">&gt;_</span>
                  <span className="text-xs tracking-wider">terminal</span>
                </button>

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
                      style={{ color: "rgba(255,255,255,0.5)" }}
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
