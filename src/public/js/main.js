// ============ GIAO DIỆN KHÁCH HÀNG ============
document.addEventListener('DOMContentLoaded', () => {
  // Navbar đổi nền khi cuộn
  const navbar = document.querySelector('.navbar-hotel');
  if (navbar && !navbar.classList.contains('solid')) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Tự ẩn thông báo sau 4s
  document.querySelectorAll('.alert-auto').forEach((el) => {
    setTimeout(() => { el.style.transition = 'opacity .5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 4500);
  });

  // Ngày nhận phòng tối thiểu = hôm nay; ngày trả > ngày nhận
  const checkIn = document.querySelector('input[name="check_in"]');
  const checkOut = document.querySelector('input[name="check_out"]');
  if (checkIn && checkOut) {
    const today = new Date().toISOString().split('T')[0];
    checkIn.min = today;
    const sync = () => {
      if (checkIn.value) {
        const next = new Date(checkIn.value); next.setDate(next.getDate() + 1);
        checkOut.min = next.toISOString().split('T')[0];
        if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = checkOut.min;
      }
      calcBooking();
    };
    checkIn.addEventListener('change', sync);
    checkOut.addEventListener('change', calcBooking);
  }

  // Đổi ảnh chính trong gallery chi tiết phòng
  document.querySelectorAll('.gallery-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const main = document.querySelector('.gallery-main img');
      if (main) main.src = thumb.querySelector('img').src;
      document.querySelectorAll('.gallery-thumb').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Tính tiền đặt phòng trực tiếp
  document.querySelectorAll('.service-qty, input[name="adults"], input[name="children"]').forEach((el) => {
    el.addEventListener('input', calcBooking);
  });
  calcBooking();
});

// Tính tổng tiền tạm thời (chỉ phòng + dịch vụ, KM tính ở server)
function calcBooking() {
  const box = document.getElementById('booking-calc');
  if (!box) return;
  const price = parseInt(box.dataset.price || '0', 10);
  const checkIn = document.querySelector('input[name="check_in"]');
  const checkOut = document.querySelector('input[name="check_out"]');
  let nights = 0;
  if (checkIn && checkOut && checkIn.value && checkOut.value) {
    nights = Math.max(0, Math.round((new Date(checkOut.value) - new Date(checkIn.value)) / 86400000));
  }
  const roomTotal = price * nights;
  let servicesTotal = 0;
  document.querySelectorAll('.service-qty').forEach((el) => {
    const qty = parseInt(el.value || '0', 10);
    const p = parseInt(el.dataset.price || '0', 10);
    servicesTotal += qty * p;
  });
  const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫';
  setText('calc-nights', nights + ' đêm');
  setText('calc-room', fmt(roomTotal));
  setText('calc-services', fmt(servicesTotal));
  setText('calc-total', fmt(roomTotal + servicesTotal));
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
