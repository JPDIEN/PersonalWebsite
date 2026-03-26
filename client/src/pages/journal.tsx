import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const links = [
  {
    label: "Substack",
    href: "https://substack.com/@josephdiener",
    description: "Essays on startups, ideas, and things I'm figuring out.",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/josephpdiener",
    description: "Work history and what I'm up to professionally.",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/Joseph__Diener",
    description: "Shorter thoughts.",
  },
  {
    label: "GitHub",
    href: "https://github.com/JPDIEN",
    description: "Things I'm building.",
  },
];

export default function Journal() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-5xl font-bold mb-4 tracking-tight">
            Writing
          </h1>
          <p className="text-muted-foreground text-lg mb-16">
            I write on Substack. Everything else is below.
          </p>

          <div className="space-y-1">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="group flex items-start justify-between py-5 border-b border-border hover:border-foreground transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0 ml-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
