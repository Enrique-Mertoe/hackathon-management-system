import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function Home() {
    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 bg-black lg:px-8">
                <div className="absolute left-0 -top-24">
                    <div className="flex items-center blur-lg justify-center">
                        <div
                            className="w-74 h-[530px] md:-rotate-45"
                            style={{
                                clipPath: 'polygon(49% 0%, 51% 0%, 100% 100%, 0% 100%)',
                                background: `
            radial-gradient(ellipse at center, rgba(255, 255, 255, 0.6) 0%, transparent 70%),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4), transparent)
          `,
                                boxShadow: `
            0 0 40px rgba(255, 255, 255, 0.3),
            0 0 100px rgba(255, 255, 255, 0.1),
            0 30px 50px rgba(255, 255, 255, 0.05)
          `,
                            }}
                        />
                    </div>

                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold text-gray-100 mb-6">
                            Discover Amazing{" "}
                            <span className="text-primary">Hackathons</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            Join the ultimate platform for finding hackathons, building teams, and advancing your career
                            through competitive programming and innovation challenges.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/hackathons">
                                <Button size="lg" className="w-full sm:w-auto">
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
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
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
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-primary-foreground font-bold text-xl">🔍</span>
                                </div>
                                <CardTitle>Smart Discovery</CardTitle>
                                <CardDescription>
                                    Find hackathons that match your skills, interests, and schedule with AI-powered
                                    recommendations
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-primary-foreground font-bold text-xl">👥</span>
                                </div>
                                <CardTitle>Team Formation</CardTitle>
                                <CardDescription>
                                    Connect with like-minded developers and build the perfect team for your next project
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-primary-foreground font-bold text-xl">🏆</span>
                                </div>
                                <CardTitle>Track Achievements</CardTitle>
                                <CardDescription>
                                    Build your portfolio with verified certificates and showcase your hackathon success
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                            <div className="text-muted-foreground">Active Developers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">500+</div>
                            <div className="text-muted-foreground">Hackathons Listed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
                            <div className="text-muted-foreground">Teams Formed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">$2M+</div>
                            <div className="text-muted-foreground">Prize Money</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                        Ready to Start Your Hackathon Journey?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Join thousands of developers who are already building amazing projects and advancing their
                        careers
                    </p>
                    <Link href="/auth/signup">
                        <Button size="lg" variant="secondary">
                            Join HackHub Today
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
