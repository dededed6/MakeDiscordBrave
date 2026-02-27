# Discognito

**v1.1.0**

[English](#english) | [한국어](#korean)

---

<a name="korean"></a>
## 🛡️ 소개

Discognito는 Discord 클라이언트에서 다양한 추적 기술을 차단하고 디지털 지문을 스푸핑하여 프라이버시를 강화하는 BetterDiscord 플러그인입니다.

### ✨ 주요 기능

#### 1. 트래커 차단
- ✅ Science/Analytics 이벤트 차단
- ✅ Sentry 에러 리포트 차단
- ✅ Telemetry (성능 추적) 차단
- ✅ A/B 실험 차단
- ✅ 프로세스/게임 모니터링 차단
- ✅ 타이핑 표시 차단
- ✅ 읽음 표시 차단
- ✅ 활동 상태 차단
- ✅ WebSocket 페이로드 필터링
- ✅ 네트워크 방화벽 (Fetch/XHR Proxy)

#### 2. 안티-핑거프린팅
- 🎨 Canvas 픽셀 무작위화
- 📝 폰트 측정 및 열거 무작위화
- 🎮 WebGL 렌더러 스푸핑
- 💻 CPU/RAM 설정 스푸핑
- 🔊 오디오 컨텍스트 무작위화
- 📺 화면 해상도 스푸핑

#### 3. 식별자 스푸핑
- 🔑 네이티브 머신 ID 스푸핑
- 🖥️ DiscordNative OS 스푸핑 (Electron)
- 📱 LocalStorage/IndexedDB Device ID 스푸핑
- 📡 X-Super-Properties Fetch 헤더 스푸핑
- 🪟 window.name 제거
- 🧭 Navigator 속성 스푸핑 (Platform, Battery)
- 🌍 Locale 스푸핑
- ⏰ Timezone 스푸핑
- 🎤 미디어 디바이스 ID 무작위화
- 💾 컴퓨터 이름 스푸핑

#### 4. 보안
- 🔒 WebRTC Relay 강제 & SDP 필터 (IP 숨김)
- 📡 Beacon API 차단
- ⌨️ 키보드 타임스탬프에 노이즈 추가
- 📁 업로드 파일 이름 랜덤화
- 🖼️ 이미지 EXIF/메타데이터 제거

#### 5. 스토리지 정리
- 🧹 자동 정리 활성화
- 💾 LocalStorage 추적 키 정리
- 🗄️ IndexedDB 추적 스토어 정리
- 🕵️ 시작 시 식별성 캐시 정리

### 📦 설치 방법

1. [BetterDiscord](https://betterdiscord.app/)를 설치합니다.
2. `Discognito.plugin.js` 파일을 다운로드합니다.
3. BetterDiscord 플러그인 폴더에 파일을 넣습니다:
   - Windows: `%AppData%\BetterDiscord\plugins`
   - Mac: `~/Library/Application Support/BetterDiscord/plugins`
   - Linux: `~/.config/BetterDiscord/plugins`
4. Discord를 재시작하거나 플러그인 설정에서 활성화합니다.

### ⚙️ 사용 방법

1. Discord 설정 → 플러그인으로 이동
2. MakeDiscordBrave를 활성화
3. 플러그인 설정 버튼을 클릭하여 프리셋 선택:
   - **Basic**: 기본 추적 차단
   - **Advanced**: 고급 추적 차단 + 식별자 스푸핑
   - **Aggressive**: 모든 보호 기능 활성화
   - **Custom**: 직접 설정 커스터마이징

4. 설정 변경 후 "Apply & Restart" 버튼 클릭

### ⚠️ 주의사항

- 식별자 스푸핑(OS, 머신 ID, Device ID 등) 기능은 효과가 불확실하며, Discord의 이용약관을 위반할 수 있습니다. 이 기능을 사용할 경우 **계정 제한 또는 정지**를 받을 수 있으니 **권장하지 않습니다**. 대신 추적 차단(Block Tracker) 기능만 사용하길 권장합니다.
- 플러그인 사용은 자기 책임입니다.

### 📄 라이선스

MIT License

### 👤 작성자

dededed6

---

<a name="english"></a>
## 🛡️ Introduction

Discognito is a BetterDiscord plugin that enhances your privacy by blocking various tracking technologies and spoofing digital fingerprints in the Discord client.

### ✨ Features

#### 1. Block Trackers
- ✅ Block Science/Analytics Events
- ✅ Block Sentry Error Reports
- ✅ Block Telemetry (Performance)
- ✅ Block A/B Experiments
- ✅ Block Process/Game Monitoring
- ✅ Block Typing Indicator
- ✅ Block Read Receipts
- ✅ Block Activity Status
- ✅ Filter WebSocket Payloads
- ✅ Hardcore Network Drop (Fetch/XHR Proxy Firewall)

#### 2. Anti-Fingerprinting
- 🎨 Randomize Canvas Pixels
- 📝 Randomize Font Measurements & Enumerate
- 🎮 Spoof WebGL Renderer
- 💻 Spoof CPU/RAM Config
- 🔊 Randomize Audio Context
- 📺 Spoof Screen Resolution

#### 3. Identifier Spoofing
- 🔑 Spoof Native Machine ID
- 🖥️ Deep DiscordNative OS Spoofing (Electron)
- 📱 Spoof LocalStorage/IndexedDB Device ID
- 📡 Spoof X-Super-Properties Fetch Headers
- 🪟 Clear window.name
- 🧭 Spoof Navigator Properties (Platform, Battery)
- 🌍 Spoof Locale
- ⏰ Spoof Timezone
- 🎤 Randomize Media Device IDs
- 💾 Spoof Computer Name

#### 4. Security
- 🔒 Force WebRTC Relay & SDP Filter (Hide IP)
- 📡 Block Beacon API
- ⌨️ Add Noise to Keyboard Timestamps
- 📁 Randomize Uploaded File Names
- 🖼️ Strip Image EXIF/Metadata

#### 5. Storage Cleanup
- 🧹 Enable Auto-Cleanup
- 💾 Clean LocalStorage Tracking Keys
- 🗄️ Clean IndexedDB Tracking Stores
- 🕵️ Clean identifying cache on startup

### 📦 Installation

1. Install [BetterDiscord](https://betterdiscord.app/).
2. Download `Discognito.plugin.js` file.
3. Place the file in your BetterDiscord plugins folder:
   - Windows: `%AppData%\BetterDiscord\plugins`
   - Mac: `~/Library/Application Support/BetterDiscord/plugins`
   - Linux: `~/.config/BetterDiscord/plugins`
4. Restart Discord or enable it in plugin settings.

### ⚙️ Usage

1. Go to Discord Settings → Plugins
2. Enable MakeDiscordBrave
3. Click the plugin settings button and select a preset:
   - **Basic**: Basic tracking protection
   - **Advanced**: Advanced tracking blocking + identifier spoofing
   - **Aggressive**: All protection features enabled
   - **Custom**: Customize settings yourself

4. Click "Apply & Restart" after changing settings

### ⚠️ Disclaimer

- Identifier spoofing features (OS, Machine ID, Device ID, etc.) have uncertain effectiveness and may violate Discord's Terms of Service. Using these features can result in **account restriction or suspension**. We **do not recommend** using them. Instead, we recommend using only the tracking blocking (Block Tracker) features.
- Use this plugin at your own risk.

### 📄 License

MIT License

### 👤 Author

dededed6
