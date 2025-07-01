"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const team = [
  {
    name: "Lewis Manyasa",
    role: "Full Stack Developer",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Martin Abuti",
    role: "Full Stack Developer",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero/Intro Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-black text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 animate-gradient bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 opacity-60" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl font-extrabold text-primary mb-6">About HackHub</h1>
          <p className="text-xl text-white/90 mb-8">
            HackHub is the ultimate platform for discovering hackathons, building teams, and advancing your career through competitive programming and innovation challenges.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-accent/40 rounded-xl p-6 shadow-md border border-primary/10">
              <h3 className="text-xl font-semibold text-primary mb-2">Connect Innovators</h3>
              <p className="text-muted-foreground text-base">We bring together developers, designers, and creators from around the world to collaborate and compete in exciting hackathons.</p>
            </div>
            <div className="bg-accent/40 rounded-xl p-6 shadow-md border border-primary/10">
              <h3 className="text-xl font-semibold text-primary mb-2">Empower Growth</h3>
              <p className="text-muted-foreground text-base">Our platform provides resources, mentorship, and opportunities for skill development and career advancement.</p>
            </div>
            <div className="bg-accent/40 rounded-xl p-6 shadow-md border border-primary/10">
              <h3 className="text-xl font-semibold text-primary mb-2">Celebrate Success</h3>
              <p className="text-muted-foreground text-base">We recognize and reward outstanding achievements, helping you build a portfolio and gain recognition in the tech community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Our Mission</h2>
            <p className="text-base text-muted-foreground">
              To empower developers, students, and innovators worldwide by providing seamless access to hackathons, resources, and collaborative opportunities.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Our Vision</h2>
            <p className="text-base text-muted-foreground">
              To be the leading global hub for tech talent, fostering creativity, learning, and real-world impact through the spirit of competition and community.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Our Values</h2>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
            <li className="bg-accent/40 rounded-lg px-6 py-3 text-primary font-semibold shadow-sm border border-primary/10">Inclusivity</li>
            <li className="bg-accent/40 rounded-lg px-6 py-3 text-primary font-semibold shadow-sm border border-primary/10">Innovation</li>
            <li className="bg-accent/40 rounded-lg px-6 py-3 text-primary font-semibold shadow-sm border border-primary/10">Collaboration</li>
            <li className="bg-accent/40 rounded-lg px-6 py-3 text-primary font-semibold shadow-sm border border-primary/10">Growth</li>
          </ul>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center items-center mx-auto" style={{maxWidth: '600px'}}>
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center bg-background rounded-xl p-6 shadow-md border border-primary/10">
                <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full mb-4 shadow-lg object-cover" />
                <div className="font-bold text-primary text-lg mb-1">{member.name}</div>
                <div className="text-muted-foreground text-sm">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action / Contact Section */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-primary text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to join the movement?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Sign up today and become part of a global community of innovators, creators, and problem-solvers.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="glow-cta">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 