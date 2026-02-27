/**
 * @name Discognito
 * @description Prevent Discord from tracking you. Keep you incognito.
 * @version 1.1.0
 * @author dededed6
 */

module.exports = class Discognito {
    constructor() {
        this.meta = { name: "Discognito", version: "1.1.0" };
        this._tickerInterval = null;

        this.identity = new IdentityManager();
        this.settings = new SettingsManager(this.meta.name);
        this.nativePatcher = new NativePatcher();
        this.events = new EventManager();

        const tools = {
            meta: this.meta,
            session: this.identity,
            patcher: this.nativePatcher,
            events: this.events,
            getSettings: () => this.settings.current
        };

        this.blockTrackerMod = new BlockTrackerModule(tools);
        this.antiFingerprintingMod = new AntiFingerprintingModule(tools);
        this.identifierSpoofingMod = new IdentifierSpoofingModule(tools);
        this.securityMod = new SecurityModule(tools);
        this.storageCleanupMod = new StorageCleanupModule(tools);
    }

    start() {
        const cfg = this.settings.current;
        this.blockTrackerMod.start(cfg.blockTracker);
        this.antiFingerprintingMod.start(cfg.antiFingerprinting);
        this.identifierSpoofingMod.start(cfg.identifierSpoofing);
        this.securityMod.start(cfg.security);
        this.storageCleanupMod.start(cfg.storageCleanup);

        this._tickerInterval = setInterval(() => {
            this.events.emit("REPATCH_TICK");
        }, 10000);
    }

    stop() {
        if (this._tickerInterval) clearInterval(this._tickerInterval);
        this.storageCleanupMod.stop();
        this.events.removeAll();
        this.nativePatcher.restoreAll();
        BdApi.Patcher.unpatchAll(this.meta.name);
    }

    getSettingsPanel() {
        const container = document.createElement("div");
        container.style.cssText = "color: var(--text-normal);";

        const renderSettings = () => {
            container.innerHTML = "";
            const cfg = this.settings.current;

            // Preset selector
            const presetSection = document.createElement("div");
            presetSection.style.cssText = "margin-bottom: 20px;";

            const presetLabel = document.createElement("div");
            presetLabel.style.cssText = "font-weight: 500; margin-bottom: 8px;";
            presetLabel.textContent = "Privacy Level Preset";
            presetSection.appendChild(presetLabel);

            const presetSelect = document.createElement("select");
            presetSelect.style.cssText = "width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--background-tertiary); background: var(--background-primary); color: var(--text-normal); font-weight: 500; cursor: pointer;";

            const presets = [
                { value: "basic", label: "Basic" },
                { value: "advanced", label: "Advanced" },
                { value: "aggressive", label: "Aggressive" },
                { value: "custom", label: "Custom" }
            ];

            presets.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.value;
                opt.textContent = p.label;
                opt.selected = cfg.globalPreset === p.value;
                presetSelect.appendChild(opt);
            });

            presetSelect.addEventListener("change", () => {
                this.settings.applyPreset(presetSelect.value);
                renderSettings();
            });

            presetSection.appendChild(presetSelect);
            container.appendChild(presetSection);

            // Settings sections
            const createSection = (title, configObj, items) => {
                const section = document.createElement("div");
                section.style.cssText = "margin-bottom: 20px; padding: 12px; border: 1px solid var(--background-tertiary); border-radius: 8px;";

                const heading = document.createElement("div");
                heading.style.cssText = "font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid var(--background-tertiary); padding-bottom: 6px;";
                heading.textContent = title;
                section.appendChild(heading);

                items.forEach(item => {
                    const row = document.createElement("div");
                    row.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;";

                    const label = document.createElement("label");
                    label.style.cssText = "cursor: pointer; flex: 1;";
                    label.textContent = item.label;

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = configObj[item.key];
                    checkbox.style.cssText = "cursor: pointer; margin-left: 12px;";

                    checkbox.addEventListener("change", () => {
                        configObj[item.key] = checkbox.checked;
                        this.settings.current.globalPreset = "custom";
                        presetSelect.value = "custom";
                        this.settings.save();
                    });

                    row.appendChild(label);
                    row.appendChild(checkbox);
                    section.appendChild(row);
                });

                return section;
            };

            container.appendChild(createSection("1. Block Trackers", cfg.blockTracker, [
                { key: "science",               label: "Block Science/Analytics Events" },
                { key: "sentry",                label: "Block Sentry Error Reports" },
                { key: "telemetry",             label: "Block Telemetry (Performance)" },
                { key: "experiments",           label: "Block A/B Experiments" },
                { key: "process",               label: "Block Process/Game Monitoring" },
                { key: "typing",                label: "Block Typing Indicator" },
                { key: "readReceipts",          label: "Block Read Receipts" },
                { key: "activity",              label: "Block Activity Status" },
                { key: "webSocket",             label: "Filter WebSocket Payloads" },
                { key: "networkDrop",           label: "Hardcore Network Drop (Fetch/XHR Proxy Firewall)" }
            ]));
            container.appendChild(createSection("2. Anti-Fingerprinting", cfg.antiFingerprinting, [
                { key: "canvas",                label: "Randomize Canvas Pixels" },
                { key: "font",                  label: "Randomize Font Measurements & Enumerate" },
                { key: "webgl",                 label: "Spoof WebGL Renderer" },
                { key: "hardware",              label: "Spoof CPU/RAM Config" },
                { key: "audio",                 label: "Randomize Audio Context" },
                { key: "screen",                label: "Spoof Screen Resolution" }
            ]));
            container.appendChild(createSection("3. Identifier Spoofing", cfg.identifierSpoofing, [
                { key: "machineId",             label: "Spoof Native Machine ID" },
                { key: "discordNative",         label: "Deep DiscordNative OS Spoofing (Electron)" },
                { key: "deviceId",              label: "Spoof LocalStorage/IndexedDB Device ID" },
                { key: "superProperties",       label: "Spoof X-Super-Properties Fetch Headers" },
                { key: "windowName",            label: "Clear window.name" },
                { key: "navigator",             label: "Spoof Navigator Properties (Platform, Battery)" },
                { key: "spoofLocale",           label: "Spoof Locale" },
                { key: "spoofTimezone",         label: "Spoof Timezone" },
                { key: "mediaDevices",          label: "Randomize Media Device IDs" },
                { key: "deviceName",            label: "Spoof Computer Name" }
            ]));
            container.appendChild(createSection("4. Security", cfg.security, [
                { key: "webRTC",                label: "Force WebRTC Relay & SDP Filter (Hide IP)" },
                { key: "beacon",                label: "Block Beacon API" },
                { key: "keyboard",              label: "Add Noise to Keyboard Timestamps" },
                { key: "randomizeFileName",     label: "Randomize Uploaded File Names" },
                { key: "stripMetadata",         label: "Strip Image EXIF/Metadata Before Upload" }
            ]));
            container.appendChild(createSection("5. Storage Cleanup & Ghost Mode", cfg.storageCleanup, [
                { key: "enabled",               label: "Enable Auto-Cleanup" },
                { key: "cleanupLocalStorage",   label: "Clean LocalStorage Tracking Keys" },
                { key: "cleanupIndexedDB",      label: "Clean IndexedDB Tracking Stores" },
                { key: "nukeOnStartup",         label: "Clean cache on startup" }
            ]));

            // Apply button
            const btnSection = document.createElement("div");
            btnSection.style.cssText = "margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--background-tertiary); display: flex; justify-content: flex-end;";

            const applyBtn = document.createElement("button");
            applyBtn.textContent = "Apply & Restart";
            applyBtn.style.cssText = "background-color: var(--brand-experiment, #5865f2); color: #fff; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease; font-size: 14px;";

            applyBtn.addEventListener("mouseenter", () => {
                applyBtn.style.backgroundColor = "var(--brand-experiment-560, #4752c4)";
            });
            applyBtn.addEventListener("mouseleave", () => {
                applyBtn.style.backgroundColor = "var(--brand-experiment, #5865f2)";
            });

            applyBtn.addEventListener("click", () => {
                this.settings.save();
                setTimeout(() => {
                    BdApi.Plugins.reload(this.meta.name);
                }, 800);
            });

            btnSection.appendChild(applyBtn);
            container.appendChild(btnSection);

            // Identity display
            const s = this.identity;
            const idPanel = document.createElement("div");
            idPanel.style.cssText = "margin-top: 24px; padding: 16px; background: var(--background-tertiary); border-radius: 8px; font-size: 13px; line-height: 1.6;";

            if (cfg.identifierSpoofing.discordNative) idPanel.innerHTML += `<div>OS: <strong>${s.osProfile.os} (${s.osProfile.os_version})</strong></div>`;
            if (cfg.identifierSpoofing.hardware) idPanel.innerHTML += `<div>Hardware: <strong>${s.hardwareConcurrency}C / ${s.deviceMemory}GB</strong></div>`;
            if (cfg.identifierSpoofing.spoofLocale) idPanel.innerHTML += `<div>Locale: <strong>${s.locale}</strong></div>`;
            if (cfg.identifierSpoofing.spoofTimezone) idPanel.innerHTML += `<div>Timezone: <strong>${s.timezone}</strong> (Offset: ${s.timezoneOffset})</div>`;
            if (cfg.identifierSpoofing.gpu) idPanel.innerHTML += `<div title="${s.gpu.renderer}">GPU: <strong>${s.gpu.vendor}</strong></div>`;
            if (cfg.identifierSpoofing.machineId) idPanel.innerHTML += `<div title="${s.machineGuid}">Machine ID: <strong>${s.machineGuid}</strong></div>`;
            if (cfg.identifierSpoofing.deviceId) idPanel.innerHTML += `<div title="${s.deviceId}">Device ID: <strong>${s.deviceId}</strong></div>`;
            if (cfg.identifierSpoofing.windowName) idPanel.innerHTML += `<div>PC Name: <strong>${s.deviceName}</strong></div>`;

            container.appendChild(idPanel);
        };

        renderSettings();
        return container;
    }
};

class IdentityManager {
    constructor() {
        this.regenerate();
    }

    regenerate() {
        const pick = (items) => items[Math.floor(Math.random() * items.length)];
        const weightedPick = (items) => {
            let r = Math.random() * items.reduce((s, i) => s + i.w, 0);
            for (const item of items) { r -= item.w; if (r <= 0) return item.v; }
            return items[items.length - 1].v;
        };

        this.osProfile = weightedPick([
            { w: 50, v: { os: "Windows", os_version: "10.0.22631", platform: "Win32" } },
            { w: 30, v: { os: "Windows", os_version: "10.0.22621", platform: "Win32" } },
            { w: 20, v: { os: "Windows", os_version: "10.0.26100", platform: "Win32" } }
        ]);

        this.gpu = weightedPick([
            { w: 15, v: { vendor: "Google Inc. (NVIDIA)", renderer: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)" } },
            { w: 20, v: { vendor: "Google Inc. (NVIDIA)", renderer: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Direct3D11 vs_5_0 ps_5_0, D3D11)" } },
            { w: 35, v: { vendor: "Google Inc. (NVIDIA)", renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)" } },
            { w: 30, v: { vendor: "Google Inc. (NVIDIA)", renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)" } }
        ]);

        this.screenProfile = weightedPick([
            { w: 40, v: { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24, pixelDepth: 24, dpr: 1.0 } },
            { w: 20, v: { width: 1366, height: 768, availWidth: 1366, availHeight: 728, colorDepth: 24, pixelDepth: 24, dpr: 1.0 } },
            { w: 15, v: { width: 2560, height: 1440, availWidth: 2560, availHeight: 1400, colorDepth: 24, pixelDepth: 24, dpr: 1.0 } },
            { w: 15, v: { width: 1536, height: 864, availWidth: 1536, availHeight: 824, colorDepth: 24, pixelDepth: 24, dpr: 1.25 } }
        ]);

        this.hardwareConcurrency = pick([4, 8, 12, 16]);
        this.deviceMemory = pick([4, 8, 16, 32]);

        const regionPair = pick([
            { l: "en-US", t: "America/New_York", o: 300 },
            { l: "en-US", t: "America/Los_Angeles", o: 480 },
            { l: "en-GB", t: "Europe/London", o: 0 },
            { l: "ko-KR", t: "Asia/Seoul", o: -540 },
            { l: "ja-JP", t: "Asia/Tokyo", o: -540 },
            { l: "de-DE", t: "Europe/Berlin", o: -60 },
            { l: "fr-FR", t: "Europe/Paris", o: -60 }
        ]);
        this.locale = regionPair.l;
        this.timezone = regionPair.t;
        this.timezoneOffset = regionPair.o;

        const pcPrefix = pick(["DESKTOP", "LAPTOP"]);
        const pcSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
        this.deviceName = `${pcPrefix}-${pcSuffix}`;

        this.deviceId = this._uuid();
        this.analyticsToken = this._uuid();
        this.machineGuid = this._uuid();

        this.fontOffsetSeed = Math.random();
        this.canvasNoiseSeed = Math.random();
        this.keyboardNoise = Math.random() * 4;
        this.rectNoise = Math.random() * 0.1;
    }

    _uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}

class SettingsManager {
    constructor(pluginName) {
        this.pluginName = pluginName;
        
        this.PRESETS = {
            basic: {
                blockTracker: { science: true, analytics: true, telemetry: true, sentry: true, experiments: true, process: false, typing: false, readReceipts: false, activity: false, webSocket: false, networkDrop: false },
                antiFingerprinting: { canvas: false, audio: false, font: false, webgl: false, hardware: false, screen: false },
                identifierSpoofing: { machineId: false, discordNative: false, deviceId: false, superProperties: false, navigator: false, windowName: false, deviceName: false, mediaDevices: false, spoofLocale: false, spoofTimezone: false },
                security: { webRTC: false, beacon: false, keyboard: false, randomizeFileName: false, stripMetadata: false },
                storageCleanup: { enabled: false, cleanupLocalStorage: false, cleanupIndexedDB: false, nukeOnStartup: false }
            },
            advanced: {
                blockTracker: { science: true, analytics: true, telemetry: true, sentry: true, experiments: true, process: true, typing: false, readReceipts: false, activity: false, webSocket: true, networkDrop: true },
                antiFingerprinting: { canvas: true, audio: false, font: true, webgl: true, hardware: true, screen: false },
                identifierSpoofing: { machineId: true, discordNative: true, deviceId: true, superProperties: true, navigator: true, windowName: true, deviceName: false, mediaDevices: false, spoofLocale: false, spoofTimezone: false },
                security: { webRTC: true, beacon: true, keyboard: false, randomizeFileName: true, stripMetadata: false },
                storageCleanup: { enabled: true, cleanupLocalStorage: true, cleanupIndexedDB: false, nukeOnStartup: false }
            },
            aggressive: {
                blockTracker: { science: true, analytics: true, telemetry: true, sentry: true, experiments: true, process: true, typing: true, readReceipts: true, activity: true, webSocket: true, networkDrop: true },
                antiFingerprinting: { canvas: true, audio: true, font: true, webgl: true, hardware: true, screen: true },
                identifierSpoofing: { machineId: true, discordNative: true, deviceId: true, superProperties: true, navigator: true, windowName: true, deviceName: true, mediaDevices: true, spoofLocale: true, spoofTimezone: true },
                security: { webRTC: true, beacon: true, keyboard: true, randomizeFileName: true, stripMetadata: true },
                storageCleanup: { enabled: true, cleanupLocalStorage: true, cleanupIndexedDB: true, nukeOnStartup: true }
            }
        };

        this.defaultSettings = {
            globalPreset: "advanced",
            blockTracker: { ...this.PRESETS.advanced.blockTracker },
            antiFingerprinting: { ...this.PRESETS.advanced.antiFingerprinting },
            identifierSpoofing: { ...this.PRESETS.advanced.identifierSpoofing },
            security: { ...this.PRESETS.advanced.security },
            storageCleanup: { ...this.PRESETS.advanced.storageCleanup, cleanupIntervalMs: 300000 }
        };

        const saved = BdApi.Data.load(this.pluginName, "settings") || {};
        this.current = this._deepMerge(JSON.parse(JSON.stringify(this.defaultSettings)), saved);
    }

    _deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key]) && typeof source[key] !== 'function') {
                if (!target[key]) Object.assign(target, { [key]: {} });
                this._deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
        return target;
    }

    save() {
        BdApi.Data.save(this.pluginName, "settings", this.current);
    }

    applyPreset(presetName) {
        this.current.globalPreset = presetName;

        if (presetName !== "custom") {
            const targetConfig = this.PRESETS[presetName];
            if (targetConfig) {
                Object.keys(targetConfig).forEach(module => {
                    this.current[module] = JSON.parse(JSON.stringify(targetConfig[module]));
                });
            }
        }
        this.save();
    }
}

class NativePatcher {
    constructor() { this.restorers = []; }
    
    patchNative(obj, prop, factory) {
        if (!obj || !obj[prop]) return;
        const orig = obj[prop];
        const patched = factory(orig);
        
        try { Object.defineProperty(patched, "toString", { get: () => orig.toString.bind(orig) }); } catch (e) { }
        
        try {
            obj[prop] = patched;
        } catch (e) {
            try {
                Object.defineProperty(obj, prop, { value: patched, configurable: true, writable: true });
            } catch (e2) {
                return; 
            }
        }

        this.restorers.push(() => {
            try { 
                obj[prop] = orig; 
            } catch (e) {
                try { Object.defineProperty(obj, prop, { value: orig, configurable: true, writable: true }); } catch (e2) {}
            }
        });
    }

    patchDescriptor(obj, prop, descriptor) {
        if (!obj) return;
        const orig = Object.getOwnPropertyDescriptor(obj, prop);
        try {
            Object.defineProperty(obj, prop, { configurable: true, ...descriptor });
        } catch(e) { return; }
        
        this.restorers.push(() => { 
            if (orig) {
                try { Object.defineProperty(obj, prop, orig); } catch(e) {} 
            } else { 
                try { delete obj[prop]; } catch (e) { } 
            } 
        });
    }

    restoreAll() {
        for (const restore of [...this.restorers].reverse()) { try { restore(); } catch (e) { } }
        this.restorers = [];
    }
}

class EventManager {
    constructor() { this.listeners = {}; }
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => { try { cb(...args); } catch (e) { } });
        }
    }
    removeAll() { this.listeners = {}; }
}

class BlockTrackerModule {
    constructor(tools) { this.tools = tools; }
    
    start(cfg) {
        const handlers = {
            science: () => this.patchScience(),
            analytics: () => this.patchScience(),
            telemetry: () => this.patchTelemetry(),
            sentry: () => this.patchSentry(),
            experiments: () => this.patchExperiments(),
            typing: () => this.patchTyping(),
            readReceipts: () => this.patchReadReceipts(),
            activity: () => this.patchActivity(),
            webSocket: () => this.patchWebSocket(),
            process: () => {
                this.repatchProcessMonitor();
                this.tools.events.on("REPATCH_TICK", () => this.repatchProcessMonitor());
            }
        };

        Object.keys(cfg).filter(key => cfg[key]).forEach(key => handlers[key]?.());
    }

    patchScience() {
        const p = BdApi.Patcher, n = this.tools.meta.name, w = BdApi.Webpack;
        const m = w.getModule(m => m?.trackWithMetadata && m?.track);
        if (m) { p.instead(n, m, "track", () => { }); p.instead(n, m, "trackWithMetadata", () => { }); }
        const a = w.getByKeys("AnalyticEventConfigs");
        if (a?.default?.track) p.instead(n, a.default, "track", () => { });
        const r = w.getModule(m => m?.reportEvent);
        if (r?.reportEvent) p.instead(n, r, "reportEvent", () => { });
    }

    patchTelemetry() {
        const p = BdApi.Patcher, n = this.tools.meta.name, w = BdApi.Webpack;
        const m = w.getModule(m => m?.markStart && m?.markEnd);
        if (m) { p.instead(n, m, "markStart", () => { }); p.instead(n, m, "markEnd", () => { }); if (m.submitPerformance) p.instead(n, m, "submitPerformance", () => { }); }
    }

    patchSentry() {
        if (window.__SENTRY__) { window.__SENTRY__.globalEventProcessors?.splice(0, 99); window.__SENTRY__.logger?.disable(); }
        const h = window.DiscordSentry?.getCurrentHub?.();
        if (h) { h.getClient()?.close?.(0); h.getScope()?.clear?.(); h.setUser(null); h.setTags({}); h.setExtras({}); }
        for (const m of Object.keys(console)) { if (console[m]?.__sentry_original__) console[m] = console[m].__sentry_original__; }
        const c = window.DiscordSentry?.getClient?.() ?? window.__SENTRY__?.hub?.getClient?.();
        if (c) { try { c.captureException = () => { }; c.captureEvent = () => { }; c.captureMessage = () => { }; } catch (_) { } }
    }

    patchExperiments() {
        const p = BdApi.Patcher, n = this.tools.meta.name, w = BdApi.Webpack;
        const m = w.getModule(m => m?.getExperimentOverrides);
        const te = w.getModule(m => m?.trackExposure);
        if (m) p.instead(n, m, "getExperimentOverrides", () => ({}));
        if (te?.trackExposure) p.instead(n, te, "trackExposure", () => { });
    }

    patchTyping() {
        const m = BdApi.Webpack.getModule(m => m?.startTyping);
        if (m) BdApi.Patcher.instead(this.tools.meta.name, m, "startTyping", () => { });
    }

    patchReadReceipts() {
        const m = BdApi.Webpack.getModule(m => m?.ack && m?.receiveMessage);
        if (m?.ack) BdApi.Patcher.instead(this.tools.meta.name, m, "ack", () => { });
    }

    patchActivity() {
        const p = BdApi.Patcher, n = this.tools.meta.name, w = BdApi.Webpack;
        const u = w.getModule(m => m?.sendActivityInviteUser);
        if (u) { for (const k of Object.keys(u)) if (k.includes("send")) p.instead(n, u, k, () => { }); }
        const s = w.getModule(m => m?.getActivities);
        if (s) { p.instead(n, s, "getActivities", () => []); p.instead(n, s, "getPrimaryActivity", () => null); }
    }

    repatchProcessMonitor() {
        const m = BdApi.Webpack.getByKeys("getDiscordUtils");
        if (m && !BdApi.Patcher.getPatchesByCaller(this.tools.meta.name).some(p => p.module === m)) {
            BdApi.Patcher.instead(this.tools.meta.name, m, "ensureModule", (_, [name], orig) => { if (name?.includes("discord_rpc")) return; return orig(name); });
            const u = m.getDiscordUtils?.();
            if (u?.setObservedGamesCallback) { u.setObservedGamesCallback([], () => { }); BdApi.Patcher.instead(this.tools.meta.name, u, "setObservedGamesCallback", () => { }); }
        }
    }

    patchWebSocket() {
        const origWS = window.WebSocket;
        window.WebSocket = class extends origWS {
            addEventListener(type, handler) {
                if (type === "message") {
                    return super.addEventListener(type, (event) => {
                        try {
                            const msg = JSON.parse(event.data);
                            if (msg.op === 0) {
                                if (msg.t === "READY" && msg.d?.user) { delete msg.d.user.analytics_token; delete msg.d.user.fingerprint; }
                                if (msg.t === "PRESENCE_UPDATE" && msg.d?.activities) msg.d.activities = [];
                            }
                            const newEvent = new Event("message"); newEvent.data = JSON.stringify(msg);
                            return handler.call(this, newEvent);
                        } catch (_) { return handler(event); }
                    });
                }
                return super.addEventListener(type, handler);
            }
        };
        this.tools.patcher.restorers.push(() => { window.WebSocket = origWS; });
    }
}

class AntiFingerprintingModule {
    constructor(tools) { this.tools = tools; }

    start(cfg) {
        const handlers = {
            hardware: () => this.patchHardware(),
            webgl: () => this.patchWebGL(),
            canvas: () => this.patchCanvas(),
            audio: () => this.patchAudio(),
            font: () => this.patchFont(),
            screen: () => this.patchScreen()
        };
        Object.keys(cfg).filter(key => cfg[key]).forEach(key => handlers[key]?.());
    }

    patchHardware() {
        const s = this.tools.session;
        this.tools.patcher.patchDescriptor(Navigator.prototype, "hardwareConcurrency", { get: () => s.hardwareConcurrency });
        this.tools.patcher.patchDescriptor(Navigator.prototype, "deviceMemory", { get: () => s.deviceMemory });
    }

    patchWebGL() {
        const p = (Ctx) => {
            if (!Ctx) return;
            this.tools.patcher.patchNative(Ctx.prototype, "getParameter", (orig) => function (p) {
                if (p === 37446) return this.tools.session.gpu.renderer; if (p === 37445) return this.tools.session.gpu.vendor; return orig.call(this, p);
            }.bind(this));
            this.tools.patcher.patchNative(Ctx.prototype, "getExtension", (orig) => function (name) {
                if (name === "WEBGL_debug_renderer_info") return null; return orig.call(this, name);
            });
        };
        p(window.WebGLRenderingContext); p(window.WebGL2RenderingContext);
    }

    patchCanvas() {
        const s = this.tools.session;
        const delta = (w, h) => (((w * 31 + h) / 10000 + s.canvasNoiseSeed) % 1 > 0.5 ? 1 : -1);
        this.tools.patcher.patchNative(HTMLCanvasElement.prototype, "toDataURL", (orig) => function (...args) {
            const url = orig.apply(this, args); if (!url || url === "data:,") return url;
            return url.slice(0, -4) + Math.abs(Math.floor(delta(this.width, this.height) * 9999 + s.canvasNoiseSeed * 1000)).toString(16).padStart(4, "0").slice(0, 4);
        });
        this.tools.patcher.patchNative(HTMLCanvasElement.prototype, "toBlob", (orig) => function (callback, ...args) {
            if (!this.width || !this.height) return orig.call(this, callback, ...args);
            const off = document.createElement("canvas"); off.width = this.width; off.height = this.height;
            const ctx = off.getContext("2d"); ctx.drawImage(this, 0, 0);
            const img = ctx.getImageData(0, 0, this.width, this.height); const d = delta(this.width, this.height);
            for (let i = 0; i < img.data.length; i += 400) img.data[i] = Math.min(255, Math.max(0, img.data[i] + d));
            ctx.putImageData(img, 0, 0); return orig.call(off, callback, ...args);
        });
        this.tools.patcher.patchNative(CanvasRenderingContext2D.prototype, "getImageData", (orig) => function (...args) {
            const img = orig.apply(this, args); const d = delta(img.width, img.height);
            for (let i = 0; i < img.data.length; i += 400) img.data[i] = Math.min(255, Math.max(0, img.data[i] + d));
            return img;
        });
    }

    patchAudio() {
        const s = this.tools.session;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (window.OfflineAudioContext) {
            this.tools.patcher.patchNative(OfflineAudioContext.prototype, "startRendering", (orig) => function () {
                return orig.call(this).then(buf => {
                    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
                        const data = buf.getChannelData(ch);
                        for (let i = 0; i < data.length; i++) data[i] += ((s.canvasNoiseSeed * (i + 1) * (ch + 1)) % 1 - 0.5) * 0.0001;
                    }
                    return buf;
                });
            });
        }
        if (AudioCtx) {
            this.tools.patcher.patchNative(AudioCtx.prototype, "createDynamicsCompressor", (orig) => function () {
                const c = orig.call(this);
                try { c.threshold.value += (s.canvasNoiseSeed - 0.5) * 0.01; c.knee.value += (s.canvasNoiseSeed - 0.5) * 0.01; } catch (_) { }
                return c;
            });
        }
    }

    patchFont() {
        const s = this.tools.session;
        const fontOffset = (font) => {
            let h = 0; for (let i = 0; i < font.length; i++) { h = ((h << 5) - h) + font.charCodeAt(i); h |= 0; }
            return ((Math.abs(h) % 100) / 100 + s.fontOffsetSeed) % 1 * 2 - 1;
        };
        this.tools.patcher.patchNative(CanvasRenderingContext2D.prototype, "measureText", (orig) => function (text) {
            const r = orig.call(this, text); const off = fontOffset(this.font || "");
            return new Proxy(r, { get: (t, p) => (p === "width" ? t.width + off : (typeof t[p] === "function" ? t[p].bind(t) : t[p])) });
        });
        const ALLOWED = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana", "Georgia", "Trebuchet MS", "Impact"];
        const isAllowed = (font) => ALLOWED.some(a => font.replace(/^\d+px\s*/, "").replace(/['"]/g, "").trim().toLowerCase().includes(a.toLowerCase()));
        if (document.fonts?.check) this.tools.patcher.patchNative(document.fonts, "check", (orig) => function (font) { return isAllowed(font) ? orig.call(this, font) : false; });
        if (document.fonts?.load) this.tools.patcher.patchNative(document.fonts, "load", (orig) => function (font, ...a) { return isAllowed(font) ? orig.call(this, font, ...a) : Promise.resolve([]); });
    }

    patchScreen() {
        const sp = this.tools.session.screenProfile;
        for (const k of ["width", "height", "availWidth", "availHeight", "colorDepth", "pixelDepth"]) {
            this.tools.patcher.patchDescriptor(Screen.prototype, k, { get: () => sp[k] });
        }
        this.tools.patcher.patchDescriptor(window, "devicePixelRatio", { get: () => sp.dpr });
    }
}

class IdentifierSpoofingModule {
    constructor(tools) { this.tools = tools; }

    start(cfg) {
        const handlers = {
            machineId: () => { this.repatchDiscordNative(); this.tools.events.on("REPATCH_TICK", () => this.repatchDiscordNative()); },
            discordNative: () => { this.repatchDiscordNative(); this.tools.events.on("REPATCH_TICK", () => this.repatchDiscordNative()); },
            windowName: () => this.patchWindowName(),
            deviceName: () => this.patchDeviceName(),
            navigator: () => this.patchNavigator(),
            deviceId: () => this.patchDeviceId(),
            mediaDevices: () => this.patchMediaDevices(),
            spoofLocale: () => this.patchLocale(),
            spoofTimezone: () => this.patchTimezone()
        };
        
        Object.keys(cfg).filter(key => cfg[key]).forEach(key => handlers[key]?.());
        this.applyUnifiedNetworkFirewall(); 
    }

    patchWindowName() {
        try { window.name = ""; this.tools.patcher.patchDescriptor(window, "name", { get: () => "", set: () => { } }); } catch (_) { }
    }

    patchDeviceName() {
        try { ["deviceName", "device_name", "computerName"].forEach(k => { if (localStorage.getItem(k)) localStorage.setItem(k, this.tools.session.deviceName); }); } catch (_) { }
    }

    patchNavigator() {
        const s = this.tools.session;
        this.tools.patcher.patchDescriptor(Navigator.prototype, "platform", { get: () => s.osProfile.platform });
        if ("connection" in navigator) this.tools.patcher.patchDescriptor(Navigator.prototype, "connection", { get: () => undefined });
        if (typeof Navigator.prototype.getBattery === "function") this.tools.patcher.patchNative(Navigator.prototype, "getBattery", () => () => Promise.reject(new Error("Not supported")));
    }

    patchDeviceId() {
        const s = this.tools.session;
        const KEYS = ["fingerprint", "analytics_token", "deviceId", "device_id", "_discord_fingerprint"];
        const origSet = Storage.prototype.setItem; const origGet = Storage.prototype.getItem;
        const spoofVal = (k) => k.includes("analytics") ? s.analyticsToken : s.deviceId;

        this.tools.patcher.patchNative(Storage.prototype, "setItem", () => function (k, v) { return origSet.call(this, k, KEYS.some(f => k.includes(f)) ? spoofVal(k) : v); });
        this.tools.patcher.patchNative(Storage.prototype, "getItem", () => function (k) {
            if (!KEYS.some(f => k.includes(f))) return origGet.call(this, k);
            const stored = origGet.call(this, k); const val = spoofVal(k);
            if (!stored) origSet.call(this, k, val); return stored || val;
        });
        const origPut = IDBObjectStore.prototype.put; const origAdd = IDBObjectStore.prototype.add;
        const scrub = (v) => {
            if (typeof v !== "object" || !v) return v;
            const c = { ...v }; for (const k of Object.keys(c)) if (KEYS.some(f => k.includes(f))) c[k] = spoofVal(k); return c;
        };
        this.tools.patcher.patchNative(IDBObjectStore.prototype, "put", () => function (v, ...a) { return origPut.call(this, scrub(v), ...a); });
        this.tools.patcher.patchNative(IDBObjectStore.prototype, "add", () => function (v, ...a) { return origAdd.call(this, scrub(v), ...a); });

        const fpMod = BdApi.Webpack.getModule(m => m?.getFingerprint || m?.generateFingerprint);
        if (fpMod) {
            const key = fpMod.getFingerprint ? "getFingerprint" : "generateFingerprint";
            if (typeof fpMod[key] === "function") BdApi.Patcher.instead(this.tools.meta.name, fpMod, key, () => s.deviceId);
        }
    }

    patchMediaDevices() {
        const idMap = new Map();
        const fakeId = (id) => { if (!id) return ""; if (!idMap.has(id)) idMap.set(id, this.tools.session._uuid()); return idMap.get(id); };
        this.tools.patcher.patchNative(MediaDevices.prototype, "enumerateDevices", (orig) => async function () {
            return (await orig.call(this)).map(d => Object.setPrototypeOf({
                deviceId: fakeId(d.deviceId), groupId: fakeId(d.groupId), kind: d.kind, label: d.label,
                toJSON: () => ({ deviceId: fakeId(d.deviceId), groupId: fakeId(d.groupId), kind: d.kind, label: d.label }),
            }, MediaDeviceInfo.prototype));
        });
    }

    patchLocale() {
        this.tools.patcher.patchDescriptor(Navigator.prototype, "language", { get: () => this.tools.session.locale });
        this.tools.patcher.patchDescriptor(Navigator.prototype, "languages", { get: () => [this.tools.session.locale, "en"] });
    }

    patchTimezone() {
        const s = this.tools.session;
        const origDTF = Intl.DateTimeFormat;
        this.tools.patcher.patchNative(Intl, "DateTimeFormat", () => function (locales, options) {
            const opts = options || {}; if (!opts.timeZone) opts.timeZone = s.timezone;
            return new origDTF(locales, opts);
        });
        this.tools.patcher.patchNative(Date.prototype, "getTimezoneOffset", () => function () { return s.timezoneOffset; });
    }

    applyUnifiedNetworkFirewall() {
        const settings = this.tools.getSettings();
        const dropNetwork = settings.blockTracker.networkDrop;
        const spoofProps = settings.identifierSpoofing.superProperties;
        
        if (!dropNetwork && !spoofProps) return;

        const s = this.tools.session;
        const sysLocale = settings.identifierSpoofing.spoofLocale ? s.locale : (navigator.language || "ko-KR");
        const spoofed = btoa(unescape(encodeURIComponent(JSON.stringify({ os: s.osProfile.os, browser: "Discord Client", device: "", os_version: s.osProfile.os_version, system_locale: sysLocale, client_event_source: null }))));
        const TRACKING_URLS = ["/science", "/track", "sentry.io", "/metrics"];
        const isTracking = (url) => typeof url === "string" && TRACKING_URLS.some(t => url.includes(t));

        const mod = BdApi.Webpack.getModule(m => m?.getSuperPropertiesBase64 || m?.superProperties);
        if (mod && spoofProps) {
            if (mod.getSuperPropertiesBase64) BdApi.Patcher.instead(this.tools.meta.name, mod, "getSuperPropertiesBase64", () => spoofed);
            if (mod.superProperties) BdApi.Patcher.instead(this.tools.meta.name, mod, "superProperties", () => JSON.parse(decodeURIComponent(escape(atob(spoofed)))));
        }

        this.tools.patcher.patchNative(XMLHttpRequest.prototype, "open", (orig) => function (method, url, ...rest) {
            if (dropNetwork && isTracking(url)) this.__dropRequest = true;
            return orig.call(this, method, url, ...rest);
        });
        this.tools.patcher.patchNative(XMLHttpRequest.prototype, "send", (orig) => function (data) {
            if (this.__dropRequest) {
                Object.defineProperty(this, "readyState", { get: () => 4, configurable: true });
                Object.defineProperty(this, "status", { get: () => 200, configurable: true });
                if (this.onreadystatechange) this.onreadystatechange();
                if (this.onload) this.onload();
                return;
            }
            return orig.call(this, data);
        });
        this.tools.patcher.patchNative(XMLHttpRequest.prototype, "setRequestHeader", (orig) => function (header, value) {
            return orig.call(this, header, (spoofProps && header === "X-Super-Properties") ? spoofed : value);
        });

        this.tools.patcher.patchNative(window, "fetch", (orig) => function (input, init = {}) {
            const url = typeof input === "string" ? input : input?.url;
            if (dropNetwork && isTracking(url)) return Promise.resolve(new Response(null, { status: 200 }));
            if (spoofProps) {
                if (init.headers) {
                    if (init.headers instanceof Headers && init.headers.has("X-Super-Properties")) init.headers.set("X-Super-Properties", spoofed);
                    else if (init.headers["X-Super-Properties"]) init = { ...init, headers: { ...init.headers, "X-Super-Properties": spoofed } };
                }
            }
            return orig.call(this, input, init);
        });
    }

    repatchDiscordNative() {
        if (!window.DiscordNative || window.DiscordNative.__isPatched) return;

        const s = this.tools.session;
        const settings = this.tools.getSettings();

        try {
            const proxyDn = new Proxy(window.DiscordNative, {
                get: (target, prop) => {
                    if (prop === "__isPatched") return true;

                    if (prop === "processUtils" && settings.identifierSpoofing.machineId) {
                        return new Proxy(target[prop] || {}, {
                            get: (obj, key) => key === "getRawMachineId" ? () => s.machineGuid : obj[key]
                        });
                    }

                    if (prop === "os" && settings.identifierSpoofing.discordNative) {
                        return new Proxy(target[prop] || {}, {
                            get: (obj, key) => {
                                if (key === "release") return () => s.osProfile.os_version;
                                if (key === "arch") return () => "x64";
                                return obj[key];
                            }
                        });
                    }

                    return target[prop];
                }
            });

            Object.defineProperty(window, "DiscordNative", {
                value: proxyDn,
                configurable: true
            });
        } catch (e) {
        }
    }
}

class SecurityModule {
    constructor(tools) { this.tools = tools; }

    start(cfg) {
        const handlers = {
            beacon: () => this.patchBeacon(),
            webRTC: () => this.patchWebRTC(),
            keyboard: () => this.patchKeyboard()
        };
        Object.keys(cfg).filter(key => cfg[key]).forEach(key => handlers[key]?.());

        if (cfg.randomizeFileName || cfg.stripMetadata) {
            this.patchFileOperations(cfg);
        }
    }

    patchBeacon() {
        this.tools.patcher.patchNative(navigator, "sendBeacon", () => () => true);
    }

    patchWebRTC() {
        const LOCAL_IP_RE = new RegExp(["\\b192\\.168\\.\\d{1,3}\\.\\d{1,3}\\b", "\\b10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b", "\\b172\\.(1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3}\\b", "\\bfe80:[:\\da-fA-F]+\\b", "\\b127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b"].join("|"));
        const isLocal = (c) => c && LOCAL_IP_RE.test(c);
        this.tools.patcher.patchNative(window, "RTCPeerConnection", (Orig) => function (...args) {
            const pc = new Orig(...args);
            let _h = null;
            Object.defineProperty(pc, "onicecandidate", {
                get: () => _h, set: (h) => { _h = h ? (e) => { if (!isLocal(e?.candidate?.candidate)) h(e); } : null; }, configurable: true
            });
            const origAEL = pc.addEventListener.bind(pc);
            pc.addEventListener = (type, h, ...r) => type === "icecandidate" && typeof h === "function" ? origAEL(type, (e) => { if (!isLocal(e?.candidate?.candidate)) h(e); }, ...r) : origAEL(type, h, ...r);
            const origSLD = pc.setLocalDescription.bind(pc);
            pc.setLocalDescription = (desc) => {
                if (desc?.sdp) desc = { ...desc, sdp: desc.sdp.split("\n").filter(l => !((l.startsWith("a=candidate") || l.startsWith("c=IN")) && isLocal(l))).join("\n") };
                return origSLD(desc);
            };
            return pc;
        });
    }

    patchKeyboard() {
        const desc = Object.getOwnPropertyDescriptor(Event.prototype, "timeStamp");
        if (desc?.get) {
            const s = this.tools.session;
            this.tools.patcher.patchDescriptor(Event.prototype, "timeStamp", {
                get() {
                    const val = desc.get.call(this);
                    if (!(this instanceof KeyboardEvent)) return val;
                    const exemptKeys = ["Enter", "Backspace", "Tab", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Control", "Alt"];
                    if (exemptKeys.includes(this.key)) return val;
                    return val + s.keyboardNoise;
                }
            });
        }
    }

    patchFileOperations(cfg) {
        const shouldRandomize = cfg.randomizeFileName;
        const shouldStripMetadata = cfg.stripMetadata;

        if (!shouldRandomize && !shouldStripMetadata) return;

        const generateRandomName = (ext) => {
            return `MDB_${Math.random().toString(36).substring(2, 10)}${ext ? '.' + ext : ''}`;
        };

        // Patch Discord's _sendMessage to intercept file uploads
        const w = BdApi.Webpack;
        const sendMessageModule = w.getByKeys("_sendMessage");

        if (sendMessageModule) {
            this.tools.patcher.patchNative(sendMessageModule, "_sendMessage", (orig) => function(...args) {
                if (args[2]?.attachmentsToUpload?.length > 0) {
                    for (const file of args[2].attachmentsToUpload) {
                        if (shouldRandomize && file.filename) {
                            const ext = file.filename.split('.').pop();
                            file.filename = generateRandomName(ext);
                        }
                    }
                }
                return orig.apply(this, args);
            });
        }

        // Also patch fetch for FormData-based uploads (fallback for other scenarios)
        this.tools.patcher.patchNative(window, "fetch", (orig) => async function (input, init = {}) {
            if (init.body instanceof FormData) {
                const formData = init.body;
                const entries = await Promise.all(
                    Array.from(formData).map(async ([key, value]) => {
                        if (value instanceof File) {
                            let processedFile = value;

                            if (shouldStripMetadata) {
                                processedFile = await MetadataStripper.strip(processedFile);
                            }

                            if (shouldRandomize) {
                                const ext = processedFile.name.split('.').pop();
                                const newName = generateRandomName(ext);
                                const buffer = await processedFile.arrayBuffer();
                                processedFile = new File([buffer], newName, { type: processedFile.type });
                            }

                            return [key, processedFile];
                        }
                        return [key, value];
                    })
                );

                const newFormData = new FormData();
                entries.forEach(([key, value]) => {
                    newFormData.append(key, value);
                });
                init.body = newFormData;
            }

            return orig.call(this, input, init);
        });
    }
}

class MetadataStripper {
    static async strip(file) {
        const ext = file.name.split('.').pop().toLowerCase();

        // Images
        if (['jpg', 'jpeg'].includes(ext)) return await this.stripJpegExif(file);
        if (ext === 'png') return await this.stripPngMetadata(file);
        if (ext === 'webp') return await this.stripWebpMetadata(file);
        if (ext === 'gif') return await this.stripGifMetadata(file);
        if (['tif', 'tiff', 'raw'].includes(ext)) return await this.stripTiffExif(file);

        // Documents
        if (ext === 'pdf') return await this.stripPdfMetadata(file);
        if (ext === 'docx') return await this.stripDocxMetadata(file);
        if (ext === 'xlsx') return await this.stripXlsxMetadata(file);
        if (ext === 'pptx') return await this.stripPptxMetadata(file);

        // Video
        if (ext === 'mp4') return await this.stripMp4Metadata(file);
        if (ext === 'mov') return await this.stripMovMetadata(file);

        // Audio
        if (ext === 'mp3') return await this.stripMp3Metadata(file);
        if (ext === 'flac') return await this.stripFlacMetadata(file);
        if (ext === 'aac') return await this.stripAacMetadata(file);

        return file;
    }

    static async stripJpegExif(file) {
        if (!file.type.startsWith('image/jpeg')) return file;

        const buffer = await file.arrayBuffer();
        const view = new DataView(buffer);
        let offset = 0;

        if (view.getUint16(offset) !== 0xFFD8) return file;
        offset += 2;

        const chunks = [];
        let foundExif = false;

        while (offset < view.byteLength) {
            const marker = view.getUint16(offset);
            const length = view.getUint16(offset + 2);

            if (marker === 0xFFE1) { // APP1 (EXIF)
                foundExif = true;
                offset += length + 2;
                continue;
            }

            chunks.push(buffer.slice(offset, offset + length + 2));
            offset += length + 2;

            if (marker === 0xFFDA) { // SOS
                chunks.push(buffer.slice(offset));
                break;
            }
        }

        if (!foundExif) return file;

        const strippedBuffer = new Blob([[new Uint8Array([0xFF, 0xD8])], ...chunks], { type: 'image/jpeg' });
        return new File([strippedBuffer], file.name, { type: 'image/jpeg' });
    }

    static async stripPngMetadata(file) {
        if (!file.type.startsWith('image/png')) return file;

        const buffer = await file.arrayBuffer();
        const view = new Uint8Array(buffer);
        const chunks = [];
        let offset = 8; // PNG signature

        while (offset < view.length) {
            const length = new DataView(buffer, offset, 4).getUint32(0, false);
            const chunkType = String.fromCharCode(...view.slice(offset + 4, offset + 8));

            // Keep critical chunks and IHDR, remove text/metadata chunks
            if (['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB'].includes(chunkType)) {
                chunks.push(buffer.slice(offset, offset + length + 12));
            }
            offset += length + 12;
        }

        const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
        const strippedBuffer = new Blob([png, ...chunks], { type: 'image/png' });
        return new File([strippedBuffer], file.name, { type: 'image/png' });
    }

    static async stripWebpMetadata(file) {
        // WebP format is complex, return as-is for now
        return file;
    }

    static async stripGifMetadata(file) {
        if (!file.type.startsWith('image/gif')) return file;

        const buffer = await file.arrayBuffer();
        const view = new Uint8Array(buffer);

        // GIF89a signature
        if (view[0] !== 0x47 || view[1] !== 0x49 || view[2] !== 0x46) return file;

        // Keep only essential GIF structure, remove application/text extensions
        let offset = 6; // Skip signature and version
        const result = [view.slice(0, 6)]; // Copy header

        while (offset < view.length) {
            const separator = view[offset];

            if (separator === 0x21) { // Extension
                const label = view[offset + 1];
                if ([0xFF, 0xFE, 0xF9].includes(label)) { // App, Comment, Graphic Control
                    offset += 2;
                    while (offset < view.length && view[offset] !== 0) {
                        offset += view[offset] + 1;
                    }
                    offset++;
                    continue;
                }
            } else if (separator === 0x2C) { // Image data
                const blockSize = 10 + (view[offset + 8] & 0x80 ? Math.pow(2, (view[offset + 8] & 0x07) + 1) * 3 : 0);
                result.push(view.slice(offset, offset + blockSize));
                offset += blockSize;
            } else if (separator === 0x3B) { // Trailer
                result.push(new Uint8Array([0x3B]));
                break;
            }
            offset++;
        }

        const strippedBuffer = new Blob(result, { type: 'image/gif' });
        return new File([strippedBuffer], file.name, { type: 'image/gif' });
    }

    static async stripTiffExif(file) {
        // TIFF/RAW processing is complex, basic implementation
        const buffer = await file.arrayBuffer();
        const view = new DataView(buffer);
        const magic = view.getUint16(0);

        if (magic !== 0x4949 && magic !== 0x4D4D) return file; // Not TIFF
        return file; // Return as-is for now
    }

    static async stripPdfMetadata(file) {
        if (!file.type.startsWith('application/pdf')) return file;

        const buffer = await file.arrayBuffer();

        const patterns = [
            { name: 'Producer', search: '/Producer' },
            { name: 'Creator', search: '/Creator' },
            { name: 'CreationDate', search: '/CreationDate' },
            { name: 'ModDate', search: '/ModDate' }
        ];

        let modified = false;
        const result = new Uint8Array(buffer);

        patterns.forEach(pattern => {
            const searchBytes = new TextEncoder().encode(pattern.search);
            for (let i = 0; i < result.length - searchBytes.length; i++) {
                let match = true;
                for (let j = 0; j < searchBytes.length; j++) {
                    if (result[i + j] !== searchBytes[j]) { match = false; break; }
                }
                if (match) {
                    let end = i + searchBytes.length;
                    while (end < result.length && result[end] !== 10 && result[end] !== 13) end++; // LF/CR
                    for (let k = i; k < end; k++) result[k] = 0x20; // 공백으로 채우기
                    modified = true;
                    i = end;
                }
            }
        });

        if (!modified) return file;
        const blob = new Blob([result], { type: 'application/pdf' });
        return new File([blob], file.name, { type: 'application/pdf' });
    }

    static async stripDocxMetadata(file) {
        if (!file.type.includes('wordprocessingml') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return file;

        // DOCX is ZIP, would need JSZip library - return as-is
        return file;
    }

    static async stripXlsxMetadata(file) {
        if (!file.type.includes('spreadsheetml') && file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return file;

        // XLSX is ZIP, would need JSZip library - return as-is
        return file;
    }

    static async stripPptxMetadata(file) {
        if (!file.type.includes('presentationml') && file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return file;

        // PPTX is ZIP, would need JSZip library - return as-is
        return file;
    }

    static async stripMp4Metadata(file) {
        if (!file.type.startsWith('video/mp4')) return file;
        // MP4 atom parsing is complex, return as-is
        return file;
    }

    static async stripMovMetadata(file) {
        if (!file.type.startsWith('video/quicktime')) return file;
        // MOV processing is complex, return as-is
        return file;
    }

    static async stripMp3Metadata(file) {
        if (!file.type.startsWith('audio/mpeg')) return file;

        const buffer = await file.arrayBuffer();
        const view = new Uint8Array(buffer);

        // Remove ID3v2 tags at start
        let offset = 0;
        if (view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33) { // "ID3"
            const size = ((view[6] & 0x7f) << 21) | ((view[7] & 0x7f) << 14) | ((view[8] & 0x7f) << 7) | (view[9] & 0x7f);
            offset = size + 10;
        }

        // Remove ID3v1 tags at end (128 bytes)
        let end = view.length;
        if (view[view.length - 128] === 0x54 && view[view.length - 127] === 0x41 && view[view.length - 126] === 0x47) { // "TAG"
            end -= 128;
        }

        const strippedBuffer = buffer.slice(offset, end);
        const blob = new Blob([strippedBuffer], { type: 'audio/mpeg' });
        return new File([blob], file.name, { type: 'audio/mpeg' });
    }

    static async stripFlacMetadata(file) {
        if (!file.type.startsWith('audio/flac')) return file;

        const buffer = await file.arrayBuffer();
        const view = new Uint8Array(buffer);

        if (view[0] !== 0x66 || view[1] !== 0x4C || view[2] !== 0x61 || view[3] !== 0x43) return file; // Not FLAC

        let offset = 4;
        while (offset < view.length) {
            const isLast = (view[offset] & 0x80) !== 0;
            const blockType = view[offset] & 0x7F;
            const blockSize = (view[offset + 1] << 16) | (view[offset + 2] << 8) | view[offset + 3];

            // Skip metadata blocks, keep streaminfo and audio
            if (blockType === 0) { // STREAMINFO
                offset += blockSize + 4;
            } else { // Skip other metadata
                offset += blockSize + 4;
            }

            if (isLast) break;
        }

        const flacHeader = new Uint8Array([0x66, 0x4C, 0x61, 0x43]);
        const strippedBuffer = new Blob([flacHeader, view.slice(offset)], { type: 'audio/flac' });
        return new File([strippedBuffer], file.name, { type: 'audio/flac' });
    }

    static async stripAacMetadata(file) {
        if (!file.type.startsWith('audio/aac') && !file.type.startsWith('audio/mp4')) return file;
        // AAC in MP4 container, complex processing - return as-is
        return file;
    }
}

class StorageCleanupModule {
    constructor(tools) { this.tools = tools; this._interval = null; }
    
    start(cfg) {
        if (!cfg.enabled) return;

        this.nukeOnStartup(cfg);

        const trackingKeys = ["analytics_token", "deviceId", "device_id", "fingerprint", "analytics", "telemetry", "amplitude"];
        const run = async () => {
            if (cfg.cleanupLocalStorage) {
                try { for (const k of Object.keys(localStorage)) if (trackingKeys.some(t => k.toLowerCase().includes(t))) localStorage.removeItem(k); } catch (e) { }
            }
            if (cfg.cleanupIndexedDB) {
                try {
                    const dbs = await indexedDB.databases?.();
                    if (dbs) {
                        for (const dbInfo of dbs) {
                            if (!dbInfo.name?.includes("discord")) continue;
                            const db = await new Promise((resolve, reject) => { const req = indexedDB.open(dbInfo.name); req.onsuccess = () => resolve(req.result); req.onerror = reject; });
                            for (let i = 0; i < db.objectStoreNames.length; i++) {
                                const storeName = db.objectStoreNames[i];
                                if (trackingKeys.some(t => storeName.toLowerCase().includes(t))) db.transaction(storeName, "readwrite").objectStore(storeName).clear();
                            }
                            db.close();
                        }
                    }
                } catch (e) { }
            }
        };

        run();
        this._interval = setInterval(run, cfg.cleanupIntervalMs);
    }

    stop() { if (this._interval) clearInterval(this._interval); }

    nukeOnStartup(cfg) {
        if (!cfg.nukeOnStartup) return;

        try {
            const safeKeys = ["token", "tokens", "MultiAccountStore", "LoginPersistStore"];
            let nukedCount = 0;

            for (const key of Object.keys(localStorage)) {
                if (!safeKeys.some(safe => key.includes(safe))) {
                    localStorage.removeItem(key);
                    nukedCount++;
                }
            }
        } catch (e) { }
    }
}