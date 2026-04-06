# Contact Form Email Setup

This guide will help you configure the contact form to send emails to **skyvoyage09@gmail.com**.

## Prerequisites

- A Gmail account (or any email provider with SMTP support)
- Backend server running on port 4000
- Frontend server running on port 3000

## Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left navigation panel
3. Enable **2-Step Verification** if not already enabled
4. Go back to Security → **2-Step Verification** → Scroll down to **App passwords**
5. Click **App passwords**
6. Select app: **Mail**, Select device: **Other (Custom name)** → Enter "SkyVoyage Contact Form"
7. Click **Generate**
8. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

## Step 2: Configure Backend Environment Variables

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (if it doesn't exist):
   ```bash
   copy .env.example .env
   ```

3. Update the following variables in `.env`:
   ```env
   # Email Configuration
   EMAIL_SERVICE="gmail"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="abcdefghijklmnop"
   CONTACT_EMAIL="skyvoyage09@gmail.com"
   ```

   **Note:** Replace `your-email@gmail.com` with your actual Gmail address and `abcdefghijklmnop` with the generated app password (no spaces).

## Step 3: Start the Backend Server

```bash
cd backend
npm run start:dev
```

The server should start on `http://localhost:4000`

## Step 4: Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

## Step 5: Test the Contact Form

1. Navigate to `http://localhost:3000/contact`
2. Fill out the contact form:
   - Your Name
   - Your Email
   - Your Message
3. Click **Send Message**
4. You should see a success message
5. Check the inbox of `skyvoyage09@gmail.com` for the email

## Troubleshooting

### Error: "Failed to send email"

1. **Check your Gmail App Password:**
   - Make sure you're using an App Password, not your regular Gmail password
   - The password should be 16 characters (without spaces)

2. **Verify environment variables:**
   ```bash
   # Check if .env file exists
   ls backend/.env
   
   # Verify the variables are set correctly
   cat backend/.env
   ```

3. **Check backend logs:**
   - Look for error messages in the backend terminal
   - The service logs successful sends and failures

4. **Test the endpoint manually:**
   ```bash
   curl -X POST http://localhost:4000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "message": "This is a test message"
     }'
   ```

### Alternative Email Providers

If you're not using Gmail, you can use any SMTP provider:

```env
EMAIL_SERVICE="custom"
EMAIL_USER="your-email@provider.com"
EMAIL_PASSWORD="your-password"
CONTACT_EMAIL="skyvoyage09@gmail.com"
```

For custom SMTP servers, update the `contact.service.ts` file with your SMTP configuration.

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to version control
- Keep your app password secure
- The `.env` file is already in `.gitignore`
- Use environment-specific passwords in production

## How It Works

1. User fills out the contact form on the frontend
2. Frontend sends a POST request to `/api/contact`
3. Backend validates the form data (name, email, message)
4. Backend uses nodemailer to send an email to skyvoyage09@gmail.com
5. Email includes:
   - Sender's name and email
   - Message content
   - Timestamp
   - Beautiful HTML formatting
6. Backend returns success/error response
7. Frontend displays appropriate message to user

## Email Features

✅ Beautiful flight-themed HTML template
✅ Reply-to sender's email for easy responses
✅ Form validation (name ≥ 2 chars, valid email, message ≥ 10 chars)
✅ Error handling and logging
✅ Professional formatting with SkyVoyage branding
