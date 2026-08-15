import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client for Admin Auth
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// In-memory OTP Store (key: email, value: { otp, expiresAt })
const otpStore = new Map();

// In-memory Admin Password Reset Token Store (key: token, value: { email, expiresAt })
const adminResetStore = new Map();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify SMTP Connection on server start
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server Ready to Send Emails');
  }
});

// ----------------------------------------------------
// USER OTP AUTHENTICATION ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    otpStore.set(cleanEmail, { otp, expiresAt });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"CASIT" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: 'CASIT - Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">CASIT</h1>
            <p style="color: #6B7280; font-size: 13px; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Elevate Your Walls</p>
          </div>
          
          <div style="padding: 24px; background-color: #FFFDF0; border-radius: 12px; text-align: center; border: 2px solid #FFE600; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #374151; font-weight: 600; margin: 0 0 12px 0;">Your 6-Digit Verification Code is:</p>
            <h2 style="font-size: 40px; letter-spacing: 8px; color: #000; margin: 0; font-weight: 800; font-family: monospace;">${otp}</h2>
            <p style="font-size: 12px; color: #6B7280; margin-top: 12px; font-weight: 500;">Valid for 5 minutes only.</p>
          </div>

          <p style="font-size: 13px; color: #4B5563; line-height: 1.5; text-align: center;">Enter this code in the CASIT login window to complete your sign in.</p>
          <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 0;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP Auth] Sent OTP ${otp} to ${cleanEmail}`);
    return res.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (err) {
    console.error('[SMTP Auth Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP: ' + err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedData = otpStore.get(cleanEmail);

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'No verification code found. Please request a new OTP.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new one.' });
    }

    if (storedData.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email and try again.' });
    }

    otpStore.delete(cleanEmail);

    const user = {
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      loggedInAt: new Date().toISOString()
    };

    return res.json({ success: true, message: 'Logged in successfully!', user });
  } catch (err) {
    console.error('[Verify OTP Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION & PASSWORD RESET ENDPOINTS
// ----------------------------------------------------

// Admin Login verification against Supabase DB table `admin_users`
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Supabase admin_users table if initialized
    if (supabase) {
      const { data: dbAdmin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && dbAdmin) {
        if (dbAdmin.password === password.trim()) {
          console.log(`[Admin Login] Success for ${cleanEmail} via Supabase DB`);
          return res.json({ success: true, message: 'Admin login successful.' });
        } else {
          console.log(`[Admin Login] Invalid password attempt for ${cleanEmail}`);
          return res.status(401).json({ success: false, message: 'Invalid password. If you forgot your password, click Forgot Password.' });
        }
      }
    }

    // Default Fallback Admin Check
    const defaultEmail = 'casithelpline@gmail.com';
    const defaultPass = 'admin123';

    if (cleanEmail === defaultEmail || cleanEmail === 'admin@casit.com') {
      if (password.trim() === defaultPass || password.trim() === 'admin') {
        console.log(`[Admin Login] Success for default admin credentials`);
        return res.json({ success: true, message: 'Admin login successful.' });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (err) {
    console.error('[Admin Login Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// Admin Forgot Password - Sends Nodemailer Email to casithelpline@gmail.com
app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email, origin } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid admin email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Generate secure 32-char token valid for 15 minutes
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;

    adminResetStore.set(resetToken, { email: cleanEmail, expiresAt });

    // Determine domain (request body origin, headers origin, referer, or live Vercel URL)
    let hostHeader = origin || req.headers.origin;
    if (!hostHeader && req.headers.referer) {
      try {
        hostHeader = new URL(req.headers.referer).origin;
      } catch (_) {}
    }
    if (!hostHeader || hostHeader.includes('localhost') && process.env.NODE_ENV === 'production') {
      hostHeader = process.env.APP_URL || 'https://casit.vercel.app';
    }
    if (!hostHeader) {
      hostHeader = 'https://casit.vercel.app';
    }

    const resetLink = `${hostHeader}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || `"CASIT Admin" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: 'CASIT Admin - Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">CASIT ADMIN</h1>
            <p style="color: #6B7280; font-size: 13px; font-weight: 600; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Store Management System</p>
          </div>

          <div style="padding: 20px; background-color: #F9FAFB; border-radius: 12px; text-align: center; border: 1px solid #E5E7EB; margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #111827; margin: 0 0 8px 0; font-weight: 800;">Password Reset Requested</h3>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 20px 0;">Click the button below to set a new password for <strong>${cleanEmail}</strong>.</p>
            
            <a href="${resetLink}" style="display: inline-block; background-color: #FFE600; color: #000; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; border: 1px solid #EAB308;">
              🔑 Reset Admin Password Now
            </a>
            
            <p style="font-size: 11px; color: #9CA3AF; margin-top: 16px;">This link will expire in 15 minutes.</p>
          </div>

          <p style="font-size: 12px; color: #6B7280; text-align: center;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 11px; color: #2563EB; word-break: break-all; text-align: center;">${resetLink}</p>
          
          <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 0;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Admin Password Reset] Email sent to ${cleanEmail} with link ${resetLink}`);
    return res.json({ success: true, message: `Password reset link has been sent to ${cleanEmail}!` });
  } catch (err) {
    console.error('[Admin Forgot Password Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to send reset email: ' + err.message });
  }
});

// Admin Reset Password - Updates password in Supabase DB table `admin_users`
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Valid token and new password (min 4 characters) are required.' });
    }

    const tokenData = adminResetStore.get(token);
    if (!tokenData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link. Please request a new one.' });
    }

    if (Date.now() > tokenData.expiresAt) {
      adminResetStore.delete(token);
      return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new link.' });
    }

    const targetEmail = tokenData.email.toLowerCase();

    // Update in Supabase DB `admin_users` table
    if (supabase) {
      const { error } = await supabase
        .from('admin_users')
        .upsert({ email: targetEmail, password: newPassword.trim() }, { onConflict: 'email' });

      if (error) {
        console.error('Supabase admin_users update error:', error);
      } else {
        console.log(`✅ Supabase DB updated password for admin: ${targetEmail}`);
      }
    }

    // Clear reset token
    adminResetStore.delete(token);

    console.log(`[Admin Password Reset] Successfully reset password for ${targetEmail}`);
    return res.json({ success: true, message: 'Password updated successfully! You can now log in with your new password.' });
  } catch (err) {
    console.error('[Admin Reset Password Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SMTP Auth Server running on http://localhost:${PORT}`);
  });
}

export default app;
