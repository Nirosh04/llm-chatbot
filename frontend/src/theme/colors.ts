'use client';

export const lightPalette = {
  background: '#f5faff',       // near-white with azure hint // app-wide background that keeps the UI airy and low-contrast
  paper: '#e8f2ff', //'#f0f7ff', //'#dcebff', //'#ffffff',             // card / sheet background // surfaces like cards, panels, and sheets that float above the background
  primary: {
    main: '#64a0ff', //'#f5faff',            // light azure accent // primary theme tone used for subtle highlights and framework accents
    contrastText: '#192846',    // text on primary backgrounds that must stay crisp and readable
  },
  secondary: {
    main: '#4a8df0',            // slightly darker accent '#64a0ff' // emphasis color for links, highlights, and secondary actions
  },
  text: {
    primary: '#192846',         // deep navy text // main body text color optimized for readability on light backgrounds
    secondary: '#64a0ff',       // this bright azure accent // secondary text, metadata, and interactive hints
  },
  icon: {
    main: '#64a0ff',        // ← explicit icon color // default icon tint that aligns with interactive accents
  },
  button: {
    bg: '#dcebff',          // '#64a0ff',          // button background that signals interactivity // should be similar to paper but have stronger blue accent
    hover: '#4a8df0',       // hover state that adds depth and feedback
    text: '#213547',        // button label color that balances contrast and softness
  },
  chat: {
    me: '#b4d7ff',          // soft azure bubble // user message background in chat contexts
    llm: '#e6f0ff',         // pale blue-white bubble // assistant message background in chat contexts
    textMe: '#192846',      // text color inside user bubbles for clarity
    textLlm: '#192846',     // text color inside assistant bubbles for consistency
  },
};

export const darkPalette = {
  background: '#0a0a0a',
  paper: '#1a1a1a',
  primary: {
    main: '#646cff',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4a8df0',
  },
  text: {
    primary: '#ededed',
    secondary: '#64a0ff',
  },
  button: {
    bg: '#1a1a1a',
    hover: '#4a4a4a',
    text: '#f5f5f5',
  },
  chat: {
    me: '#1f3f6e',     // deeper azure
    llm: '#1a2433',    // dark neutral
    textMe: '#ededed',
    textLlm: '#ededed',
  },
};
