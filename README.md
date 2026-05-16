# Discernment Center Assessment App

This Netlify app runs the candidate assessment, generates a scored report, emails the report through Resend, and stores submitted reports in Netlify Blobs for an admin dashboard.

## Required Netlify Environment Variables

Add these in Netlify under Site configuration → Environment variables:

- `RESEND_API_KEY` - your Resend API key
- `FROM_EMAIL` - example: `Discernment Center <assessment@discern.openbibleeast.org>`
- `ADMIN_EMAIL` - receives every report
- `DEFAULT_LEADER_EMAIL` - fallback leader email when a state is not mapped
- `STATE_LEADER_EMAILS_JSON` - one-line JSON object mapping state abbreviations to leader emails
- `ADMIN_PASSWORD` - password used to access `/admin.html`

After adding or editing environment variables, redeploy the site.

## Admin Dashboard

Open:

`/admin.html`

Enter the `ADMIN_PASSWORD` value. The dashboard lets you:

- view all stored submissions
- search by name/email/state
- filter by state
- sort by date/name/score
- open a full report
- print or save a report as PDF

Only submissions made after this version is deployed will appear in the dashboard.

## Storage

Submissions are stored in Netlify Blobs in a store named:

`discernment-assessments`

The report is stored when the user clicks **Email and Store Report**.


## Netlify Blobs setup

For Netlify Drop deployments, Netlify Blobs may require two additional environment variables so the serverless functions know which site/store to use:

```text
NETLIFY_SITE_ID=your Netlify site ID
NETLIFY_AUTH_TOKEN=your Netlify personal access token
```

Find the Site ID in Netlify under Site configuration > General > Site details. Create the auth token under User settings > Applications > Personal access tokens. Keep the token secret. After adding these variables, redeploy the site.


## v11 update
Clicking Generate Results now generates the report and immediately emails/stores it. There is no separate email button.
