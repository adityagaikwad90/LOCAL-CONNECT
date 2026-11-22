# LocalConnect

LocalConnect helps travelers meet local guides and plan personal city experiences. The frontend is a React app built with Vite, Tailwind CSS, React Router, Firebase Authentication, and Firestore.

## Product flow

1. Choose a destination and discover local guides.
2. Open a guide profile and send a request with a date, start time, group size, interests, and an optional note.
3. The guide reviews incoming requests in **My space** and accepts or declines.
4. Accepting a request creates a conversation and notifies the traveler so both people can work out the details.

## Project layout

```text
src/
  components/
    ai/                 AI travel assistant
    chat/               Video call experience
    common/             App navigation, footer, shared UI
    connections/        Request form and traveler/guide request inbox
    dashboard/          Dashboard supporting components
  context/              Firebase authentication state
  data/                 City and demo content
  firebase/             Firebase client configuration
  pages/                Route-level screens
  services/             Firestore feature operations
```

The connection request data layer is in `src/services/connectionRequests.js`; its UI lives in `src/components/connections/`. Pages compose feature components, while `src/index.css` defines shared design tokens and controls.

## Local development

Install dependencies and start Vite:

```sh
npm install
npm run dev
```

Build the static frontend with:

```sh
npm run build
```

Firebase client settings are read from Vite environment variables in `src/firebase/config.js`. The AI assistant and video calling also expect the companion server in `server/`; configure its environment separately. Do not commit environment files or API keys.

## Firestore collections

- `users/{uid}` stores the account profile, role (`explorer` or `local`), interests, and city.
- `connectionRequests/{requestId}` stores traveler and guide IDs, the proposed plan, status, and timestamps.
- `chats/{chatId}` stores the participant IDs and latest message metadata; message history is in `chats/{chatId}/messages`.
- `notifications/{notificationId}` stores per-user alerts and navigation links.

Connection request writes, guide decisions, chat creation, and notifications use Firestore batches. Deploy Firestore security rules that allow signed-in travelers to create requests for other users, allow the addressed guide to change request status, and limit each user to their own notifications and chat membership.
