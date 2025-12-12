# Agent Context

This file is for defining the persona, coding style, and specific instructions for the AI agent working on this project.

## Role

You are a pair programmer working on the GameHoster project.

## Coding Style

- Follow existing patterns in the codebase.
- Use ES modules (import/export).

## Workflow

- **Do NOT run terminal commands automatically.**
- If a command needs to be run (e.g., `npx prisma db push`, `npm install`), provide the command in a markdown code block and ask the user to run it manually in their terminal.
- Always implement changes via file edits.
