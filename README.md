# HackHub - Hackathon Management System

A comprehensive platform for discovering hackathons, building teams, and advancing careers through competitive programming and innovation challenges.

## 🚀 Features

- **Role-based Authentication**: Support for Participants, Organizers, Mentors, Judges, and Admins
- **AI-Powered Copilot**: Smart hackathon planning assistant with form auto-fill capabilities
- **Hackathon Discovery**: AI-powered recommendations and advanced filtering
- **Team Formation**: Smart team matching and collaboration tools
- **Real-time Communication**: Integrated messaging and updates
- **Achievement System**: Certificates and portfolio building
- **Orange Theme**: Modern, responsive UI with custom orange color scheme

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Material-UI (MUI)
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API
- **Styling**: Material-UI with custom orange theme

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## ⚡ Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hackathon-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `sql.sql` into the SQL Editor
4. Run the script to create all tables, types, indexes, and triggers

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your configuration:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hackhub"

# Authentication
JWT_SECRET="your-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-here"

# AI Services
GEMINI_API_KEY="your-gemini-api-key-here"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your HackHub instance!

## 📸 Screenshots

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">

<div>

### AI-Powered Hackathon Creation
![Hackathon Creation with AI Copilot](screenshots/hack-create.png)

The AI copilot feature provides intelligent suggestions for hackathon planning, helping organizers quickly fill out forms with relevant information including titles, themes, dates, and more. Users can apply suggestions individually or all at once directly from the conversation interface.

</div>

<div>

### Hackathon Management Dashboard
![Hackathon Details & Analysis View](screenshots/hack-view.png)

The redesigned hackathon details page features small cards with shadows, poster integration, and a context-aware AI assistant. The AI provides hackathon analysis, tech stack recommendations, skill assessments, and preparation timelines to help participants succeed.

</div>

</div>

## 👥 User Roles

### Participant
- Discover and register for hackathons
- Form teams and collaborate
- Track achievements and build portfolio

### Organizer
- Create and manage hackathons
- Access participant analytics
- Manage communications and updates

### Mentor
- Guide participants during hackathons
- Provide expertise and resources
- Support team development

### Judge
- Evaluate hackathon submissions
- Provide feedback and scoring
- Participate in judging workflows

### Admin
- Platform administration
- User and content moderation
- System analytics and management

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- SQL injection prevention
- XSS protection
- CSRF protection

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Hackathon Endpoints
- `GET /api/hackathons` - List hackathons with filters
- `POST /api/hackathons` - Create new hackathon (organizers)
- `GET /api/hackathons/[id]` - Get hackathon details
- `PUT /api/hackathons/[id]` - Update hackathon (organizers)

## 🚢 Deployment

### Environment Setup
1. Set up production environment variables
2. Configure Supabase for production
3. Set up domain and SSL certificates

### Recommended Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🗺 Roadmap

- [ ] AI-powered hackathon recommendations
- [ ] Real-time chat and collaboration
- [ ] Advanced team matching algorithms
- [ ] Certificate generation and blockchain verification
- [ ] Mobile app development
- [ ] Integration with popular development tools

---

Built with ❤️ using Next.js, Supabase, and TailwindCSS
