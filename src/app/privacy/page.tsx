"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white/80 dark:bg-black/80 rounded-2xl shadow-2xl p-8 md:p-12 mx-auto backdrop-blur-md border border-primary/10">
        <h1 className="text-4xl font-extrabold text-primary mb-6 text-center">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 text-center">Last updated: June 2024</p>
        <div className="space-y-6 text-base text-foreground">
          <p>HackHub is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">1. Information We Collect</h2>
          <p>We may collect personal information such as your name, email address, and usage data when you register or use HackHub.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">2. How We Use Information</h2>
          <p>We use your information to provide, maintain, and improve our services, communicate with you, and ensure platform security.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">3. Sharing of Information</h2>
          <p>We do not sell your personal information. We may share information with trusted partners to operate the platform, comply with legal obligations, or protect our rights.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">4. Data Security</h2>
          <p>We implement reasonable security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">5. Changes to Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">6. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@hackhub.com" className="text-primary underline">info@hackhub.com</a>.</p>
        </div>
      </div>
    </div>
  );
} 