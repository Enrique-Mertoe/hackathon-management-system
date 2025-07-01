"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white/80 dark:bg-black/80 rounded-2xl shadow-2xl p-8 md:p-12 mx-auto backdrop-blur-md border border-primary/10">
        <h1 className="text-4xl font-extrabold text-primary mb-6 text-center">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8 text-center">Last updated: June 2024</p>
        <div className="space-y-6 text-base text-foreground">
          <p>Welcome to HackHub! By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">1. Use of Platform</h2>
          <p>You must use HackHub in compliance with all applicable laws and regulations. You agree not to misuse the platform or attempt to access it using a method other than the interface and instructions we provide.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">3. Content</h2>
          <p>You retain ownership of any content you submit, post, or display on HackHub. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the platform.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">4. Termination</h2>
          <p>We may suspend or terminate your access to HackHub at any time, with or without cause or notice.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">5. Changes to Terms</h2>
          <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the platform constitutes acceptance of the new terms.</p>
          <h2 className="text-xl font-bold text-primary mt-8 mb-2">6. Contact</h2>
          <p>If you have any questions about these Terms, please contact us at <a href="mailto:info@hackhub.com" className="text-primary underline">info@hackhub.com</a>.</p>
        </div>
      </div>
    </div>
  );
} 