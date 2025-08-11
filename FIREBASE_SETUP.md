# Firebase Authentication Setup for Quizino

This guide will help you set up Firebase authentication for your Quizino multiplayer quiz game.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "quizino-game")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Google**: Click "Enable" and configure with your Google project details
   - **Email/Password**: Click "Enable" and turn on "Email/Password" authentication

## Step 3: Get Your Firebase Configuration

1. In the Firebase console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "Quizino Web App")
6. Copy the configuration object

## Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## Step 5: Configure Authentication Rules (Optional)

If you plan to use Firestore or Realtime Database later, you'll need to set up security rules. For now, the authentication setup is complete.

## Step 6: Test Your Setup

1. Run your development server: `npm run dev`
2. Open your app in the browser
3. Try signing in with Google or creating an account with email/password
4. Verify that the authentication flow works correctly

## Features Included

- ✅ Google Sign-in with popup
- ✅ Email/Password registration and login
- ✅ User profile display
- ✅ Logout functionality
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design with Tailwind CSS

## File Structure

```
quizino/
├── lib/
│   └── firebase.ts          # Firebase configuration
├── hooks/
│   └── useAuth.ts           # Custom authentication hook
├── contexts/
│   └── AuthContext.tsx      # Authentication context provider
├── components/
│   ├── LoginForm.tsx        # Login/signup form
│   └── UserProfile.tsx      # User profile component
└── app/
    ├── layout.tsx           # Root layout with AuthProvider
    └── page.tsx             # Main page with auth flow
```

## Next Steps

Now that authentication is set up, you can:

1. Add user data storage to Firestore
2. Create quiz game functionality
3. Implement real-time multiplayer features
4. Add user roles and permissions
5. Create game rooms and lobbies

## Troubleshooting

- **"Firebase App named '[DEFAULT]' already exists"**: This is normal and handled in the configuration
- **"auth/unauthorized-domain"**: Add your domain to authorized domains in Firebase console
- **"auth/popup-closed-by-user"**: User closed the popup, this is expected behavior
- **Environment variables not loading**: Make sure your `.env.local` file is in the project root and you've restarted the dev server

## Security Notes

- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser, which is necessary for Firebase client SDK
- For production, ensure your Firebase project has proper security rules configured 