import { useRef, useEffect, cloneElement, isValidElement, ReactElement } from "react";

interface MagneticProps {
  children: ReactElement;
  strength?: number;
}

export function Magnetic({ children, strength = 0.32 }: MagneticProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      el.style.transition = "transform 0.12s ease-out";
    };

    const onLeave = () => {
      el.style.transform = "translate(0px, 0px)";
      el.style.transition = "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  if (!isValidElement(children)) return children;
  return cloneElement(children, { ref } as any);
}
