import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const books = [
  {
    title: "Perelandra",
    author: "C.S. Lewis",
    note: "Space travel as moral philosophy. Lewis makes goodness feel genuinely exciting.",
    spine: "from-emerald-700 to-emerald-900",
  },
  {
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    note: "The most ambitious sci-fi I've read. Changes how you think about civilization and time.",
    spine: "from-slate-600 to-slate-800",
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    note: "Short and world-altering. The argument that meaning, not happiness, is the point.",
    spine: "from-amber-700 to-amber-900",
  },
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    note: "The best startup memoir. Building something real is always messier than the highlight reel.",
    spine: "from-orange-600 to-orange-800",
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-5xl font-bold mb-12 tracking-tight">
            About
          </h1>

          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              I'm the oldest of six, grew up homeschooled in Connecticut, and basically
              learned to self-direct before I knew that was a thing. Having five younger
              siblings means you're either leading, learning, or laughing, usually all three
              in the same afternoon. I think it made me pretty good at figuring things out
              without a manual.
            </p>
            <p>
              Right now I'm a freshman at Notre Dame studying finance. Most of my time goes
              toward startups and early-stage investing: coaching founders at the Idea Center,
              doing VC at NDVC, running events for FouNDers Club. I've managed teams of 30+,
              helped founders raise money, and once spent a summer at Yale thinking about
              epistemology with a law professor. I'm still figuring out the throughline.
            </p>
            <p>
              Piano is probably the thing I care most about that has nothing to do with work.
              I've played my whole life and it's genuinely the only time my brain fully
              quiets down. I also read obsessively, usually three books at once, always
              more than I finish. Outside of that: chess, rock climbing, skiing, spikeball,
              tennis. I'm happiest when I'm moving or learning something slightly over my head.
            </p>
          </div>

          {/* Reading shelf */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <div className="flex items-center gap-2 mb-8">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                on the shelf
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {books.map((book, index) => (
                <motion.div
                  key={book.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -3 }}
                  className="group"
                >
                  <Card className="overflow-hidden border hover:border-foreground/30 transition-all duration-200 h-full flex flex-col shadow-none">
                    <div className={`h-1 w-full bg-gradient-to-r ${book.spine}`} />
                    <div className="p-5 flex flex-col flex-1">
                      <p className="font-serif font-semibold text-base mb-0.5 group-hover:text-primary transition-colors">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">{book.author}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                        {book.note}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
