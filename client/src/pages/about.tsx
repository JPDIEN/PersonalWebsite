import { motion } from "framer-motion";

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
              Right now I'm at Notre Dame studying finance. Most of my time goes toward
              startups and early-stage investing: coaching founders at the Idea Center,
              doing VC at NDVC, running events for FouNDers Club. I've helped founders
              raise money, run growth at a VC-backed startup, and once spent a summer at
              Yale thinking about epistemology with a law professor. Still figuring out the throughline.
            </p>
            <p>
              Piano is probably the thing I care most about that has nothing to do with work.
              I've played my whole life and it's genuinely the only time my brain fully
              quiets down. I also read obsessively, usually three books at once, always
              more than I finish. Outside of that: chess, rock climbing, skiing, spikeball,
              tennis. I'm happiest when I'm moving or learning something slightly over my head.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
