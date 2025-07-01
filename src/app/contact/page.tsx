"use client";

import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-white/80 dark:bg-black/80 rounded-2xl shadow-2xl p-8 md:p-12 mx-auto backdrop-blur-md border border-primary/10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary text-center mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground text-center mb-8">
          Have a question, suggestion, or want to partner with us? Fill out the form below or email us at <a href="mailto:info@hackhub.com" className="text-primary underline">info@hackhub.com</a>.
        </p>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" className="w-full rounded-md border border-border bg-background px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Your Name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input type="email" className="w-full rounded-md border border-border bg-background px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="you@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea className="w-full rounded-md border border-border bg-background px-4 py-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] resize-y" placeholder="How can we help you?" required />
          </div>
          <Button type="submit" size="lg" className="w-full glow-cta">Send Message</Button>
        </form>
      </div>
    </div>
  );
} 