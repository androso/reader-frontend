# Rest Express
A RESTful API built with Express and Vite, utilizing TypeScript for type safety and improved development experience.
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Production](#production)
- [License](#license)
## Installation
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd rest-express
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
Usage
Running the Development Server
To start the development server, use the following command:
```
npm run dev
```
The server will be accessible at `http://0.0.0.0:3000`.

Building for Production
To build the project for production, run:
```
npm run build
```
Starting the Production Server
After building, you can start the production server with:
```
npm run start
```
The production server will be accessible at `http://0.0.0.0:5000`

Development
The project uses Vite for front-end development, enhancing rapid development via hot-module replacement.
The server is built with Express and uses TypeScript to provide types across the application.

Production
Make sure to build the project before starting the production server. The build process will bundle your application and prepare it for deployment.