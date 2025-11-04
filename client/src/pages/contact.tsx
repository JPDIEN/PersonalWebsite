import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Linkedin, Twitter, Github, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSubmissionSchema, type InsertContactSubmission } from "@shared/schema";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({
        title: "message sent!",
        description: "thanks for reaching out:) i'll get back to you soon.",
      });
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: () => {
      toast({
        title: "error",
        description: "failed to send message. please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContactSubmission) => {
    mutation.mutate(data);
  };

  const socialLinks = [
    { icon: Mail, label: "Email", href: "jdiener2@nd.edu" },
    { icon: Linkedin, label: "LinkedIn", href: "linkedin.com/in/josephpdiener" },
    { icon: Twitter, label: "X", href: "x.com/Joseph__Diener" },
    { icon: Github, label: "GitHub", href: "https://github.com/JPDIEN" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" data-testid="text-contact-title">
            Coda
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          every ending leads into the next thing. if something here caught your attention, i’d love to keep the conversation going.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          data-testid="input-name"
                          className="border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          data-testid="input-email"
                          className="border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
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
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts, ideas, or just say hello..."
                          {...field}
                          data-testid="input-message"
                          className="min-h-48 border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="submit-button"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        disabled={mutation.isPending}
                        className="w-full md:w-auto px-8"
                        data-testid="button-submit"
                      >
                        {mutation.isPending ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-primary/10 border-2 border-primary rounded-lg text-center"
                      data-testid="text-success"
                    >
                      <p className="font-medium text-primary">message sent successfully!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        i'll respond as soon as possible.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </motion.div>

          {/* Right Side - Tagline & Social */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6 leading-tight" data-testid="text-contact-tagline">
              Let's make something worth hearing.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-contact-description">
              whether you're building a startup, exploring a new idea, or just want to connect -
              i'm always excited to collaborate, discuss cool ideas, or simply work on solving some interesting problems.
            </p>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide" data-testid="text-connect-header">
                Connect
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-all duration-300 hover-elevate"
                    data-testid={`link-social-${link.label.toLowerCase()}`}
                  >
                    <link.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg border-l-4 border-primary" data-testid="card-easter-egg">
              <p className="text-sm text-muted-foreground italic" data-testid="text-easter-egg">
                💡 <strong>Easter egg:</strong> try including the word "improvise" in your message
                for a special touch.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
