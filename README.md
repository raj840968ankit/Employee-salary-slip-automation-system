# Employee Salary Slip Automation System

A simple MERN full-stack project for uploading employee master data and monthly salary data, calculating net salary, generating salary slip PDFs, emailing salary slips, and storing records in MongoDB.

This project is intentionally beginner-friendly and assignment-focused. It does not include authentication, JWT, Redux, Docker, microservices, or complex payroll rules.

## Live Deployment

- Frontend: https://employee-salary-slip-automation-sys.vercel.app
- Backend API: https://employee-salary-slip-automation-system.onrender.com

## Features

- Upload employee master data from CSV, XLSX, or XLS files
- Upload monthly salary data from CSV, XLSX, or XLS files
- Preview employee records before saving them
- Preview salary records before saving them
- Validate required columns
- Reject duplicate employee IDs during employee upload
- Reject salary rows with invalid employee IDs
- Calculate net salary using `baseSalary + hra + allowances - deductions`
- Store employees and salary records in MongoDB
- Generate salary slip PDFs with PDFKit
- Send salary slips by email with Nodemailer and a professional HTML template
- Dashboard with total employees, salary records, and sent emails
- Bulk PDF generation and bulk email sending
- Responsive admin UI with Bootstrap and Lucide icons

## Tech Stack

Frontend: React, Vite, Axios, React Router, Bootstrap

Backend: Node.js, Express.js, MongoDB Atlas, Mongoose

Utilities: Multer, XLSX, PDFKit, Nodemailer

Deployment: Vercel for frontend, Render for backend, MongoDB Atlas for database

## Folder Structure

```text
backend/
  config/
  controllers/
  generated-pdfs/
  models/
  routes/
  services/
  uploads/
  utils/
  app.js
  server.js
  .env.example

frontend/
  src/
    components/
    pages/
    services/
    App.jsx
    main.jsx
  index.html
  vite.config.js
  .env.example

samples/
  employees.csv
  salaries.csv
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Fill `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_PROVIDER=smtp
RESEND_API_KEY=
RESEND_FROM_EMAIL=HR Team <onboarding@resend.dev>
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Fill `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Open the frontend at `http://localhost:5173`.

For Vercel deployment, `VITE_API_URL` must be your Render backend URL, for example:

```env
VITE_API_URL=https://employee-salary-slip-backend.onrender.com
```

## Sample Files

Use these files for quick testing:

- `samples/employees.csv`
- `samples/salaries.csv`

Upload employees first, then upload salaries.

## API Endpoints

### Employee APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/employees/upload` | Upload employee CSV/XLSX file and return preview |
| POST | `/api/employees/save-preview` | Save previewed employee records |
| GET | `/api/employees` | Get all employees |

### Salary APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/salary/upload` | Upload salary CSV/XLSX file and return preview |
| POST | `/api/salary/save-preview` | Save previewed salary records |
| GET | `/api/salary` | Get salary records with employee details |
| POST | `/api/salary/generate-pdf/:id` | Generate PDF for one salary record |
| POST | `/api/salary/send-email/:id` | Email one salary slip |
| POST | `/api/salary/generate-all` | Generate PDFs for all salary records |
| POST | `/api/salary/send-all` | Email all salary slips |

## Postman Testing Steps

### Phase 1: Employee Upload

Files created:

- `backend/models/Employee.js`
- `backend/controllers/employeeController.js`
- `backend/routes/employeeRoutes.js`
- `backend/utils/upload.js`
- `backend/utils/fileParser.js`

Steps:

1. Start backend with `npm run dev`.
2. Create a `POST` request to `http://localhost:5000/api/employees/upload`.
3. Select `Body > form-data`.
4. Add key `file`, change type to `File`, and choose `samples/employees.csv`.
5. Send request.
6. Confirm response contains `preview`, `previewCount`, and `rejectedCount`.
7. Create a `POST` request to `http://localhost:5000/api/employees/save-preview`.
8. Select `Body > raw > JSON`.
9. Send the valid preview records like this:

```json
{
  "records": [
    {
      "employeeId": "EMP001",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "designation": "Software Engineer"
    }
  ]
}
```

10. Send `GET http://localhost:5000/api/employees` to verify saved employees.

### Phase 2: Salary Upload

Files created:

- `backend/models/Salary.js`
- `backend/controllers/salaryController.js`
- `backend/routes/salaryRoutes.js`

Steps:

1. Upload employees first.
2. Create a `POST` request to `http://localhost:5000/api/salary/upload`.
3. Select `Body > form-data`.
4. Add key `file`, change type to `File`, and choose `samples/salaries.csv`.
5. Send request.
6. Confirm response contains a `preview` array and calculated `netSalary`.
7. Create a `POST` request to `http://localhost:5000/api/salary/save-preview`.
8. Select `Body > raw > JSON`.
9. Send the valid preview records like this:

```json
{
  "records": [
    {
      "employeeId": "EMP001",
      "baseSalary": 45000,
      "hra": 12000,
      "allowances": 5000,
      "deductions": 2500,
      "month": "January",
      "year": 2026
    }
  ]
}
```

10. Send `GET http://localhost:5000/api/salary` to verify salary records.

### Phase 3: PDF Generation

Files created:

- `backend/utils/pdfGenerator.js`
- `backend/services/salaryService.js`
- `backend/generated-pdfs/.gitkeep`

Steps:

1. Copy a salary record `_id` from `GET /api/salary`.
2. Send `POST http://localhost:5000/api/salary/generate-pdf/{id}`.
3. Confirm `pdfPath` is returned.
4. Open `http://localhost:5000/generated-pdfs/{file-name}.pdf` in the browser.

### Phase 4: Email Sending

Files created:

- `backend/utils/emailSender.js`

Steps:

1. Add valid Gmail app credentials in `backend/.env`.
2. Generate PDF for a salary record or let the email API generate it automatically.
3. Send `POST http://localhost:5000/api/salary/send-email/{id}`.
4. Confirm `emailStatus` changes to `Sent`.

### Phase 5: Bulk Actions

Steps:

1. Send `POST http://localhost:5000/api/salary/generate-all`.
2. Confirm result statuses are returned.
3. Send `POST http://localhost:5000/api/salary/send-all`.
4. Confirm each result shows `Sent` or `Failed`.

## Deployment Steps

Before pushing to GitHub, confirm that real environment files are not committed. This project includes `.gitignore` entries for:

- `backend/.env`
- `frontend/.env`
- `node_modules/`
- `frontend/dist/`
- generated PDFs
- temporary uploads

Only commit `.env.example` files, never real `.env` files.

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP address or allow access from Render.
4. Copy the connection string.
5. Use it as `MONGODB_URI`.

### Backend on Render

1. Push this project to GitHub.
2. Create a new Render Web Service.
3. Set root directory to `backend`.
4. Set build command:

```bash
npm install
```

5. Set start command:

```bash
npm start
```

6. Add environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=HR Team <onboarding@resend.dev>
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
```

7. Deploy and copy the Render backend URL.

If you use both Vercel production and preview URLs, separate allowed frontend URLs with commas:

```env
CLIENT_URL=https://your-project.vercel.app,https://your-custom-domain.com
```

### Frontend on Vercel

1. Create a new Vercel project from the same GitHub repository.
2. Set root directory to `frontend`.
3. Set build command:

```bash
npm run build
```

4. Set output directory:

```bash
dist
```

5. Add environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

6. Deploy.
7. Update backend `CLIENT_URL` in Render to the final Vercel URL.

Important: Vite reads `VITE_API_URL` during build time. If you add or change it in Vercel after deployment, redeploy the frontend.

## Common Deployment Issue

If upload works locally but fails on Vercel:

1. Open your deployed frontend in the browser.
2. Press `F12` and go to the Network tab.
3. Try uploading the CSV again.
4. Check the request URL.

If it says `http://localhost:5000`, Vercel does not have the correct `VITE_API_URL`, or the frontend was not redeployed after setting it.

If it says your Render URL but fails with CORS, update Render's `CLIENT_URL` to exactly match your Vercel URL, including `https://`, then redeploy the backend.

## Screenshots

Add screenshots here after running the project:

- Dashboard screenshot
- Employee upload screenshot
- Salary upload preview screenshot
- Salary records screenshot
- Bulk actions screenshot

## Notes

- Gmail requires an app password for SMTP if two-factor authentication is enabled.
- On Render, add `EMAIL_USER` and `EMAIL_PASS` in the service Environment tab. `EMAIL_PASS` should be a Gmail app password, not your normal Gmail password.
- For Gmail SMTP on Render, use `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, and `EMAIL_SECURE=false`.
- Render free web services block outbound SMTP ports, so production email should use `EMAIL_PROVIDER=resend` with `RESEND_API_KEY`.
- Backend request logs use Morgan and appear in the Render Logs tab.
- Generated PDFs are saved inside `backend/generated-pdfs`.
- Uploaded files are temporarily stored in `backend/uploads` and deleted after parsing.
- Render free instances may sleep after inactivity, so the first request can be slow.

