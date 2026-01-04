This is a [Next.js](https://nextjs.org) project.
TECH-STACK: react nextjs, no tailwind, Matrial/MUI and typescript

The .tsx files are TypeScript files for React components—the .ts stands for TypeScript, and the x indicates that the file contains JSX, the syntax React uses for its UI.


## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The lander page is `app/page.tsx` in the app/ folder. The other pages are in their respective folders in the app/ folder.

Pages auto-update as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Folder structure:
```bash
app/
├── favicon.ico
├── favicon_lumee.ico
├── favicon_too_dark.ico
├── globals.css
├── layout.tsx
├── page.module.css
├── page.tsx
├── symptoms/
│   └── page.tsx
├── tabMain/
│   └── page.tsx
└── welcome/
    └── page.tsx

assets/
├── CompanionIcon.png
└── CompanionIcon_azul.png

components/
├── AddSymptomDialog.tsx
├── ChatBubble.tsx
├── CustomTextField.tsx
├── HomeGreeting.tsx
├── InfoTabNoInfo.tsx
├── LoadingDots.tsx
├── MedicalHistoryCard.tsx
├── MessageList.tsx
└── SymptomCard.tsx

services/
└── serverRequests.tsx

styles/
└── colors.tsx

types/
├── ApiModels.ts
└── PatientMedicalData.ts
```





## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

