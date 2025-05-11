
# Welcome to Micio Social 🐈❤️

Micio Social is a mobile application dedicated to connecting cat lovers around the world. Share your cat moments, interact with fellow feline enthusiasts, and build a community for everything cat-related.

<img src="https://github.com/mattiacaprioli/micio-social/blob/main/assets/images/micioSocial.png" alt="Micio Social Banner" width="600" />

---

## Features

### Available Now
- **Cat Profiles**
  Create personalized profiles for your cats, complete with photos and fun facts.

- **Interactive Feed**
  Share adorable cat moments and interact with the community through likes and comments.

### Coming Soon
- **Real-Time Chat**
  Connect with other cat lovers instantly to exchange tips and build friendships.

- **Customizable Themes**
  Personalize the app with themes, including a cozy "Cat Nap" dark mode.

- **Community Events**
  Join virtual and local events to celebrate feline fun and connect with other enthusiasts.


---

## Installation

### Requirements

- **Node.js**: 20.x recommended (18.x minimum)
- **npm**: 10.x or later
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)
- **Expo Go**: Not compatible with this project (uses Expo SDK 53 with development builds)

1. Clone the repository:
   ```bash
   git clone https://github.com/mattiacaprioli/micio-social
   ```

2. Navigate to the project directory:
   ```bash
   cd micio-social
   ```

3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Start the app in development mode:
   ```bash
   npx expo start
   ```

5. Run on Android device/emulator:
   ```bash
   npx expo run:android
   ```

6. Run on iOS device/simulator (requires macOS):
   ```bash
   npx expo run:ios
   ```

---

## Development

This project is built with [Expo](https://expo.dev) SDK 53, using [React Native](https://reactnative.dev) 0.79 and [Supabase](https://supabase.io) as the backend. The app features:

- **File-based routing** powered by Expo Router 5.
- **Authentication** and real-time database operations via Supabase.
- **Cross-platform compatibility** for Android, iOS, and Web.
- **New Architecture** enabled by default for better performance.
- **React 19** for improved rendering and hooks.

### Technical Specifications

- **Expo SDK**: 53.0.0
- **React**: 19.0.0
- **React Native**: 0.79.2
- **Node.js**: 20.x recommended (18.x minimum)
- **TypeScript**: 5.8.3

### Troubleshooting

If you encounter issues with Node.js standard library modules (like "stream" or "events"), the project includes a custom Metro configuration to resolve these compatibility issues. The configuration is in `metro.config.js` and disables the package exports feature that can cause problems with certain libraries.

### Reset the Project

To reset and start fresh:
```bash
npm run reset-project
```
This will move the starter code to the `app-example` directory and create a blank `app` directory for development.

---

## Project Structure

```plaintext
micio-social/
|-- app/                # Main app directory with file-based routing
|-- assets/             # Static assets (images, fonts, etc.)
|-- components/         # Reusable components
|-- config/             # Configuration files (e.g., Supabase setup)
|-- constants/          # Project constants and configurations
|-- context/            # Context for global state management
|-- services/           # API and service integrations
|-- package.json        # Project dependencies and scripts
```

---

## Roadmap

- [ ] **Push Notifications**: Add notifications to keep users engaged with real-time updates.
- [ ] **Advanced Search**: Implement filters such as breed, location, and other customizable criteria.
- [ ] **Beta Testing**: Launch a beta version to gather feedback from users and refine the app.
- [ ] **Styling Improvements**: Enhance the app's design for a more modern and visually appealing experience.
- [ ] **E-Commerce Integration**: Add an in-app store for purchasing cat-related products (e.g., toys, food, accessories).
- [ ] **Dark Mode**: Implement a dark mode for better usability during nighttime.
- [ ] **User Analytics**: Integrate analytics to track user behavior and improve features based on insights.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Learn More

- [React Native Documentation](https://reactnative.dev/): Build native apps using JavaScript.
- [Expo Documentation](https://docs.expo.dev/): Tools and libraries for universal app development.
- [Expo SDK 53 Changelog](https://expo.dev/changelog/sdk-53): Learn about the latest features in Expo SDK 53.
- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19): Explore the new features in React 19.
- [New Architecture Guide](https://docs.expo.dev/guides/new-architecture/): Learn about React Native's New Architecture.
- [Supabase Documentation](https://supabase.io/docs): Backend as a service with real-time capabilities.

---

## Join the Community

- **GitHub**: [Micio Social Repository](https://github.com/your-username/micio-social)
- **Discord**: Join discussions and share ideas with fellow developers.

---

Happy coding, and may your days be filled with purrs and cuddles! 😺
