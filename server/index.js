import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import subjectRoutes from './routes/subjects.js';
import tutorRoutes from './routes/tutors.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import ratingRoutes from './routes/ratings.js';
import { seedSubjectCatalog } from './data/subjectCatalog.js';
import { protect } from './middleware/auth.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5174' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Tutoring Connect API' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.get('/api/dashboard', protect, async (req, res) => {
  const [User, Subject, Booking] = await Promise.all([import('./models/User.js'), import('./models/Subject.js'), import('./models/Booking.js')]);
  if (req.user.role === 'admin') {
    const today = new Date(); today.setHours(0,0,0,0); const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const [students,tutors,subjects,bookings,todayBookings] = await Promise.all([
      User.default.countDocuments({role:'student'}), User.default.countDocuments({role:'tutor'}), Subject.default.countDocuments({active:true}),
      Booking.default.countDocuments(), Booking.default.countDocuments({date:{$gte:today,$lt:tomorrow},status:{$ne:'cancelled'}})
    ]);
    return res.json({ stats:{students,tutors,subjects,bookings,todayBookings} });
  }
  const filter = req.user.role === 'tutor' ? { tutor:req.user._id } : { student:req.user._id };
  const upcoming = await Booking.default.find({...filter,date:{$gte:new Date()},status:{$ne:'cancelled'}}).populate('student tutor subject').sort({date:1}).limit(5);
  res.json({ upcoming });
});
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.message || 'Unexpected server error' }); });
const port = process.env.PORT || 5001;
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await seedSubjectCatalog();
  app.listen(port, () => console.log(`API listening on ${port}`));
}).catch(err => {
  console.error('MongoDB connection or subject catalog initialization failed:', err.message);
  process.exit(1);
});
