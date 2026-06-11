/**
 * Giải phóng cổng (mặc định 3000) trước khi khởi động server.
 * Tự động chạy qua npm "prestart"/"predev" — KHÔNG BAO GIỜ làm fail npm start.
 * Nhờ vậy có thể chạy `npm start` nhiều lần mà không cần dọn tiến trình cũ thủ công.
 */
const { execSync } = require('child_process');

const PORT = Number(process.env.PORT) || 3000;

function freePortWindows() {
  let out = '';
  try {
    out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
  } catch {
    return; // không lấy được danh sách -> bỏ qua
  }
  const pids = new Set();
  for (const line of out.split('\n')) {
    // Dòng dạng:  TCP   0.0.0.0:3000   0.0.0.0:0   LISTENING   12345
    const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
    if (m && Number(m[1]) === PORT) pids.add(m[2]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`✓ Đã giải phóng cổng ${PORT} (tắt tiến trình cũ PID ${pid})`);
    } catch { /* tiến trình đã thoát -> bỏ qua */ }
  }
}

function freePortUnix() {
  try {
    const pids = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8' }).trim();
    if (pids) {
      execSync(`kill -9 ${pids.split('\n').join(' ')}`, { stdio: 'ignore' });
      console.log(`✓ Đã giải phóng cổng ${PORT}`);
    }
  } catch { /* không có gì trên cổng -> bỏ qua */ }
}

try {
  if (process.platform === 'win32') freePortWindows();
  else freePortUnix();
} catch { /* tuyệt đối không chặn việc start */ }
