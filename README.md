# 🎮 Lolchi

<div align="center">

A modern League of Legends stats tracker built with Next.js 15

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

## ✨ Features

### 🎯 Player Statistics

- 📊 Detailed summoner profiles
- 📜 Match history with comprehensive game details
- 🏆 Champion statistics and performance metrics
- 📈 Win rates and ranking information

### 🔴 Live Game Tracking

- 🎥 Real-time game monitoring
- 👥 Current match participants and their ranks
- ⚔️ Champion selections and summoner spells
- 🔔 Live game notifications on leaderboards

### 🏅 Leaderboards

- 🥇 Challenger league rankings
- 🌍 Region-specific leaderboards
- 🟢 Live game indicators for top players
- 📊 Detailed player statistics

### 🎨 Modern UI/UX

- ✨ Clean and responsive design
- 🌙 Dark mode support
- 💡 Interactive components with tooltips
- 🎭 Smooth animations and transitions

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Yimikami/lolchi.git
cd lolchi
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BASE_URL=your_worker_url_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m '✨ Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request 🎉

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Known Issues

- 🔄 **Missing Data**: Occasionally, data might not load due to Riot API rate limits. With an API key that has higher rate limits, this issue is unlikely to occur.

## ☁️ Deployment on Cloudflare Workers

With the introduction of `worker.js`, you can now use Cloudflare Workers for your Riot API requests!

[Credits to BangingHeads](https://hextechdocs.dev/using-cloudflare-workers-to-make-api-calls/)

### 🔧 Steps to Deploy

1. **Set up a Cloudflare Workers account**
2. **Deploy the Worker**:
   - Use the Cloudflare dashboard or Wrangler CLI
   - Set up your environment variables

### 🔒 CORS Configuration

```javascript
// Development
const ALLOWED_ORIGINS = ["*"];

// Production
const ALLOWED_ORIGINS = ["https://yourdomain.com"];
```

### 🔑 Riot Games API Key

```javascript
// Your Riot Games API Key
const API_KEY = "YOUR API KEY";
```

## 📞 Contact

Have questions or suggestions? Feel free to:

- 🐛 Open an issue

- 📧 Email me at [hi@yimikami.me](mailto:hi@yimikami.me)

## ⚖️ Disclaimer

This project isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
