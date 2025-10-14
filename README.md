# 🏠 Family Hub - Stay Connected & Organized

A comprehensive Progressive Web App for managing family life: tasks, events, shopping lists, meal planning, money tracking, and more.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![E2E Tests](https://img.shields.io/badge/E2E-Playwright-45ba4b)](https://playwright.dev/)

---

## ✨ Features

### 📋 Task Management
- Create, assign, and track family tasks
- Priority levels (low, medium, high)
- Due dates and completion tracking
- Auto-generated tasks from meal plans

### 📅 Calendar & Events
- Family calendar with event management
- Event categories and member assignments
- Visual calendar view
- Integration with meals and tasks

### 🛒 Shopping Lists
- Collaborative shopping lists
- Categories (groceries, household, etc.)
- Purchase tracking
- Auto-generated from meal plans

### 🍽️ Meal Planning
- **NEW**: Smart search and filter system
- **NEW**: Favorites and templates
- Weekly meal planner with meal types
- Ingredient tracking
- **NEW**: One-click task generation
- **NEW**: One-click shopping list generation

### 💰 Money Tracking
- Income and expense tracking
- Category-based organization
- Transaction history
- Summary statistics

### 👨‍👩‍👧‍👦 Family Management
- Family member profiles with colors
- Relationship tracking
- Assignment and responsibility management

### 📱 Progressive Web App
- **NEW**: Install on mobile and desktop
- **NEW**: Works offline
- **NEW**: App shortcuts
- **NEW**: Custom icon and splash screen
- **NEW**: Push notifications ready

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/family-hub-app.git
cd family-hub-app

# Start with Docker
docker-compose up -d

# Access the app
open http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start database (requires Docker)
docker-compose up -d db

# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
npm run dev

# Access the app
open http://localhost:5173
```

---

## 📱 Install as PWA

### Mobile (iOS)
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Tap "Add"

### Mobile (Android)
1. Open in Chrome
2. Tap Menu → "Install app"
3. Tap "Install"

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"
3. App opens in standalone window

**Full PWA guide**: See [PWA_GUIDE.md](PWA_GUIDE.md)

---

## 🎯 New Features (v2.0)

### 🔍 Smart Meal Search & Filtering
Find meals instantly with:
- Real-time text search
- Meal type filters (breakfast, lunch, dinner, snack)
- Favorites-only view
- Active filter indicators

### ✅ Auto-Generate Tasks from Meals
- Click checkbox icon on any meal
- Automatically creates prep task
- Sets due time to 1 hour before meal
- Includes notification

### 🛒 Meal-to-Shopping Integration
- Click shopping cart icon on meals
- Ingredients auto-added to shopping list
- Duplicate items merged automatically
- Instant notifications

### ⭐ Favorites & Templates
- Mark favorite meals with star
- Create reusable templates
- Filter by favorites
- Build family recipe collection

**What's New**: See [WHATS_NEW.md](WHATS_NEW.md) for details

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Lucide Icons** for beautiful icons
- **PWA** with service worker

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **PostgreSQL 16** database
- **express-validator** for input validation

### DevOps & Testing
- **Docker** & **Docker Compose**
- **Playwright** for E2E testing (NEW)
- Automated health checks
- Hot-reload development
- Production-ready builds
- CI/CD with GitHub Actions (NEW)

---

## 📂 Project Structure

```
family-hub-app/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── FamilyMemberForm.tsx
│   │   ├── Forms.tsx
│   │   ├── Modal.tsx
│   │   ├── MealSearchFilter.tsx      # NEW
│   │   ├── TaskFromMealButton.tsx    # NEW
│   │   └── PWAInstallPrompt.tsx      # NEW
│   ├── services/
│   │   └── api.ts               # API client
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── backend/                     # Backend source
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── database/           # DB initialization
│   │   └── index.ts            # Express server
│   └── Dockerfile              # Backend container
├── public/                      # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── icon-192.svg/png        # App icons
│   └── icon-512.svg/png
├── docker-compose.yml          # Docker services
├── Makefile                    # Convenience commands
└── scripts/                    # Utility scripts
    ├── setup.sh
    ├── cleanup.sh
    └── generate-icons.sh       # NEW
```

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm or yarn

### Environment Variables

Create `.env` in backend folder:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/familyhub
PORT=3001
NODE_ENV=development
```

### Available Commands

```bash
# Development
npm run dev              # Start frontend dev server
npm run backend:dev      # Start backend dev server

# Production
npm run build           # Build frontend
npm run preview         # Preview production build

# Testing (NEW)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests headed
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:report  # View test report

# Docker
docker-compose up -d         # Start all services
docker-compose down          # Stop all services
docker-compose logs -f       # View logs
docker-compose restart backend   # Restart backend

# Or use Makefile
make start              # Start all services
make stop               # Stop all services
make logs               # View logs
make rebuild            # Rebuild and restart
make clean              # Clean up containers and volumes
```

### Database

Access PostgreSQL directly:

```bash
docker-compose exec db psql -U postgres -d familyhub
```

---

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        // ...
      }
    }
  }
}
```

### Change App Name/Icon

1. Update `public/manifest.json`:
```json
{
  "name": "Your Family Hub",
  "short_name": "Your Hub"
}
```

2. Replace icons in `public/` folder
3. Run `./scripts/generate-icons.sh` to create PNGs

### Add Custom Features

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for integration instructions.

---

## 📊 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/favorites/all` - Get favorites
- `POST /api/meals` - Create meal
- `POST /api/meals/:id/add-to-shopping` - Add to shopping
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Shopping Items
- `GET /api/shopping-items` - Get all items
- `POST /api/shopping-items` - Create item
- `PUT /api/shopping-items/:id` - Update item
- `DELETE /api/shopping-items/:id` - Delete item

### Family Members
- `GET /api/family-members` - Get all members
- `POST /api/family-members` - Create member
- `PUT /api/family-members/:id` - Update member
- `DELETE /api/family-members/:id` - Delete member

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/stats/summary` - Get summary
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

**Full API documentation**: See backend route files in `backend/src/routes/`

---

## 🧪 Testing

### End-to-End Testing (NEW)
Comprehensive E2E testing with Playwright:

```bash
# Quick start
npm run test:e2e

# With UI mode (recommended)
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

**Test Coverage**:
- ✅ Authentication flows
- ✅ Tasks management
- ✅ Events & calendar
- ✅ Family tree
- ✅ Shopping lists
- ✅ Meal planning
- ✅ Money tracking
- ✅ Contacts
- ✅ Notifications
- ✅ Integration scenarios

**Documentation**:
- **[E2E_TEST_QUICKSTART.md](E2E_TEST_QUICKSTART.md)** - Get started in 5 minutes
- **[E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md)** - Comprehensive guide

### Manual Testing
See testing checklists in:
- [PHASE_2_3_SUMMARY.md](PHASE_2_3_SUMMARY.md) - Feature testing
- [PWA_GUIDE.md](PWA_GUIDE.md) - PWA testing

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Should score 100% on PWA

---

## 🚀 Deployment

### Recommended Platforms

**Vercel** (Easiest):
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Docker** (Self-hosted):
```bash
docker-compose up -d --build
```

### Requirements
- ✅ HTTPS (automatic on Vercel/Netlify)
- ✅ Node.js 18+
- ✅ PostgreSQL database
- ✅ Environment variables set

**Full deployment guide**: See [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## 📚 Documentation

- **[WHATS_NEW.md](WHATS_NEW.md)** - Latest features and changes
- **[E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md)** - E2E testing guide
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Integration guide
- **[PWA_GUIDE.md](PWA_GUIDE.md)** - PWA setup and testing
- **[FEATURES_IMPLEMENTED.md](FEATURES_IMPLEMENTED.md)** - Technical details
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker configuration

---

## 🐛 Troubleshooting

### Common Issues

**Docker containers won't start**:
```bash
make clean
make start
```

**Port already in use**:
- Frontend: Change in `vite.config.ts`
- Backend: Change in `backend/src/index.ts`
- Database: Change in `docker-compose.yml`

**PWA won't install**:
- Ensure HTTPS (or localhost)
- Check manifest and service worker
- See [PWA_GUIDE.md](PWA_GUIDE.md)

**Database connection issues**:
```bash
docker-compose restart db
docker-compose logs db
```

---

## 🎯 Roadmap

### In Progress
- [ ] Drag-and-drop meal planning
- [ ] Calendar view for meals
- [ ] Export/print meal plans

### Planned
- [ ] Push notifications (backend)
- [ ] Recipe photos
- [ ] Voice input for tasks/shopping
- [ ] Smart meal suggestions
- [ ] Nutritional tracking
- [ ] Recipe import from URLs
- [ ] Multi-language support

### Completed ✅
- [x] Comprehensive E2E testing with Playwright
- [x] Meal search and filtering
- [x] Task auto-generation
- [x] PWA setup
- [x] Meal-to-shopping integration
- [x] Favorites and templates

---

## 🤝 Contributing

Contributions welcome! Whether it's:
- 🐛 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- 🎨 Design enhancements
- 💻 Code contributions

Please open an issue or pull request.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with love for families who want to stay organized and connected.

**Tech Stack Credits**:
- React Team for React 19
- Vercel for Vite
- Tailwind Labs for Tailwind CSS
- Lucide for beautiful icons
- PostgreSQL community
- Docker team

---

## 📞 Support

Need help?
- 📖 Check documentation files
- 🐛 Open an issue
- 💬 Discussions welcome

---

## ⭐ Star Us!

If this helps your family stay organized, give us a star! ⭐

---

**Made with ❤️ for families everywhere**

*Version 2.0 - October 2025*
