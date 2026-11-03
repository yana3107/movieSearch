# Movie App

A movie discovery application built with Next.js and TypeScript using the TMDB API.

## Features

- Browse movies.
- Search for movies.
- View movie information.
- Display movie posters and descriptions.

## Technologies

- Next.js
- TypeScript
- React
- TMDB API

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a TMDB API Read Access Token

1. Create an account at [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Open your account settings.
3. Go to API settings.
4. Request API access if necessary.
5. Copy your API Read Access Token.

### 4. Configure environment variables

Create a `.env.local` file in the root directory of the project.

Add your token:

```env
TMDB_READ_ACCESS_TOKEN=your_read_access_token
```

Replace `your_read_access_token` with your actual TMDB Read Access Token.

**Important:** Never commit your real API token to GitHub.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

To create a production build:

```bash
npm run build
```

## License

This project was created for educational purposes.
