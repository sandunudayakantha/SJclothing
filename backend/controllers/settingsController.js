import StoreSettings from '../models/StoreSettings.js';
import nodemailer from 'nodemailer';

// Get settings
export const getSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update settings (Admin only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = new StoreSettings({});
    }

    // Handle nested form data
    if (req.body.contact) {
      settings.contact = {
        phone: req.body.contact.phone || settings.contact?.phone || '',
        email: req.body.contact.email || settings.contact?.email || '',
        address: req.body.contact.address || settings.contact?.address || '',
        whatsapp: req.body.contact.whatsapp || settings.contact?.whatsapp || ''
      };
    }

    if (req.body.banner) {
      settings.banner = {
        title: req.body.banner.title || settings.banner?.title || '',
        description: req.body.banner.description || settings.banner?.description || '',
        image: settings.banner?.image || null
      };
    }

    if (req.body.specialOffer) {
      const enabled = req.body.specialOffer.enabled === 'true' || 
                     req.body.specialOffer.enabled === true || 
                     req.body.specialOffer.enabled === '1';
      
      settings.specialOffer = {
        enabled: enabled,
        percentage: req.body.specialOffer.percentage ? parseFloat(req.body.specialOffer.percentage) : (settings.specialOffer?.percentage || 0),
        title: req.body.specialOffer.title || settings.specialOffer?.title || ''
      };
    }

    if (req.file) {
      settings.banner.image = `/uploads/${req.file.filename}`;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Send contact form email
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const settings = await StoreSettings.getSettings();
    const adminEmail = process.env.ADMIN_EMAIL || settings.contact.email;

    if (!adminEmail) {
      return res.status(400).json({ message: 'Admin email not configured' });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
};

