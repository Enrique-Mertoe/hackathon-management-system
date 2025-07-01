import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Image from 'next/image'

export default function Home() {
    return (
        <div className="bg-background relative overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 bg-black lg:px-8 flex flex-col items-center justify-center z-10">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-100 mb-6 drop-shadow-lg">
                                Discover Amazing{" "}
                                <span className="text-primary">Hackathons</span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                                Join the ultimate platform for finding hackathons, building teams, and advancing your career
                                through competitive programming and innovation challenges.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/hackathons">
                                    <Button size="lg" className="w-full sm:w-auto shadow-lg glow-cta">
                                        Explore Hackathons
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-accent/20 transition-all duration-700 overflow-hidden">
                {/* Animated Gradient Overlay (only in features) */}
                <div className="pointer-events-none absolute inset-0 z-0 animate-gradient bg-gradient-to-tr from-primary/30 via-secondary/30 to-accent/30 opacity-80" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Why Choose HackHub?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Everything you need to succeed in hackathons, all in one place
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border border-primary bg-accent/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-2">
                            <CardHeader>
                                <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4 text-2xl shadow-md">
                                    <span className="text-primary-foreground font-bold text-2xl">🔍</span>
                                </div>
                                <CardTitle className="text-lg font-bold">Smart Discovery</CardTitle>
                                <CardDescription className="text-base">
                                    Find hackathons that match your skills, interests, and schedule with AI-powered
                                    recommendations
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="border border-primary bg-accent/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-2">
                            <CardHeader>
                                <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4 text-2xl shadow-md">
                                    <span className="text-primary-foreground font-bold text-2xl">👥</span>
                                </div>
                                <CardTitle className="text-lg font-bold">Team Formation</CardTitle>
                                <CardDescription className="text-base">
                                    Connect with like-minded developers and build the perfect team for your next project
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="border border-primary bg-accent/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-2">
                            <CardHeader>
                                <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4 text-2xl shadow-md">
                                    <span className="text-primary-foreground font-bold text-2xl">🏆</span>
                                </div>
                                <CardTitle className="text-lg font-bold">Track Achievements</CardTitle>
                                <CardDescription className="text-base">
                                    Build your portfolio with verified certificates and showcase your hackathon success
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>
            {/* Divider between Features and Stats */}
            <div className="w-full flex justify-center items-center my-12 bg-black">
                <div className="h-1 w-32 bg-gradient-to-r from-accent via-primary to-accent rounded-full opacity-60" />
            </div>
            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black fade-in-section">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="fade-in-up rounded-2xl border-2 border-transparent bg-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center py-12 px-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-3xl hover:bg-white/20 group relative overflow-hidden" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                            <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-primary group-hover:opacity-80 transition-all duration-300" style={{background: 'linear-gradient(120deg, rgba(234,88,12,0.15) 0%, rgba(254,215,170,0.10) 100%)'}} />
                            <div className="relative z-10 text-3xl font-extrabold text-white mb-2 drop-shadow-lg">10,000+</div>
                            <div className="relative z-10 text-base text-white/90 font-semibold tracking-wide">Active Developers</div>
                        </div>
                        <div className="fade-in-up rounded-2xl border-2 border-transparent bg-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center py-12 px-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-3xl hover:bg-white/20 group relative overflow-hidden" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                            <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-primary group-hover:opacity-80 transition-all duration-300" style={{background: 'linear-gradient(120deg, rgba(234,88,12,0.15) 0%, rgba(254,215,170,0.10) 100%)'}} />
                            <div className="relative z-10 text-3xl font-extrabold text-white mb-2 drop-shadow-lg">500+</div>
                            <div className="relative z-10 text-base text-white/90 font-semibold tracking-wide">Hackathons Listed</div>
                        </div>
                        <div className="fade-in-up rounded-2xl border-2 border-transparent bg-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center py-12 px-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-3xl hover:bg-white/20 group relative overflow-hidden" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                            <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-primary group-hover:opacity-80 transition-all duration-300" style={{background: 'linear-gradient(120deg, rgba(234,88,12,0.15) 0%, rgba(254,215,170,0.10) 100%)'}} />
                            <div className="relative z-10 text-3xl font-extrabold text-white mb-2 drop-shadow-lg">1,000+</div>
                            <div className="relative z-10 text-base text-white/90 font-semibold tracking-wide">Teams Formed</div>
                        </div>
                        <div className="fade-in-up rounded-2xl border-2 border-transparent bg-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center py-12 px-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-3xl hover:bg-white/20 group relative overflow-hidden" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                            <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-primary group-hover:opacity-80 transition-all duration-300" style={{background: 'linear-gradient(120deg, rgba(234,88,12,0.15) 0%, rgba(254,215,170,0.10) 100%)'}} />
                            <div className="relative z-10 text-3xl font-extrabold text-white mb-2 drop-shadow-lg">$2M+</div>
                            <div className="relative z-10 text-base text-white/90 font-semibold tracking-wide">Prize Money</div>
                        </div>
                    </div>
                </div>
            </section>
            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary shadow-2xl transition-all duration-700">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                        Ready to Start Your Hackathon Journey?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Join thousands of developers who are already building amazing projects and advancing their
                        careers
                    </p>
                    <Link href="/auth/signup">
                        <Button size="lg" variant="secondary" className="glow-cta">
                            Join HackHub Today
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
