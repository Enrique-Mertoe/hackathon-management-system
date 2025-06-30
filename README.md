# HackHub - Hackathon Management System

A comprehensive platform for discovering hackathons, building teams, and advancing careers through competitive programming and innovation challenges.

## 🚀 Features

- **Role-based Authentication**: Support for Participants, Organizers, Mentors, Judges, and Admins
- **Hackathon Discovery**: AI-powered recommendations and advanced filtering
- **Team Formation**: Smart team matching and collaboration tools
- **Real-time Communication**: Integrated messaging and updates
- **Achievement System**: Certificates and portfolio building
- **Orange Theme**: Modern, responsive UI with custom orange color scheme

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS with custom orange theme

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

Copy `.env.local` and update with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (generate a strong random string)
JWT_SECRET=your-jwt-secret-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=HackHub
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your HackHub instance!

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── hackathons/        # Hackathon discovery
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   └── supabase.ts       # Supabase client
└── types/                # TypeScript definitions
    └── database.ts       # Database types
```

### Key Files
- `sql.sql` - Complete database schema for Supabase
- `src/lib/auth.ts` - Authentication logic with role-based permissions
- `src/lib/supabase.ts` - Supabase client configuration
- `src/app/globals.css` - Orange theme and custom styling

## 🎨 Theme Customization

The orange theme is defined in `src/app/globals.css`. Key colors:
- Primary: `#ea580c` (Orange 600)
- Secondary: `#fed7aa` (Orange 200)
- Accent: `#ffedd5` (Orange 100)

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
