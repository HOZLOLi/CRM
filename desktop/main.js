/**
 * فیروزه — اپ دسکتاپ
 *
 * یک پنجرهٔ Electron که سرور Next.js را به‌صورت محلی اجرا می‌کند و دیتابیس
 * SQLite اختصاصی خودش را در پوشهٔ کاربر نگه می‌دارد. هیچ اینترنت، هیچ ترمینال،
 * هیچ مرورگری لازم نیست.
 */
const { app, BrowserWindow, dialog, shell, Menu, ipcMain } = require("electron");
const { spawn, execFileSync } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

// ثبت خطاها در فایل — پنجرهٔ GUI کنسول ندارد
const BOOT_LOG = path.join(os.tmpdir(), "firoozeh-desktop.log");
function log(...parts) {
  try {
    fs.appendFileSync(BOOT_LOG, `[${new Date().toISOString()}] ${parts.join(" ")}
`);
  } catch {
    /* logging must never break the app */
  }
}
process.on("uncaughtException", (error) => log("UNCAUGHT", error.stack ?? String(error)));
process.on("unhandledRejection", (error) => log("REJECTION", String(error)));
log("=== boot ===", app.getVersion?.() ?? "", process.argv.join(" "));

const APP_NAME = "فیروزه";
const DEFAULT_PORT = 34115;

/** @type {import('node:child_process').ChildProcess | null} */
let serverProcess = null;
/** @type {BrowserWindow | null} */
let mainWindow = null;

app.setName("Firoozeh");

/* --------------------------------------------------------------- helpers */

function userPaths() {
  const dir = app.getPath("userData");
  return {
    root: dir,
    db: path.join(dir, "crm.db"),
    secret: path.join(dir, "auth.secret"),
    log: path.join(dir, "server.log"),
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** راز امضای کوکی — یک‌بار ساخته و پایدار می‌ماند. */
function ensureSecret(file) {
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, "utf8").trim();
    if (existing.length >= 32) return existing;
  }
  const secret = randomBytes(32).toString("hex");
  fs.writeFileSync(file, secret, "utf8");
  return secret;
}

/** دیتابیس پایه در اولین اجرا کپی می‌شود. */
function ensureDatabase(paths) {
  ensureDir(paths.root);
  if (fs.existsSync(paths.db)) return false;

  const source = app.isPackaged
    ? path.join(process.resourcesPath, "base.db")
    : fs.existsSync(path.join(__dirname, "..", ".desktop-build", "base.db"))
      ? path.join(__dirname, "..", ".desktop-build", "base.db")
      : path.join(__dirname, "base.db");

  if (!fs.existsSync(source)) {
    throw new Error(`دیتابیس پایه پیدا نشد: ${source}`);
  }

  fs.copyFileSync(source, paths.db);
  return true;
}

/**
 * استخراج سرور از آرشیو در اولین اجرا (یا پس از به‌روزرسانی نسخه).
 * electron-builder در extraResources پوشه‌های نقطه‌دار و node_modules را
 * فیلتر می‌کند؛ بسته‌بندی به‌صورت tar.gz این مشکل را دور می‌زند.
 */
function ensureRuntime(paths) {
  const runtimeDir = path.join(paths.root, "runtime");
  const serverDir = path.join(runtimeDir, "server");
  const marker = path.join(runtimeDir, `.ready-${app.getVersion()}`);

  if (fs.existsSync(marker) && fs.existsSync(path.join(serverDir, "server.js"))) {
    return serverDir;
  }

  const archive = app.isPackaged
    ? path.join(process.resourcesPath, "server.tar.gz")
    : path.join(__dirname, "..", ".desktop-build", "server.tar.gz");

  if (!fs.existsSync(archive)) {
    throw new Error(`آرشیو سرور پیدا نشد: ${archive}`);
  }

  fs.rmSync(runtimeDir, { recursive: true, force: true });
  fs.mkdirSync(serverDir, { recursive: true });

  const tarBin =
    process.platform === "win32" && fs.existsSync("C:/Windows/System32/tar.exe")
      ? "C:/Windows/System32/tar.exe"
      : "tar";

  execFileSync(tarBin, ["-xzf", archive, "-C", serverDir], {
    stdio: "ignore",
    windowsHide: true,
  });

  fs.writeFileSync(marker, new Date().toISOString(), "utf8");
  return serverDir;
}

function toastDbPath(dbFile) {
  return dbFile.replaceAll(String.fromCharCode(92), "/");
}

/** پیدا کردن یک پورت آزاد از یک نقطهٔ شروع. */
function findFreePort(start) {
  return new Promise((resolve, reject) => {
    let port = start;
    const attempt = () => {
      const tester = net.createServer();
      tester.once("error", () => {
        port += 1;
        if (port > start + 40) reject(new Error("هیچ پورت آزادی پیدا نشد"));
        else attempt();
      });
      tester.once("listening", () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, "127.0.0.1");
    };
    attempt();
  });
}

async function waitForServer(url, timeoutMs = 45_000) {
  const startedAt = Date.now();
  for (;;) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("سرور محلی در زمان مقرر بالا نیامد");
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      /* هنوز بالا نیامده */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}

/* ----------------------------------------------------------------- server */

async function startServer() {
  const paths = userPaths();
  const created = ensureDatabase(paths);
  const secret = ensureSecret(paths.secret);
  const port = await findFreePort(DEFAULT_PORT);

  const serverDir = ensureRuntime(paths);

  if (!fs.existsSync(path.join(serverDir, "server.js"))) {
    throw new Error(
      `سرور بسته‌بندی نشده است.\nمسیر: ${serverDir}\n\nابتدا «npm run desktop:prepare» را اجرا کنید.`,
    );
  }

  const logStream = fs.createWriteStream(paths.log, { flags: "a" });

  serverProcess = spawn(process.execPath, [path.join(serverDir, "server.js")], {
    cwd: serverDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: `file:${toastDbPath(paths.db)}`,
      AUTH_SECRET: secret,
      COOKIE_SECURE: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  serverProcess.stdout.pipe(logStream);
  serverProcess.stderr.pipe(logStream);

  serverProcess.on("exit", (code) => {
    if (code && code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
      dialog.showErrorBox(
        "سرور متوقف شد",
        `فرایند سرور با کد ${code} خارج شد.\n\nفایل لاگ:\n${paths.log}`,
      );
    }
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(`${url}/api/health`);

  return { url, port, paths, firstRun: created };
}

function stopServer() {
  if (!serverProcess) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"], { windowsHide: true });
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {
    /* نادیده بگیر — فرایند در حال خروج است */
  }
  serverProcess = null;
}

/* ----------------------------------------------------------------- window */

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 390,
    minHeight: 620,
    backgroundColor: "#f2f5f3",
    title: APP_NAME,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // لینک‌های بیرونی در مرورگر سیستم باز شوند، نه در پنجرهٔ اپ
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (!target.startsWith(url)) shell.openExternal(target);
    return { action: "deny" };
  });

  mainWindow.loadURL(url);
  return mainWindow;
}

/* ------------------------------------------------------------------- menu */

function buildMenu(paths) {
  const template = [
    {
      label: APP_NAME,
      submenu: [
        { label: "بارگذاری دوباره", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "بزرگ‌نمایی", role: "zoomIn" },
        { label: "کوچک‌نمایی", role: "zoomOut" },
        { type: "separator" },
        {
          label: "پوشهٔ داده",
          click: () => shell.openPath(paths.root),
        },
        {
          label: "فایل لاگ سرور",
          click: () => shell.openPath(paths.log),
        },
        { type: "separator" },
        { label: "خروج", accelerator: "CmdOrCtrl+Q", role: "quit" },
      ],
    },
    {
      label: "درباره",
      submenu: [
        {
          label: `نسخهٔ ${app.getVersion()}`,
          enabled: false,
        },
        {
          label: "پوشهٔ برنامه",
          click: () => shell.openPath(app.getAppPath()),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------------------------------------------- boot */

const SMOKE = process.argv.includes("--smoke");

if (SMOKE) {
  app.whenReady().then(async () => {
    try {
      const { url, paths } = await startServer();
      const health = await fetch(`${url}/api/health`).then((r) => r.json());
      console.log("SMOKE_OK", JSON.stringify({ url, health, db: paths.db }));
      stopServer();
      app.exit(0);
    } catch (error) {
      console.error("SMOKE_FAIL", error instanceof Error ? error.message : String(error));
      stopServer();
      app.exit(1);
    }
  });
}

const gotLock = SMOKE ? true : app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else if (!SMOKE) {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    const splash = new BrowserWindow({
      width: 420,
      height: 260,
      frame: false,
      resizable: false,
      backgroundColor: "#f2f5f3",
      show: true,
      webPreferences: { contextIsolation: true },
    });

    splash.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <html dir="rtl"><body style="margin:0;font-family:Tahoma,sans-serif;background:#f2f5f3;color:#0f1a18;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:10px">
          <div style="width:44px;height:44px;border:2px solid #0b6e6b;transform:rotate(45deg);border-radius:8px"></div>
          <p style="font-size:15px;margin:0">فیروزه</p>
          <p style="font-size:12px;color:#8b9a96;margin:0">در حال آماده‌سازی…</p>
        </body></html>`)}`,
    );

    try {
      log("starting server…");
      const { url, paths, firstRun } = await startServer();
      log("server ready", url);
      await app.whenReady();

      // ابتدا پنجرهٔ اصلی ساخته می‌شود تا بستن splash رویداد
      // «window-all-closed» را فعال نکند و اپ خودش را نبندد
      createWindow(url);
      buildMenu(paths);
      splash.destroy();

      if (firstRun) {
        mainWindow?.webContents.once("did-finish-load", () => {
          mainWindow?.webContents.executeJavaScript(
            `console.info('[firoozeh] first run — db created')`,
          );
        });
      }
    } catch (error) {
      log("BOOT FAIL", error && error.stack ? error.stack : String(error));
      splash.destroy();
      dialog.showErrorBox(
        "اجرای فیروزه ممکن نشد",
        `${error instanceof Error ? error.message : String(error)}\n\n` +
          `اگر تازه‌تر از مخزن کلون کرده‌اید، ابتدا این را اجرا کنید:\n` +
          `npm run desktop:prepare && npm run desktop:build`,
      );
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    stopServer();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", stopServer);
  process.on("exit", stopServer);
}

/* ------------------------------------------------------------------- ipc */

ipcMain.handle("app:version", () => app.getVersion());
ipcMain.handle("app:data-dir", () => app.getPath("userData"));
