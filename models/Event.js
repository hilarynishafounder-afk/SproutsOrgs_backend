const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date }, // Optional sorting point
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  duration: { type: String, default: '1 Day' },
  price: { type: String, default: 'Free' },
  image: { type: String, default: '' },
  certificateImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  topics: [{ type: String }],
  benefits: [{ type: String }],
  trainerName: { type: String, default: '' },
  trainerBio: { type: String, default: '' },
  googleFormUrl: { type: String, default: '' },
  status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
  statusOverride: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-status logic: if no manual override, derive from date (or endDate if present)
eventSchema.methods.getComputedStatus = function () {
  try {
    if (this.statusOverride) return this.status;
    
    const now = new Date();
    
    // Try to parse endDate for more accurate status
    if (this.endDate && typeof this.endDate === 'string' && this.endDate.includes('-')) {
      const parts = this.endDate.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const end = new Date(year, month - 1, day, 23, 59, 59);
          if (!isNaN(end.getTime())) {
            return end < now ? 'Completed' : 'Upcoming';
          }
        }
      }
    }
    
    // Fallback to 'date' field
    if (this.date) {
      const d = new Date(this.date);
      if (!isNaN(d.getTime())) {
        return d < now ? 'Completed' : 'Upcoming';
      }
    }
    
    // Ultimate fallback
    return 'Upcoming';
  } catch (err) {
    console.error('Error in getComputedStatus:', err);
    return 'Upcoming'; // Default to Upcoming on error to prevent 500
  }
};

module.exports = mongoose.model('Event', eventSchema);
