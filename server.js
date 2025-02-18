const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cors());

// Debugging: Print the MongoDB URI to check if it's loaded correctly
console.log("MongoDB URI:", process.env.MONGO_URI);

// Connect to MongoDB Atlas using environment variable
if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const PinSchema = new mongoose.Schema({
    lat: Number,
    lng: Number,
    radius: Number,
    startDate: Date,
    endDate: Date
});

const Pin = mongoose.model('Pin', PinSchema);

// API: Get all active pins
app.get('/pins', async (req, res) => {
    let today = new Date();
    let activePins = await Pin.find({ startDate: { $lte: today }, endDate: { $gte: today } });
    res.json(activePins);
});

// API: Add a new pin
app.post('/pins', async (req, res) => {
    const { lat, lng, radius, startDate, endDate } = req.body;
    const newPin = new Pin({ lat, lng, radius, startDate, endDate });
    await newPin.save();
    res.json({ message: 'Pin added successfully!' });
});

// API: Delete expired pins (optional cleanup)
app.delete('/pins/cleanup', async (req, res) => {
    let today = new Date();
    await Pin.deleteMany({ endDate: { $lt: today } });
    res.json({ message: 'Expired pins removed.' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));