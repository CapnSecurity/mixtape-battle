# Render Deployment Guide (Mixtape Battle)

This guide walks you through setting up a Render Postgres database and a Render Web Service for the Mixtape Battle app, plus DNS cutover. It is written for cost-conscious setup.

## 1) Create the Render Postgres database

1. Render Dashboard -> New -> Postgres.
2. Choose the cheapest viable settings:
   - Name: `mixtape-battle-db` (or any name)
   - Database: `mixtape_battle`
   - User: `mixtape`
   - Region: same region you will use for the Web Service
   - PostgreSQL version: default (18 is fine)
   - Plan: **Free** (lowest cost, has cold starts) or **Basic-256mb** (cheapest paid)
   - Storage: minimum allowed
   - Autoscaling: Disabled
   - High Availability: Disabled
3. After it finishes provisioning, open the database page and copy the **Internal Database URL**.

Keep the Internal URL private; you will paste it into the Web Service environment variables.

## 2) Create the Render Web Service

1. Render Dashboard -> New -> Web Service.
2. Select your Git repo for this app.
3. Configuration:
   - Name: `mixtape-battle`
   - Region: same as the Postgres region
   - Branch: `main` or whichever branch you want to deploy
   - Build Command:
     ```bash
     npm ci && npx prisma generate && npm run build
     ```
   - Start Command:
     ```bash
     npx prisma migrate deploy && npm run start
     ```
   - Node Version: 20 (or leave default if it is 20+)

## 3) Web Service environment variables

In Render -> Web Service -> Environment, add these variables. Use real values in Render (do not store them in git).


Required:
- `DATABASE_URL` = Internal Database URL from Render Postgres
- `NEXTAUTH_URL` = Your app's public URL. Use the Render-provided URL (e.g., `https://<your-service>.onrender.com`) at first. Once you add your custom domain (see below), update this to your custom domain (e.g., `https://mixtape.levesques.net`).
- `NEXTAUTH_SECRET` = your existing secret
- `NODE_ENV` = `production`
- `EMAIL_SERVER_HOST` = `smtp.zoho.com`
- `EMAIL_SERVER_PORT` = `587`
- `EMAIL_SERVER_USER` = your Zoho user (e.g. `tim@levesques.net`)
- `EMAIL_SERVER_PASSWORD` = Zoho app password
- `EMAIL_FROM` = from-address (same as email user)

Optional:
- Any other env vars you use locally that you want in production.

## 4) Database migrations and seed

- The Start Command runs `npx prisma migrate deploy` automatically to apply migrations.
- If you need initial data, you can run a one-off deploy job:
  - Render -> Web Service -> Shell (or Jobs) -> run:
    ```bash
    npx prisma db seed
    ```

## 5) Verify the deployment

1. Open the Render service URL (shown on the Web Service page).
2. Log in and open the battle page.
3. Confirm these endpoints return valid responses:
   - `/api/health` (may redirect to login if not authenticated)
   - `/api/battle/next`
   - `/api/battle/submit`


## 6) Using a Custom Domain with Render

You can use your own domain (e.g., `mixtape.levesques.net`) instead of the default `onrender.com` subdomain. Here’s how:

1. In Render, go to your Web Service → Settings → Custom Domains.
2. Add your custom domain (e.g., `mixtape.levesques.net`).
3. Render will show you the DNS records to add (usually a CNAME or A/ALIAS record).
4. In your DNS provider’s dashboard, add or update the DNS record(s) as Render instructs.
5. Wait for DNS to propagate (typically 5–30 minutes, sometimes longer).
6. Once your custom domain resolves to Render, Render will automatically issue and install an SSL certificate (HTTPS will work).
7. Update your environment variables in Render:
   - Set `NEXTAUTH_URL` to your custom domain, e.g., `https://mixtape.levesques.net`
   - Redeploy or restart your service if needed for the new env var to take effect.

**Note:** You can test your app on the Render-provided URL first, then switch to your custom domain at any time. Always ensure `NEXTAUTH_URL` matches the domain users will access.

## 7) Rollback plan (if needed)

- If the new Render deployment fails, point DNS back to the old host.
- In Render, you can also rollback to a previous deploy from the service page.

## 8) Cost notes

- Free Postgres is cheapest but can sleep (cold start delays).
- Basic-256mb is the lowest paid option for better reliability.
- Keep logs and autoscaling disabled to reduce cost.

---

If you want a PDF, open this file and export it as PDF from your editor or browser.
