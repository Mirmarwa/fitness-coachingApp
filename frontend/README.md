# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## FitCoach Chatbot IA

This project now includes a lightweight FitCoach AI chatbot using the Google Gemini API.

### Backend setup

- Add your Gemini API key to the environment before starting Django:

```bash
set GEMINI_API_KEY=your_gemini_api_key
# or on PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key"
```

- The chatbot endpoint is available at `/api/chatbot/`.
- The backend forwards user messages to Google Gemini and returns a short fitness-focused reply.

### Frontend setup

- No additional frontend configuration is needed.
- The chat widget fetches `/api/chatbot/` through `frontend/src/components/Chatbot.jsx`.
- If your backend runs on `http://127.0.0.1:8000`, the frontend is already configured to use that API base URL.
