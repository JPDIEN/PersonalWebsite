import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Send, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSubmissionSchema, type InsertContactSubmission } from "@shared/schema";

const socials = [
  { label: "LinkedIn", href: "https://linkedin.com/in/josephpdiener" },
  { label: "X / Twitter", href: "https://x.com/Joseph__Diener" },
  { label: "GitHub", href: "https://github.com/JPDIEN" },
  { label: "Substack", href: "https://substack.com/@josephdiener" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) =>
      await apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({ title: "Sent.", description: "I'll get back to you soon." });
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: () => {
      toast({ title: "Something went wrong.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-5xl font-bold mb-4 tracking-tight">
            Contact
          </h1>
          <p className="text-lg text-muted-foreground mb-14">
            Send a message or find me elsewhere.
          </p>

          {/* Social links */}
          <div className="space-y-1 mb-16">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group flex items-center justify-between py-4 border-b border-border hover:border-foreground transition-colors duration-200"
              >
                <span className="font-medium group-hover:text-primary transition-colors">
                  {s.label}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </div>

          {/* Contact form */}
          <h2 className="font-serif text-2xl font-semibold mb-8 tracking-tight">
            Or send a note
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind?"
                        {...field}
                        className="min-h-36 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground bg-transparent resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="btn" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button type="submit" disabled={mutation.isPending} className="px-8">
                      {mutation.isPending ? "Sending..." : (
                        <><Send className="mr-2 h-4 w-4" />Send</>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    Sent. I'll reply soon.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
