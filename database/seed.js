/**
 * Script tạo dữ liệu mẫu cho hệ thống quản lý khách sạn.
 * Chạy:  npm run seed   (sau khi đã chạy database/schema.sql)
 *
 * Tài khoản mặc định (mật khẩu: 123456):
 *   - Admin:   admin@hotel.com
 *   - Lễ tân:  letan@hotel.com
 *   - Khách:   khach@gmail.com
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const IMG = 'https://images.unsplash.com/';
const q = '?auto=format&fit=crop&w=1000&q=80';

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('→ Bắt đầu tạo dữ liệu mẫu...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'booking_services', 'invoices', 'reviews', 'bookings', 'rooms',
      'room_type_images', 'room_type_amenities', 'room_types', 'amenities',
      'services', 'promotions', 'contacts', 'users', 'roles',
    ]) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1) ROLES
    await conn.query(
      `INSERT INTO roles (id, name, description) VALUES
       (1,'admin','Quản trị viên'),(2,'staff','Lễ tân / nhân viên'),(3,'client','Khách hàng')`
    );

    // 2) USERS
    const hash = await bcrypt.hash('123456', 10);
    await conn.query(
      `INSERT INTO users (role_id, full_name, email, password, phone, address) VALUES ?`,
      [[
        [1, 'Quản Trị Viên', 'admin@hotel.com', hash, '0900000001', 'TP. Hồ Chí Minh'],
        [2, 'Lê Thị Lễ Tân', 'letan@hotel.com', hash, '0900000002', 'Hà Nội'],
        [2, 'Trần Văn Tiếp Tân', 'letan2@hotel.com', hash, '0900000003', 'Đà Nẵng'],
        [3, 'Nguyễn Văn An', 'khach@gmail.com', hash, '0911111111', '12 Lê Lợi, Q1, TP.HCM'],
        [3, 'Phạm Thị Bình', 'binh@gmail.com', hash, '0922222222', '45 Trần Phú, Đà Nẵng'],
        [3, 'Hoàng Minh Cường', 'cuong@gmail.com', hash, '0933333333', '78 Bà Triệu, Hà Nội'],
      ]]
    );

    // 3) AMENITIES
    const amenities = [
      ['Wifi miễn phí', 'fa-solid fa-wifi'],
      ['TV màn hình phẳng', 'fa-solid fa-tv'],
      ['Điều hòa', 'fa-solid fa-snowflake'],
      ['Minibar', 'fa-solid fa-wine-glass'],
      ['Bữa sáng', 'fa-solid fa-mug-saucer'],
      ['Hồ bơi', 'fa-solid fa-person-swimming'],
      ['Phòng gym', 'fa-solid fa-dumbbell'],
      ['Bãi đỗ xe', 'fa-solid fa-square-parking'],
      ['Két an toàn', 'fa-solid fa-vault'],
      ['Ban công', 'fa-solid fa-door-open'],
      ['Bồn tắm', 'fa-solid fa-bath'],
      ['Dịch vụ phòng 24/7', 'fa-solid fa-bell-concierge'],
    ];
    await conn.query(`INSERT INTO amenities (name, icon) VALUES ?`, [amenities]);

    // 4) ROOM TYPES
    const roomTypes = [
      ['Phòng Tiêu Chuẩn', 'phong-tieu-chuan',
        'Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi cơ bản, phù hợp cho cặp đôi hoặc khách công tác.',
        800000, 2, 22, '1 giường đôi', 'Hướng thành phố', `${IMG}photo-1631049307264-da0ec9d70304${q}`],
      ['Phòng Cao Cấp', 'phong-cao-cap',
        'Phòng cao cấp rộng rãi với nội thất sang trọng và tầm nhìn đẹp ra thành phố.',
        1200000, 2, 28, '1 giường King', 'Hướng thành phố', `${IMG}photo-1582719478250-c89cae4dc85b${q}`],
      ['Phòng Deluxe', 'phong-deluxe',
        'Phòng Deluxe đẳng cấp với không gian thoáng đãng, bồn tắm và view tuyệt đẹp.',
        1800000, 3, 35, '1 giường King + sofa', 'Hướng biển', `${IMG}photo-1611892440504-42a792e24d32${q}`],
      ['Phòng Gia Đình', 'phong-gia-dinh',
        'Phòng gia đình rộng rãi với 2 giường lớn, lý tưởng cho kỳ nghỉ cùng gia đình.',
        2500000, 4, 45, '2 giường Queen', 'Hướng biển', `${IMG}photo-1566073771259-6a8506099945${q}`],
      ['Phòng Suite Tổng Thống', 'phong-suite-tong-thong',
        'Suite cao cấp bậc nhất với phòng khách riêng, ban công lớn và dịch vụ quản gia 24/7.',
        5000000, 4, 75, '1 giường King + phòng khách', 'Hướng biển toàn cảnh', `${IMG}photo-1590490360182-c33d57733427${q}`],
    ];
    const [rtResult] = await conn.query(
      `INSERT INTO room_types (name, slug, description, base_price, capacity, area, bed_type, view_type, thumbnail) VALUES ?`,
      [roomTypes]
    );
    const firstTypeId = rtResult.insertId; // id loại phòng đầu tiên

    // 4b) Gán tiện nghi cho từng loại phòng + ảnh gallery
    const gallery = [
      `${IMG}photo-1618773928121-c32242e63f39${q}`,
      `${IMG}photo-1505693416388-ac5ce068fe85${q}`,
      `${IMG}photo-1560448204-e02f11c3d0e2${q}`,
      `${IMG}photo-1591088398332-8a7791972843${q}`,
      `${IMG}photo-1578683010236-d716f9a3f461${q}`,
    ];
    for (let i = 0; i < 5; i++) {
      const typeId = firstTypeId + i;
      // loại càng cao cấp càng nhiều tiện nghi
      const amenityCount = [6, 8, 10, 11, 12][i];
      const rows = [];
      for (let a = 1; a <= amenityCount; a++) rows.push([typeId, a]);
      await conn.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES ?`, [rows]);
      // 3 ảnh gallery mỗi loại
      const imgs = [
        [typeId, gallery[i % gallery.length], 1],
        [typeId, gallery[(i + 1) % gallery.length], 2],
        [typeId, gallery[(i + 2) % gallery.length], 3],
      ];
      await conn.query(`INSERT INTO room_type_images (room_type_id, image_url, sort_order) VALUES ?`, [imgs]);
    }

    // 5) ROOMS — mỗi loại vài phòng trên các tầng khác nhau
    const rooms = [];
    const perType = [6, 5, 5, 4, 2];
    for (let i = 0; i < 5; i++) {
      const typeId = firstTypeId + i;
      const floor = i + 1;
      for (let n = 1; n <= perType[i]; n++) {
        const number = `${floor}0${n}`;
        rooms.push([typeId, number, floor, 'available', null]);
      }
    }
    // đặt vài phòng đang bảo trì cho thực tế
    rooms[2][3] = 'maintenance';
    rooms[10][3] = 'maintenance';
    await conn.query(
      `INSERT INTO rooms (room_type_id, room_number, floor, status, note) VALUES ?`, [rooms]
    );

    // 6) SERVICES
    const services = [
      ['Buffet sáng', 'Buffet sáng quốc tế hơn 50 món', 150000, 'người', 'fa-solid fa-utensils'],
      ['Spa & Massage', 'Liệu trình thư giãn body 60 phút', 500000, 'lần', 'fa-solid fa-spa'],
      ['Đưa đón sân bay', 'Xe sang đưa đón tận nơi', 350000, 'chuyến', 'fa-solid fa-car'],
      ['Giặt ủi', 'Dịch vụ giặt ủi nhanh trong ngày', 80000, 'kg', 'fa-solid fa-shirt'],
      ['Trả phòng muộn', 'Giữ phòng đến 18:00', 300000, 'lần', 'fa-solid fa-clock'],
      ['Giường phụ', 'Thêm 1 giường đơn', 250000, 'đêm', 'fa-solid fa-bed'],
      ['Tiệc tối lãng mạn', 'Set menu 4 món bên bờ biển', 1200000, 'set', 'fa-solid fa-champagne-glasses'],
      ['Thuê xe đạp', 'Khám phá thành phố bằng xe đạp', 100000, 'ngày', 'fa-solid fa-bicycle'],
    ];
    await conn.query(
      `INSERT INTO services (name, description, price, unit, icon) VALUES ?`, [services]
    );

    // 7) PROMOTIONS
    await conn.query(
      `INSERT INTO promotions (code, name, description, discount_type, discount_value, min_total, start_date, end_date) VALUES ?`,
      [[
        ['SUMMER10', 'Ưu đãi mùa hè', 'Giảm 10% cho mọi đơn đặt phòng', 'percent', 10, 0, '2026-06-01', '2026-08-31'],
        ['WELCOME200', 'Chào mừng khách mới', 'Giảm 200.000đ cho đơn từ 2 triệu', 'amount', 200000, 2000000, '2026-01-01', '2026-12-31'],
        ['VIP15', 'Ưu đãi khách VIP', 'Giảm 15% cho đơn từ 5 triệu', 'percent', 15, 5000000, '2026-01-01', '2026-12-31'],
      ]]
    );

    // 8) BOOKINGS mẫu
    const [[{ uid }]] = await conn.query(
      `SELECT id AS uid FROM users WHERE email='khach@gmail.com'`
    );
    const [[{ uid2 }]] = await conn.query(
      `SELECT id AS uid2 FROM users WHERE email='binh@gmail.com'`
    );
    const [[{ staffId }]] = await conn.query(
      `SELECT id AS staffId FROM users WHERE email='letan@hotel.com'`
    );
    // lấy 1 phòng của mỗi loại
    const [roomRows] = await conn.query(
      `SELECT MIN(id) AS rid, room_type_id FROM rooms GROUP BY room_type_id ORDER BY room_type_id`
    );
    const rid = (idx) => roomRows[idx].rid;

    const bookings = [
      // code, user, type, room, guest_name, phone, email, in, out, nights, adults, children, price, room_total, services, discount, total, status, pay_status, created_by
      ['BK20260601', uid, firstTypeId + 2, rid(2), 'Nguyễn Văn An', '0911111111', 'khach@gmail.com',
        '2026-06-10', '2026-06-13', 3, 2, 1, 1800000, 5400000, 300000, 540000, 5160000, 'confirmed', 'unpaid', null],
      ['BK20260602', uid, firstTypeId, rid(0), 'Nguyễn Văn An', '0911111111', 'khach@gmail.com',
        '2026-05-01', '2026-05-03', 2, 2, 0, 800000, 1600000, 0, 0, 1600000, 'checked_out', 'paid', staffId],
      ['BK20260603', uid2, firstTypeId + 3, rid(3), 'Phạm Thị Bình', '0922222222', 'binh@gmail.com',
        '2026-06-20', '2026-06-25', 5, 3, 2, 2500000, 12500000, 1200000, 0, 13700000, 'pending', 'unpaid', null],
      ['BK20260604', uid2, firstTypeId + 1, rid(1), 'Phạm Thị Bình', '0922222222', 'binh@gmail.com',
        '2026-04-10', '2026-04-12', 2, 2, 0, 1200000, 2400000, 150000, 0, 2550000, 'checked_out', 'paid', staffId],
      ['BK20260605', uid, firstTypeId + 4, rid(4), 'Nguyễn Văn An', '0911111111', 'khach@gmail.com',
        '2026-07-01', '2026-07-04', 3, 2, 2, 5000000, 15000000, 0, 0, 15000000, 'cancelled', 'unpaid', null],
    ];
    const [bkResult] = await conn.query(
      `INSERT INTO bookings
       (code, user_id, room_type_id, room_id, guest_name, guest_phone, guest_email,
        check_in, check_out, nights, adults, children, room_price, room_total,
        services_total, discount, total_amount, status, payment_status, created_by)
       VALUES ?`, [bookings]
    );
    const firstBookingId = bkResult.insertId;

    // 8b) Dịch vụ kèm cho 1 vài booking
    await conn.query(
      `INSERT INTO booking_services (booking_id, service_id, quantity, price) VALUES ?`,
      [[
        [firstBookingId, 1, 2, 150000],     // buffet sáng
        [firstBookingId, 5, 1, 300000],     // trả phòng muộn (=> ví dụ)
        [firstBookingId + 2, 7, 1, 1200000], // tiệc tối
        [firstBookingId + 3, 1, 1, 150000],
      ]]
    );

    // 9) INVOICES cho các booking đã trả phòng
    await conn.query(
      `INSERT INTO invoices (code, booking_id, subtotal, discount, total, payment_method, payment_status, issued_by) VALUES ?`,
      [[
        ['INV20260501', firstBookingId + 1, 1600000, 0, 1600000, 'cash', 'paid', staffId],
        ['INV20260401', firstBookingId + 3, 2550000, 0, 2550000, 'card', 'paid', staffId],
      ]]
    );

    // 10) REVIEWS
    await conn.query(
      `INSERT INTO reviews (user_id, room_type_id, booking_id, rating, comment) VALUES ?`,
      [[
        [uid, firstTypeId, firstBookingId + 1, 5, 'Phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!'],
        [uid2, firstTypeId + 1, firstBookingId + 3, 4, 'Vị trí đẹp, bữa sáng ngon. Hơi ồn một chút vào buổi tối.'],
        [uid, firstTypeId + 2, null, 5, 'View biển tuyệt vời, đáng đồng tiền.'],
      ]]
    );

    // 11) CONTACTS
    await conn.query(
      `INSERT INTO contacts (name, email, phone, subject, message) VALUES ?`,
      [[
        ['Lê Văn Khách', 'le@gmail.com', '0944444444', 'Hỏi về phòng hội nghị', 'Khách sạn có phòng hội nghị cho 50 người không ạ?'],
        ['Đỗ Thị Hỏi', 'do@gmail.com', '0955555555', 'Đặt tiệc cưới', 'Tôi muốn tư vấn gói tiệc cưới cuối tháng 8.'],
      ]]
    );

    console.log('✓ Tạo dữ liệu mẫu thành công!');
    console.log('  Đăng nhập:  admin@hotel.com | letan@hotel.com | khach@gmail.com  (mật khẩu: 123456)');
  } catch (err) {
    console.error('✗ Lỗi seed:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
