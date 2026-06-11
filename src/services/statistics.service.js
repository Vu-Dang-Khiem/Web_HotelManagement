const BookingModel = require('../models/booking.model');
const RoomModel = require('../models/room.model');
const UserModel = require('../models/user.model');
const RoomTypeModel = require('../models/roomType.model');
const ReviewModel = require('../models/review.model');
const ContactModel = require('../models/contact.model');

const StatisticsService = {
  // Số liệu tổng quan cho dashboard admin
  async dashboard() {
    const [
      bookingStats, roomStats, totalRevenue, revenueToday,
      totalClients, totalRoomTypes, topTypes, recentBookings,
      reviewStats, newContacts,
    ] = await Promise.all([
      BookingModel.countByStatus(),
      RoomModel.countByStatus(),
      BookingModel.totalRevenue(),
      BookingModel.revenueToday(),
      UserModel.countClients(),
      RoomTypeModel.countActive(),
      BookingModel.topRoomTypes(5),
      BookingModel.recent(6),
      ReviewModel.avgRating(),
      ContactModel.countNew(),
    ]);

    const year = new Date().getFullYear();
    const monthlyRevenue = await BookingModel.revenueByMonth(year);

    // Công suất phòng (%)
    const occupancyRate = roomStats.total
      ? Math.round((roomStats.occupied / roomStats.total) * 100) : 0;

    return {
      bookingStats, roomStats, totalRevenue, revenueToday,
      totalClients, totalRoomTypes, topTypes, recentBookings,
      reviewStats, newContacts, monthlyRevenue, year, occupancyRate,
    };
  },

  // Báo cáo doanh thu theo khoảng thời gian + theo tháng
  async revenueReport(year) {
    const monthlyRevenue = await BookingModel.revenueByMonth(year);
    const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
    const totalBookings = monthlyRevenue.reduce((s, m) => s + m.bookings, 0);
    const topTypes = await BookingModel.topRoomTypes(8);
    const bookingStats = await BookingModel.countByStatus();
    return { monthlyRevenue, totalRevenue, totalBookings, topTypes, bookingStats, year };
  },

  // Dashboard cho lễ tân (đơn giản hơn)
  async staffDashboard() {
    const [bookingStats, roomStats, todayBookings, recentBookings] = await Promise.all([
      BookingModel.countByStatus(),
      RoomModel.countByStatus(),
      BookingModel.findAll({ today: true }, 10, 0),
      BookingModel.recent(8),
    ]);
    return { bookingStats, roomStats, todayBookings, recentBookings };
  },
};

module.exports = StatisticsService;
