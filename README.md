# Lolchi

Welcome to the Lolchi web application! This tool allows you to track your game statistics, analyze performance, and improve your gameplay.

## Features

- **Real-time Match Tracking**: Get live updates on your ongoing matches.
- **Detailed Statistics**: View comprehensive stats for each game, including kills, deaths, assists, and more.
- **Champion Statistics**: Analyze your performance on different champions.
- **Recently Played With**: See who you've recently played with.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yimikami/lolchi.git
   ```
2. Navigate to the project directory:
   ```bash
   cd lolchi
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

## Usage

1. Open your web browser and go to `http://localhost:3000`.
2. Enter your League of Legends summoner name to start tracking your stats.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-branch
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of your changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-branch
   ```
5. Create a pull request.

## Deployment on Cloudflare Workers

With the introduction of `worker.js`, you can now deploy Lolchi on Cloudflare Workers without the need for a traditional server setup.

[Credits to BangingHeads](https://hextechdocs.dev/using-cloudflare-workers-to-make-api-calls/)

If you prefer not to use the Cloudflare Worker script, you can find the old `server.js` and `riot.ts` files in the `OLD_FILES` directory.

### Steps to Deploy

1. **Set up a Cloudflare Workers account**: If you don't have one, sign up at [Cloudflare](https://www.cloudflare.com/).
2. **Deploy the Worker**:
   - Use the Cloudflare dashboard or Wrangler CLI to deploy your `worker.js` file.
   - Ensure your environment variables are set up correctly in the Cloudflare dashboard.

For more detailed instructions, refer to the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).

### CORS Configuration

For development purposes, you can set `const ALLOWED_ORIGINS = ["*"];` in `worker.js` to allow all origins. However, for production deployment, it's recommended to specify your own domain to enhance security.

```javascript
// Example for development
const ALLOWED_ORIGINS = ["*"];

// Example for production
const ALLOWED_ORIGINS = ["https://yourdomain.com"];
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact me at hi@yimikami.me

Enjoy tracking and improving your League of Legends gameplay!

## Disclaimer

This project isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
