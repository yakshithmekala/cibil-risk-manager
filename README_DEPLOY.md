# How to Deploy CIBIL Risk Manager

Your application is now fully configured for deployment on multiple platforms.

## **Option 1: Deploy to Render (Recommended for MERN)**
Render can detect either your `Dockerfile` or your `package.json`.

1.  **Direct GitHub Deployment:**
    *   Connect your GitHub repository to Render.
    *   Choose **"Web Service"**.
    *   **Settings:**
        *   Build Command: `npm run build`
        *   Start Command: `npm run production`
    *   **Environment Variables:**
        *   `MONGO_URI`: Your MongoDB Atlas connection string.
        *   `JWT_SECRET`: A long random string.
        *   `NODE_ENV`: `production`

2.  **Docker Deployment:**
    *   If you choose to use the `Dockerfile`, Render will automatically build the image for you and run the server on port 5000.

## **Option 2: Deploy to Vercel**
I've configured `vercel.json` so you can deploy the entire app to Vercel.

1.  Push your code to GitHub.
2.  Import the repository into **Vercel**.
3.  Vercel will detect the `vercel.json` and deploy your **Express server** as a serverless function and your **React app** as static files.
4.  Don't forget to add your `MONGO_URI` and `JWT_SECRET` in the "Environment Variables" section of your Vercel project settings.

## **Prerequisites (Crucial)**
Before deploying:
1.  **MongoDB Atlas:** You *must* have a MongoDB Atlas account.
2.  **IP Access:** Ensure your database (MongoDB Atlas) allows connections from `0.0.0.0/0` so the server can connect from the cloud.
3.  **Environment Variables:** Make sure you set `MONGO_URI` and `JWT_SECRET` in your dashboard.

---
Your app is already configured to automatically serve the frontend on the same port as the backend when in production mode.
