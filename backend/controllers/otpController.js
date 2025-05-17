const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Log email configuration before creating transporter
console.log('Email Configuration Details:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true // Enable debug logging
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received request to send OTP for email:', email);
    
    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    
    // Save OTP to database
    try {
      const otpRecord = await Otp.findOneAndUpdate(
        { email },
        { 
          email, 
          otp, 
          createdAt: new Date() 
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      console.log('OTP saved to database:', otpRecord);
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save OTP to database');
    }

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Authentication',
      text: `Your OTP is: ${otp}. This OTP will expire in 5 minutes.`
    };

    console.log('Attempting to send email to:', email);
    console.log('Using email configuration:', {
      from: process.env.EMAIL_USER,
      service: 'gmail'
    });

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    
    // Generate JWT token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ message: 'OTP sent successfully', token });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ 
      error: 'Error sending OTP',
      details: error.message 
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const email = decoded.email;
    console.log('Verifying OTP for email:', email);

    // Find the OTP in the database
    const otpRecord = await Otp.findOne({ email });
    console.log('Found OTP record:', otpRecord ? 'Yes' : 'No');

    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if OTP is expired (5 minutes)
    const otpAge = Date.now() - otpRecord.createdAt.getTime();
    if (otpAge > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Delete the OTP after successful verification
    await Otp.deleteOne({ email });
    console.log('OTP deleted after successful verification');

    // Generate new token for authenticated session
    const newToken = jwt.sign({ email, verified: true }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'OTP verified successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ 
      error: 'Failed to verify OTP',
      details: error.message 
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP
}; 