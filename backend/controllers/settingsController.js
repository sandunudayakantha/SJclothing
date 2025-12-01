import StoreSettings from '../models/StoreSettings.js';
import ContactMessage from '../models/ContactMessage.js';
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
        callPhone: req.body.contact.callPhone || settings.contact?.callPhone || '',
        email: req.body.contact.email || settings.contact?.email || '',
        address: req.body.contact.address || settings.contact?.address || '',
        whatsapp: req.body.contact.whatsapp || settings.contact?.whatsapp || ''
      };
    }

    if (req.body.banner) {
      // Handle multiple banner images
      let bannerImages = settings.banner?.images || [];
      
      // If new banner images are uploaded
      if (req.files && req.files.bannerImages) {
        const newImages = req.files.bannerImages.map(file => `/uploads/${file.filename}`);
        bannerImages = [...bannerImages, ...newImages];
      }
      
      // If single banner image is uploaded (for backward compatibility)
      if (req.files && req.files.bannerImage) {
        const singleImage = `/uploads/${req.files.bannerImage[0].filename}`;
        if (!bannerImages.includes(singleImage)) {
          bannerImages.push(singleImage);
        }
      }
      
      // Handle image deletion (if bannerImagesToDelete is provided)
      if (req.body.bannerImagesToDelete) {
        const imagesToDelete = Array.isArray(req.body.bannerImagesToDelete) 
          ? req.body.bannerImagesToDelete 
          : [req.body.bannerImagesToDelete];
        bannerImages = bannerImages.filter(img => !imagesToDelete.includes(img));
      }
      
      settings.banner = {
        title: req.body.banner.title || settings.banner?.title || '',
        description: req.body.banner.description || settings.banner?.description || '',
        images: bannerImages.length > 0 ? bannerImages : (settings.banner?.images || []),
        image: bannerImages.length > 0 ? bannerImages[0] : (settings.banner?.image || null) // Keep for backward compatibility
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

    if (req.body.deliveryFee !== undefined) {
      settings.deliveryFee = req.body.deliveryFee ? parseFloat(req.body.deliveryFee) : 0;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Spam detection patterns
const spamPatterns = [
  /(?:viagra|cialis|casino|poker|loan|credit|debt|free money|make money fast)/i,
  /(?:http|https|www\.)/i, // URLs in message
  /(?:click here|buy now|limited time|act now)/i,
  /(?:\.com|\.net|\.org)/i // Domain extensions
];

// Check if message is likely spam
const isSpam = (name, email, message) => {
  const combinedText = `${name} ${email} ${message}`.toLowerCase();
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(combinedText)) {
      return true;
    }
  }
  
  // Check for excessive repetition
  const words = combinedText.split(/\s+/);
  const wordCounts = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] > 5) {
        return true; // Same word repeated more than 5 times
      }
    }
  }
  
  // Check for suspicious email patterns
  if (email.includes('+') && email.split('+').length > 2) {
    return true; // Multiple plus signs (common spam technique)
  }
  
  return false;
};

// Send contact form message (saves to database)
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, message, honeypot } = req.body;

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      return res.status(200).json({ message: 'Message sent successfully!' }); // Silent fail for bots
    }

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Basic validation
    if (name.length < 2 || name.length > 200) {
      return res.status(400).json({ message: 'Name must be between 2 and 200 characters' });
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ message: 'Message must be between 10 and 5000 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Get IP address for rate limiting
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Rate limiting: Check if same IP/email sent message in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMessages = await ContactMessage.countDocuments({
      $or: [
        { email: email.toLowerCase(), createdAt: { $gte: fiveMinutesAgo } },
        { ipAddress: ipAddress, createdAt: { $gte: fiveMinutesAgo } }
      ]
    });

    if (recentMessages > 0) {
      return res.status(429).json({ 
        message: 'Please wait a few minutes before sending another message.' 
      });
    }

    // Check for too many messages from same IP in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyMessages = await ContactMessage.countDocuments({
      ipAddress: ipAddress,
      createdAt: { $gte: oneHourAgo }
    });

    if (hourlyMessages >= 5) {
      return res.status(429).json({ 
        message: 'Too many messages sent. Please try again later.' 
      });
    }

    // Spam detection
    const isSpamMessage = isSpam(name, email, message);

    // Save message to database
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      message: message.trim(),
      ipAddress: ipAddress,
      spam: isSpamMessage
    });

    await contactMessage.save();

    // Optionally send email if SMTP is configured (non-blocking)
    try {
      const settings = await StoreSettings.getSettings();
      const adminEmail = process.env.ADMIN_EMAIL || settings.contact.email;

      if (adminEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"${name}" <${process.env.SMTP_USER}>`,
          replyTo: email,
          to: adminEmail,
          subject: `New Contact Form Message from ${name}${isSpamMessage ? ' [SPAM]' : ''}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                New Contact Form Submission${isSpamMessage ? ' [SPAM DETECTED]' : ''}
              </h2>
              <div style="margin-top: 20px;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 3px solid #000; margin-top: 10px;">
                  <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                </div>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This message was sent from the contact form on your website.
              </p>
            </div>
          `
        };

        // Send email asynchronously (don't wait for it)
        transporter.sendMail(mailOptions).catch(err => {
          console.error('Failed to send notification email:', err);
        });
      }
    } catch (emailError) {
      // Email sending is optional, just log the error
      console.error('Email notification error (non-critical):', emailError);
    }

    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};

