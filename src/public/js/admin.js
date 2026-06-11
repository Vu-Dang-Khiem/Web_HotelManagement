// ============ BẢNG ĐIỀU KHIỂN ============
document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar trên mobile
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.backdrop');
  document.querySelectorAll('.btn-hamburger').forEach((btn) => {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      if (backdrop) backdrop.classList.toggle('show');
    });
  });
  if (backdrop) backdrop.addEventListener('click', () => {
    sidebar.classList.remove('show'); backdrop.classList.remove('show');
  });

  // Tự ẩn alert
  document.querySelectorAll('.alert-auto').forEach((el) => {
    setTimeout(() => { el.style.transition = 'opacity .5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 4500);
  });

  // Xác nhận trước khi xóa
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm || 'Bạn có chắc chắn muốn thực hiện?')) e.preventDefault();
    });
  });

  // Toggle nhãn giá trị giảm theo loại (% / số tiền)
  const discountType = document.querySelector('select[name="discount_type"]');
  const discountHint = document.getElementById('discount-hint');
  if (discountType && discountHint) {
    const upd = () => { discountHint.textContent = discountType.value === 'percent' ? '%' : '₫'; };
    discountType.addEventListener('change', upd); upd();
  }
});
