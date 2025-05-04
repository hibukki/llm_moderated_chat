# A chat moderated by an LLM

Made with one prompt to Gemini-2.5-pro-exp-03-25 in Cursor, as a challenge to get that done in one prompt (except I had an interactive vite menu open where I selected "react" and "typescript".. otherwise just one!)

## Screenshot

<img width="766" alt="image" src="https://github.com/user-attachments/assets/fe26b891-2da4-4ff4-bd40-e5493e69bef3" />

## Original prompt

```
We are going to build a website where 2 people can chat, and an LLM might add moderation messages to the chat (but more simply: the LLM has a custom promt, and every time a user posts a message, the website queries the LLM and asks the LLM if it wants to post a comment, and if so, what comment)

The folder is empty now

Start a new react vite typescript project in the current folder

The website can just have one page, with a collapsible settings section that will have the api key and the LLM prompt

The website will have a text box to reply as user1 and a text box to reply as user2, and a display for the chat messages

The LLM response can be json, and parsed with zod

Let's use gemini-2.0-flash by default

Give the LLM a default prompt, tell it what response format we want, and give it 2 example valid jsons (one with a response it wants to leave and one without).
All the fields in the llm response should be strings, not optional/boolean.

When you finish, add a react test that makes sure the page renders correctly

Try keeping the code simple and tidy, ideally it will work without needing to debug (it will be tested by a user only when everything is done)

To make sure things work, add a simple react test to make sure the component loads.

Also, please fix linter warnings. If something seems too complicated to fix, consider rewriting it another way. Again, we hope everything will work in the first try
```

It also got info from my Cursor Rules

# Original README by Gemini (replaced `\n`s with newlines)

# Moderated Chat App

This is a simple React application demonstrating a two-user chat where an LLM (Google Gemini) can inject messages based on the conversation context.

## Features

- Two-user chat interface.
- Collapsible settings panel for Google AI API Key and LLM Prompt customization.
- Integration with Google Gemini (defaults to `gemini-1.5-flash`).
- LLM responses parsed using Zod.
- Basic styling and layout.
- Built with Vite, React, TypeScript, Tanstack Query, Vitest, ESLint, and Husky.

## Setup and Running (macOS)

1. **Prerequisites:**
   _ [Node.js](https://nodejs.org/) (which includes npm) installed.
   _ A [Google AI API Key](https://aistudio.google.com/app/apikey).

2. **Clone the repository (if applicable):**
   `bash

   # Replace with your actual repo URL if needed

   # git clone https://github.com/hibukki/your-repo-name.git

   # cd your-repo-name

   `

3. **Install dependencies:**
   `bash
   npm install
   `

4. **Run the development server:**
   `bash
   npm run dev
   `
   The application will typically be available at `http://localhost:5173`.

5. **Configure the App:**
   _ Open the application in your browser.
   _ Click \"Show Settings\".
   _ Enter your Google AI API Key.
   _ (Optional) Modify the LLM prompt.

6. **Start chatting!** Use the input boxes for User 1 and User 2.

## Development

- **Linting:**
  `bash
   npm run lint
   `
- **Testing:**
  `bash
    # Run all tests
    npm test
    # Run tests in watch mode
    npm run test -- --watch 
    ` \* **Pre-commit Hook:** Linting and related tests are run automatically before each commit using Husky and lint-staged.
