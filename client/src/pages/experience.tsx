import { motion } from "framer-motion";
import { Download } from "lucide-react";

const roles = [
  {
    company: "Notre Dame Venture Capital",
    role: "General Partner",
    dates: "Jan 2026 – Present",
    description:
      "Leading a team sourcing and diligencing deals for Irish Angels. Building a B2B Vertical AI investment thesis and organizing the first Notre Dame Intercollegiate VC event.",
  },
  {
    company: "FouNDers Club",
    role: "Co-Director",
    dates: "Jan 2026 – Present",
    description:
      "Running Notre Dame's entrepreneurship community. Speakers, lunches, fireside chats, pitch competitions. Trying to build the room where the most interesting people on campus actually meet each other.",
  },
  {
    company: "Notre Dame Idea Center",
    role: "Startup Coach",
    dates: "Oct 2025 – Present",
    description:
      "Working with early-stage founders on fundraising strategy, pitch narrative, and market positioning. Also doing research for a stealth biotech startup.",
  },
  {
    company: "Symbal AI",
    role: "Growth",
    dates: "Oct 2025 – Present",
    description:
      "Founders Fund backed. Building AI-enhanced outbound sales for college students. I work on funnel design and messaging.",
  },
  {
    company: "Yelo",
    role: "Growth + GTM Lead",
    dates: "Jul – Oct 2025",
    description:
      "First real leadership role. Ran go-to-market across college campuses and managed a team of growth interns while finishing high school.",
  },
  {
    company: "Yale Law School",
    role: "Research Assistant",
    dates: "Jul 2024 – Jan 2025",
    description:
      "Co-designed a course on epistemology and law with Professor John Greco. Spent the summer thinking carefully about how we know what we know.",
  },
];

export default function Experience() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="font-serif text-5xl font-bold mb-4 tracking-tight">
            Work
          </h1>
          <p className="text-lg text-muted-foreground">
            Things I've done and why I found them worth doing.
          </p>
        </motion.div>

        <div className="space-y-0">
          {roles.map((role, i) => (
            <motion.div
              key={role.company}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="py-8 border-b border-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <h2 className="font-serif text-xl font-semibold tracking-tight">
                  {role.company}
                </h2>
                <span className="text-sm text-muted-foreground shrink-0">
                  {role.dates}
                </span>
              </div>
              <p className="text-sm font-medium text-primary mb-3">{role.role}</p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Resume download */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <p className="text-muted-foreground mb-4">
            Want the full picture?
          </p>
          <a
            href="/joseph-diener-resume.pdf"
            download
            className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors group"
          >
            <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
            Download resume
          </a>
        </motion.div>
      </div>
    </div>
  );
}
