const { app, BrowserWindow, Tray, Menu, screen, ipcMain, nativeImage } = require('electron');
const path = require('path'), fs = require('fs');
const { spawn } = require('child_process');
// Cegah jendela ini membajak tombol media keyboard / panel media Windows
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');
const W = 520, H = 370;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let win, tray, rect = null, ign = true, scale = 0.9;
  const cfg = () => path.join(app.getPath('userData'), 'settings.json');
  try { scale = JSON.parse(fs.readFileSync(cfg(), 'utf8')).scale || scale; } catch {}
  const save = () => { try { fs.writeFileSync(cfg(), JSON.stringify({ scale })); } catch {} };

  // ===== Koneksi ke Windows: musik (media session), mic, kamera =====
  let helper = null, quitting = false, buf = '';
  function startHelper() {
    if (process.platform !== 'win32' || quitting) return;
    const script = path.join(__dirname, 'helper', 'sys.ps1').replace('app.asar', 'app.asar.unpacked');
    helper = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', script],
      { windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] });
    helper.stdin.on('error', () => {});
    helper.stdout.setEncoding('utf8');
    helper.stdout.on('data', d => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line) continue;
        try { const m = JSON.parse(line); if (win && !win.isDestroyed()) win.webContents.send('sys', m); } catch {}
      }
    });
    helper.on('error', () => {});
    helper.on('exit', () => { helper = null; buf = ''; if (!quitting) setTimeout(startHelper, 3000); });
  }
  app.on('before-quit', () => { quitting = true; if (helper) helper.kill(); });
  ipcMain.on('mctl', (_e, c) => {
    if (helper && typeof c === 'string' && /^(toggle|play|pause|next|prev|seek:\d+)$/.test(c)) helper.stdin.write(c + '\n');
  });

  const place = () => {
    const b = screen.getPrimaryDisplay().bounds;
    win.setBounds({ x: b.x + Math.round((b.width - W) / 2), y: b.y, width: W, height: H });
  };

  function create() {
    win = new BrowserWindow({
      width: W, height: H, frame: false, transparent: true, backgroundColor: '#00000000',
      resizable: false, movable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false,
      webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false }
    });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(true, { forward: true });
    place();
    win.loadFile('index.html');
    win.on('blur', () => win.webContents.send('blur'));
    screen.on('display-metrics-changed', place);
    // Cek posisi kursor lewat OS (bukan event mouse) supaya tetap akurat saat drag file & gerak cepat
    setInterval(() => {
      if (!win || !rect) return;
      const c = screen.getCursorScreenPoint(), b = win.getBounds(), x = c.x - b.x, y = c.y - b.y, pad = 6;
      const hit = x >= rect.l - pad && x <= rect.r + pad && y >= rect.t - 2 && y <= rect.b + pad;
      if (hit === ign) { ign = !hit; win.setIgnoreMouseEvents(ign, { forward: true }); }
    }, 40);
  }

  app.whenReady().then(() => {
    create();
    startHelper();
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png')).resize({ width: 16, height: 16 }));
    tray.setToolTip('Dynamic Island');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Ukuran', submenu: [80, 90, 100, 120].map(p => ({
          label: p + '%', type: 'radio', checked: Math.round(scale * 100) === p,
          click: () => { scale = p / 100; save(); win.webContents.send('scale', scale); } })) },
      { label: app.isPackaged ? 'Mulai bersama Windows' : 'Mulai bersama Windows (hanya versi installer)',
        type: 'checkbox', enabled: app.isPackaged, checked: app.getLoginItemSettings().openAtLogin,
        click: m => app.setLoginItemSettings({ openAtLogin: m.checked }) },
      { type: 'separator' },
      { label: 'Keluar', click: () => app.quit() }
    ]));
  });

  ipcMain.on('rect', (_e, r) => { rect = r; });
  ipcMain.handle('scale', () => scale);
  app.on('window-all-closed', () => app.quit());
}
