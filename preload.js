const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  rect: r => ipcRenderer.send('rect', r),
  getScale: () => ipcRenderer.invoke('scale'),
  onScale: cb => ipcRenderer.on('scale', (_e, s) => cb(s)),
  onBlur: cb => ipcRenderer.on('blur', cb),
  onSys: cb => ipcRenderer.on('sys', (_e, m) => cb(m)),
  mctl: c => ipcRenderer.send('mctl', c)
});
