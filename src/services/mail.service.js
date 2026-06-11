const nodemailer = require('nodemailer');

/**
 * Dịch vụ gửi email qua SMTP (mặc định Gmail).
 * Cấu hình trong .env:
 *   MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_TO, MAIL_FROM_NAME
 *
 * Nếu chưa cấu hình (thiếu MAIL_USER/MAIL_PASS) thì việc gửi mail bị BỎ QUA
 * (chỉ ghi cảnh báo) — luồng lưu dữ liệu vào DB vẫn hoạt động bình thường.
 */

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const enabled = !!(MAIL_USER && MAIL_PASS);

let transporter = null;
if (enabled) {
  const port = Number(process.env.MAIL_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });
} else {
  console.warn(
    '⚠ Email chưa được cấu hình (thiếu MAIL_USER/MAIL_PASS trong .env). ' +
    'Tin nhắn liên hệ vẫn được lưu vào DB nhưng KHÔNG gửi email.'
  );
}

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const MailService = {
  isEnabled() {
    return enabled;
  },

  /**
   * Gửi email thông báo khi có liên hệ mới từ khách.
   * @returns {Promise<boolean>} true nếu đã gửi, false nếu bị bỏ qua/lỗi.
   */
  async sendContactNotification(contact = {}) {
    if (!enabled) return false;
    const to = process.env.MAIL_TO || MAIL_USER;
    const fromName = process.env.MAIL_FROM_NAME || 'Luxury Hotel';
    const subject = `[Liên hệ mới] ${contact.subject || '(không có chủ đề)'} — ${contact.name || ''}`;

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:15px;color:#222">
        <h2 style="color:#b8860b;margin:0 0 12px">📩 Liên hệ mới từ website</h2>
        <table style="border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0"><b>Họ tên</b></td><td>${esc(contact.name)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><b>Email</b></td><td>${esc(contact.email)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><b>Điện thoại</b></td><td>${esc(contact.phone) || '(không có)'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><b>Chủ đề</b></td><td>${esc(contact.subject) || '(không có)'}</td></tr>
        </table>
        <p style="margin:12px 0 4px"><b>Nội dung:</b></p>
        <div style="white-space:pre-wrap;background:#f7f7f7;border-left:3px solid #b8860b;padding:10px 14px">${esc(contact.message)}</div>
      </div>`;

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${MAIL_USER}>`,
        to,
        replyTo: contact.email || undefined, // bấm Reply sẽ trả lời thẳng cho khách
        subject,
        html,
      });
      console.log(`✓ Đã gửi email thông báo liên hệ tới ${to}`);
      return true;
    } catch (err) {
      console.error('✗ Gửi email liên hệ thất bại:', err.message);
      return false;
    }
  },
};

module.exports = MailService;
