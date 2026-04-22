import { motion } from "framer-motion";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p
          className="font-serif text-8xl font-bold mb-6 select-none"
          style={{ color: "var(--muted-foreground)", opacity: 0.2 }}
        >
          404
        </p>
        <h1 className="font-serif text-2xl font-semibold mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          This one doesn't exist. Try somewhere else.
        </p>
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-primary"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← back home
        </Link>
      </motion.div>
    </div>
  );
}
