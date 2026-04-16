import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import facilityRoutes from './routes/facility.routes';
import fieldRoutes from './routes/field.routes';
import operationalRoutes from './routes/operational.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import adminBookingRoutes from './routes/adminBooking.routes';
import promoRoutes from './routes/promo.routes';
import reviewRoutes from './routes/review.routes';
import reportRoutes from './routes/report.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/fields', fieldRoutes);
app.use('/api/v1', operationalRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payment-methods', paymentRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', adminBookingRoutes);
app.use('/api/v1/admin', reportRoutes);
app.use('/api/v1', promoRoutes);
app.use('/api/v1', reviewRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
