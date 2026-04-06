import Contact from '../models/Contact.js';

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({ success: true, message: 'Message sent successfully!', contact: newContact });
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server error while sending message' });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: contacts.length, contacts });
    } catch (error) {
        console.error('Get Contacts Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching contacts' });
    }
};
