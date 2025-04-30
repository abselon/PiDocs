# PiDocs - Personal Document Management App

PiDocs is a React Native application that helps users securely store, organize, and manage their personal documents with customizable categories and metadata.

## Features

- 🔐 Secure document storage with Firebase
- 📁 Customizable document categories
- 📝 Metadata templates for different document types
- 🔔 Document expiration reminders
- 🌙 Dark/Light mode support
- 📱 Cross-platform (iOS & Android)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (`npm install -g eas-cli`)
- Firebase account
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pidocs.git
cd pidocs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore and Storage
   - Create a new web app in Firebase console
   - Copy the Firebase configuration to `config/firebase.ts`

4. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

## Development

1. Start the development server:
```bash
npx expo start
```

2. Run on Android:
```bash
npx expo start --android
```

3. Run on iOS (macOS only):
```bash
npx expo start --ios
```

## Building APK with EAS

1. Install EAS CLI if not already installed:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Configure the build:
```bash
eas build:configure
```

4. Build the APK:
```bash
eas build --platform android --profile preview
```

5. Download the APK:
- After the build completes, you'll receive a link to download the APK
- Scan the QR code with your Android device or use the provided URL

## Docker Development

### Prerequisites
- Docker
- Docker Compose
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Build the Docker image:
```bash
docker build -t pidocs .
```

2. Run the container:
```bash
docker run -p 19000:19000 -p 19001:19001 -p 19002:19002 pidocs
```

3. Development with Docker:
```bash
# Development mode
docker-compose up dev

# Production mode
docker-compose up prod
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "19000:19000"
      - "19001:19001"
      - "19002:19002"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

  prod:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "19000:19000"
    environment:
      - NODE_ENV=production
```

### Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 19000 19001 19002

CMD ["npm", "start"]
```

### Dockerfile.prod
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 19000

CMD ["npm", "start"]
```

### Development Workflow

1. Start the development environment:
```bash
docker-compose up dev
```

2. Access the Expo development server:
- Open your browser at `http://localhost:19000`
- Use Expo Go app on your mobile device

3. Hot reloading is enabled by default

4. To stop the development environment:
```bash
docker-compose down
```

### Production Deployment

1. Build the production image:
```bash
docker-compose build prod
```

2. Run the production container:
```bash
docker-compose up prod
```

## Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Set up Firestore Database with the following security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

4. Set up Firebase Storage with appropriate security rules
5. Add your Firebase configuration to `config/firebase.ts`

## Security Notes

- Firebase configuration files (`firebase.ts`, `google-services.json`, etc.) are excluded from version control
- Keep your Firebase configuration secure and never commit it to the repository
- Use environment variables for sensitive information

## Project Structure

```
pidocs/
├── assets/           # Static assets
├── components/       # Reusable components
├── config/          # Configuration files
├── contexts/        # React Context providers
├── screens/         # Screen components
│   ├── auth/        # Authentication screens
│   └── main/        # Main app screens
├── services/        # Service layer
├── theme/           # Theme configuration
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@pidocs.com or open an issue in the GitHub repository. 