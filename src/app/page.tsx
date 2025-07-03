"use client"
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function Home() {
    return (
        <div className="bg-background relative overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center z-10 bg-black overflow-hidden min-h-screen">
                {/* Animated Stars */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Falling stars - scattered across the screen */}
                    <div className="star-1"></div>
                    <div className="star-2"></div>
                    <div className="star-3"></div>
                    <div className="star-4"></div>
                    <div className="star-5"></div>
                    <div className="star-6"></div>
                    <div className="star-7"></div>
                    <div className="star-8"></div>
                    <div className="star-9"></div>
                    <div className="star-10"></div>
                    <div className="star-11"></div>
                    <div className="star-12"></div>
                    <div className="star-13"></div>
                    <div className="star-14"></div>
                    <div className="star-15"></div>
                    <div className="star-16"></div>
                    <div className="star-17"></div>
                    <div className="star-18"></div>
                    <div className="star-19"></div>
                    <div className="star-20"></div>
                </div>
                
                {/* Corner Glows */}
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/30 rounded-full blur-3xl opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl opacity-40"></div>
                <div className="absolute top-20 left-20 w-64 h-64 bg-green-400/20 rounded-full blur-2xl opacity-40"></div>
                
                <div className="container py-xl-10 relative z-10">
                    <div className="row py-xl-4">
                        <div className="col-xxl-8 offset-xxl-2 col-xl-8 offset-xl-2 col-lg-10 offset-lg-1 col-12">
                            <div className="text-center d-flex flex-column gap-6">
                                <div className="d-flex flex-column gap-3">
                                    <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 rounded-full px-4 py-2 mb-6 mx-auto backdrop-blur-sm">
                                        <span className="text-2xl">🚀</span>
                                        <span className="text-purple-400 font-semibold">AI-Powered Hackathon Platform</span>
                                    </div>
                                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 text-white">
                                        <span className="bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                                            Unleash the Power of AI
                                        </span>
                                        <br />
                                        <span className="text-white">in Hackathon Discovery</span>
                                    </h1>
                                    <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                                        Transform hackathons from isolated events into a connected ecosystem where every participation 
                                        contributes to long-term career growth. Let AI match you with perfect hackathons, teammates, 
                                        and opportunities powered by machine learning.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/auth/signup">
                                        <Button size="lg" className="w-full sm:w-auto shadow-lg bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 border-0">
                                            🎯 Discover
                                        </Button>
                                    </Link>
                                    <Link href="/hackathons">
                                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400">
                                            Browse Hackathons
                                        </Button>
                                    </Link>
                                </div>
                                <div className="flex flex-row align-items-center justify-center gap-3 mt-6">
                                    <div className="flex -space-x-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-green-500 border-2 border-black shadow-lg"></div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-black shadow-lg"></div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-black shadow-lg"></div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-black shadow-lg"></div>
                                    </div>
                                    <small className="text-gray-400 font-medium">Join 10,000+ developers building with AI</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <style jsx>{`
                    /* Base star styles with different sizes and brightness */
                    .star-1, .star-2, .star-3, .star-4, .star-5, .star-6, .star-7, .star-8, .star-9, .star-10,
                    .star-11, .star-12, .star-13, .star-14, .star-15, .star-16, .star-17, .star-18, .star-19, .star-20 {
                        position: absolute;
                        border-radius: 50%;
                        animation: fall linear infinite;
                        background: white;
                        z-index: 50;
                    }
                    
                    /* Small bright stars */
                    .star-1, .star-5, .star-9, .star-13, .star-17 {
                        width: 2px;
                        height: 2px;
                        box-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 16px rgba(255, 255, 255, 0.6);
                    }
                    
                    /* Medium stars */
                    .star-2, .star-6, .star-10, .star-14, .star-18 {
                        width: 3px;
                        height: 3px;
                        box-shadow: 0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.7);
                    }
                    
                    /* Large bright stars */
                    .star-3, .star-7, .star-11, .star-15, .star-19 {
                        width: 4px;
                        height: 4px;
                        box-shadow: 0 0 12px rgba(255, 255, 255, 1), 0 0 24px rgba(255, 255, 255, 0.8);
                    }
                    
                    /* Extra large stars */
                    .star-4, .star-8, .star-12, .star-16, .star-20 {
                        width: 5px;
                        height: 5px;
                        box-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.9);
                    }
                    
                    /* Scattered positions and timing */
                    .star-1 { left: 5%; animation-duration: 8s; animation-delay: 0s; }
                    .star-2 { left: 12%; animation-duration: 12s; animation-delay: 1s; }
                    .star-3 { left: 23%; animation-duration: 10s; animation-delay: 2.5s; }
                    .star-4 { left: 34%; animation-duration: 15s; animation-delay: 0.8s; }
                    .star-5 { left: 41%; animation-duration: 9s; animation-delay: 3s; }
                    .star-6 { left: 52%; animation-duration: 11s; animation-delay: 1.2s; }
                    .star-7 { left: 63%; animation-duration: 13s; animation-delay: 4s; }
                    .star-8 { left: 71%; animation-duration: 7s; animation-delay: 0.3s; }
                    .star-9 { left: 78%; animation-duration: 14s; animation-delay: 2s; }
                    .star-10 { left: 85%; animation-duration: 9.5s; animation-delay: 1.8s; }
                    .star-11 { left: 92%; animation-duration: 16s; animation-delay: 3.5s; }
                    .star-12 { left: 18%; animation-duration: 8.5s; animation-delay: 0.6s; }
                    .star-13 { left: 27%; animation-duration: 12.5s; animation-delay: 2.8s; }
                    .star-14 { left: 38%; animation-duration: 10.5s; animation-delay: 1.5s; }
                    .star-15 { left: 46%; animation-duration: 13.5s; animation-delay: 4.2s; }
                    .star-16 { left: 56%; animation-duration: 11.5s; animation-delay: 0.9s; }
                    .star-17 { left: 67%; animation-duration: 9.8s; animation-delay: 3.3s; }
                    .star-18 { left: 74%; animation-duration: 14.5s; animation-delay: 1.7s; }
                    .star-19 { left: 82%; animation-duration: 8.8s; animation-delay: 2.4s; }
                    .star-20 { left: 96%; animation-duration: 17s; animation-delay: 4.8s; }
                    
                    @keyframes fall {
                        0% {
                            transform: translateY(-100vh) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                `}</style>
            </section>
            {/* HackHub Features Section */}
            <section className="py-xl-9 pb-lg-9 pt-5 pb-6">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="text-center mb-xl-7 mb-5 d-flex flex-column gap-2">
                                <h2 className="text-3xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                                        Our HackHub Platform
                                    </span>
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    AI-powered tools to transform your hackathon journey and career growth
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <Card className="bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <CardHeader className="p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-white text-2xl">🔍</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Intelligent Discovery</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    Find perfect hackathons with AI-powered matching based on your skills, interests, and career goals
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <CardHeader className="p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-white text-2xl">🤝</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Smart Team Formation</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    AI algorithms match you with complementary teammates based on skills, preferences, and working styles
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <CardHeader className="p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-white text-2xl">🤖</span>
                                </div>
                                <CardTitle className="text-xl font-bold">AI Assistant</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    Real-time coding help, project guidance, and strategic advice powered by advanced AI models
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <CardHeader className="p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-white text-2xl">🏆</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Achievement System</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    Build your professional portfolio with verified certificates, badges, and blockchain-secured achievements
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            <CardHeader className="p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-white text-2xl">📊</span>
                                </div>
                                <CardTitle className="text-xl font-bold">Analytics & Insights</CardTitle>
                                <CardDescription className="text-base leading-relaxed">
                                    Comprehensive analytics for participants and organizers with AI-powered success predictions and recommendations
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section className="py-xl-9 py-lg-7 py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="text-center mb-xl-7 mb-5 d-flex flex-column gap-2">
                                <h2 className="text-3xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                                        How HackHub Works
                                    </span>
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    Get started with our AI-powered hackathon platform in just a few simple steps
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white text-3xl font-bold">1</span>
                                </div>
                                {/* Connection line for desktop */}
                                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-4"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Sign Up & Profile</h3>
                            <p className="text-muted-foreground">Create your account and let our AI analyze your skills, interests, and career goals</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white text-3xl font-bold">2</span>
                                </div>
                                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-4"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Discover Hackathons</h3>
                            <p className="text-muted-foreground">Browse AI-curated hackathons perfectly matched to your skills and interests</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white text-3xl font-bold">3</span>
                                </div>
                                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-4"></div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Form Teams & Build</h3>
                            <p className="text-muted-foreground">Connect with ideal teammates and leverage AI assistance throughout your project</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white text-3xl font-bold">4</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Achieve & Grow</h3>
                            <p className="text-muted-foreground">Earn verified achievements, build your portfolio, and advance your career</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* HackHub Success Metrics */}
            <section className="py-xl-9 py-lg-7 py-5 bg-gradient-to-br from-background via-accent/5 to-background">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="text-center mb-xl-7 mb-5">
                                <h2 className="text-3xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                                        Platform Impact
                                    </span>
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    Real results from our AI-powered hackathon ecosystem
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <Card className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                            <div className="text-4xl mb-4">🎯</div>
                            <div className="text-4xl font-bold text-primary mb-2">95%</div>
                            <div className="text-sm text-muted-foreground font-semibold">AI Match Accuracy</div>
                        </Card>
                        
                        <Card className="text-center p-8 bg-gradient-to-br from-green-500/10 to-blue-600/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
                            <div className="text-4xl mb-4">⚡</div>
                            <div className="text-4xl font-bold text-primary mb-2">3.2x</div>
                            <div className="text-sm text-muted-foreground font-semibold">Faster Team Formation</div>
                        </Card>
                        
                        <Card className="text-center p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                            <div className="text-4xl mb-4">🏆</div>
                            <div className="text-4xl font-bold text-primary mb-2">67%</div>
                            <div className="text-sm text-muted-foreground font-semibold">Higher Success Rate</div>
                        </Card>
                        
                        <Card className="text-center p-8 bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
                            <div className="text-4xl mb-4">👥</div>
                            <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                            <div className="text-sm text-muted-foreground font-semibold">Active Developers</div>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="py-xl-9 py-lg-7 py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="text-center mb-xl-7 mb-5">
                                <h2 className="text-3xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                                        What Our Community Says
                                    </span>
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    Trusted by developers and organizations worldwide
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="p-6 bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                            <CardContent className="p-0">
                                <div className="flex items-start gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-500 text-lg">⭐</span>
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    "HackHub's AI recommendations helped me find the perfect hackathon that matched my React skills. I won first place and landed my dream job!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        S
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Sarah Chen</h4>
                                        <p className="text-sm text-muted-foreground">Full-Stack Developer</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="p-6 bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                            <CardContent className="p-0">
                                <div className="flex items-start gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-500 text-lg">⭐</span>
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    "As an organizer, HackHub gave us access to an amazing pool of talent. The quality of participants exceeded our expectations!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                        M
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Marcus Rodriguez</h4>
                                        <p className="text-sm text-muted-foreground">Innovation Director, TechCorp</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="p-6 bg-gradient-to-br from-background to-accent/20 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                            <CardContent className="p-0">
                                <div className="flex items-start gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-500 text-lg">⭐</span>
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    "The team formation feature is incredible! I found my co-founder through HackHub's AI matching. We're now building a startup together."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Aisha Patel</h4>
                                        <p className="text-sm text-muted-foreground">Startup Founder</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-lg-9 py-md-8 py-5 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-6 offset-xxl-3 col-12">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold mb-6">
                                    Ready to Transform Your <br />
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                                        Hackathon Journey?
                                    </span>
                                </h2>
                                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                    Join thousands of developers and organizations using HackHub to discover opportunities, 
                                    build amazing teams, and accelerate careers through AI-powered hackathon experiences.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/auth/signup">
                                        <Button size="lg" className="w-full sm:w-auto shadow-lg">
                                            🚀 Discover
                                        </Button>
                                    </Link>
                                    <Link href="/hackathons">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                            Browse Hackathons
                                        </Button>
                                    </Link>
                                </div>
                                <div className="mt-6">
                                    <small className="text-muted-foreground">No credit card required • Join 10,000+ developers</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
