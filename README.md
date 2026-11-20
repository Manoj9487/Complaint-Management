# Complaint Desk

A complaint management system built with React, Vite and a json-server mock API.
People file complaints, admins assign them to staff, and everyone can follow the
status and comment history until the complaint is resolved.

## Roles

| Role | Can do |
| --- | --- |
| User | File complaints, track their own, comment, withdraw while still "Submitted" |
| Staff | See complaints assigned to them, update status, comment |
| Admin | See everything, assign to staff, change status and priority, delete |

## Run locally

```bash
npm install
npm start        # runs the API on :3001 and the app on :5173
```

Or run them separately with `npm run api` and `npm run dev`.

Demo accounts (also available as buttons on the sign-in page):

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@desk.test | admin123 |
| Staff | ravi@desk.test | staff123 |
| User | karan@desk.test | user123 |

## Scripts

- `npm run dev` starts Vite
- `npm run api` starts json-server on port 3001 using `db.json`
- `npm run build` creates the production build in `dist`
- `npm run lint` runs Oxlint

## Deploying

Vercel hosts the frontend only. json-server needs a long-running Node process, so host
`db.json` + `npm run api` on a service such as Render or Railway, then set
`VITE_API_URL` in your Vercel project to that API's URL. `vercel.json` already rewrites
all routes to `index.html` so refreshing a page like `/complaints/3` works.

## Known limits (it's a demo backend)

- Passwords are stored in plain text in `db.json` and access rules are enforced in the UI only.
  Anyone who can reach the API can read or change any record.
- Free hosts reset file-based data on redeploy or restart.
- To make it real, replace `src/api.js` with calls to a proper backend (for example Spring Boot or
  Express with a database) that hashes passwords, issues tokens and checks roles on the server.

## Structure

```
src/
  api.js            all HTTP calls in one place
  auth.jsx          sign-in state, saved in localStorage
  constants.js      statuses, categories, role-based data scoping
  components/       layout, status badge, progress pipeline, complaint row
  pages/            Login, Dashboard, Complaints, NewComplaint, ComplaintDetail
db.json             users, complaints, comments
```
