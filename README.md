# Video Flow (Next.js + Cloudinary + Adsterra)

## Setup

1. Create a `.env` file at project root with:

```
CLOUDINARY_URL=cloudinary://767879943653787:okUt1vJMZP1X0aEl9cOYUKwXUGQ@dvdtbffva
```

2. Install and run:

```
npm install
npm run dev
```

## Deploy to Vercel

- Push to GitHub
- Create a new Vercel Project and import this repo
- Add the `CLOUDINARY_URL` env var in Vercel Project Settings

## Features

- Fetches random videos from Cloudinary on each request
- Autoplay fullscreen video player
- Adsterra fullscreen modal between videos
- Cycle: 1 Video → Ad → 2 Videos → Ad → 2 Videos → …
- TailwindCSS styling, responsive for desktop & mobile

## Notes

- If no videos are found in Cloudinary, the site shows “No videos available”.

