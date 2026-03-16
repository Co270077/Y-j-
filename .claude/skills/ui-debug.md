---
name: ui-debug
description: Launch mobile Chrome emulator and capture screenshots for visual UI debugging
user_invocable: true
---

# UI Debug

Launch the app in a real Chrome window with iPhone 14 Pro emulation and capture screenshots for visual debugging.

## Launch

Run the single launch script — it handles everything (dev server, Chrome, CDP emulation, screenshot):

```bash
./scripts/ui-debug-launch.sh
```

This is idempotent — safe to run repeatedly. It will:
1. Start the Vite dev server on port 2222 if not running
2. Launch a dedicated Chrome instance with CDP (port 9222) if not running
3. Apply iPhone 14 Pro emulation every time (393x852, 3x DPR, mobile UA, touch)
4. Bypass self-signed cert warnings
5. Position the window and take an initial screenshot

Then read the screenshot:
```bash
# Read /tmp/ui-debug-screenshot.png with the Read tool
```

## Take more screenshots

```bash
./scripts/ui-screenshot.sh /tmp/ui-debug-screenshot.png
```

## Navigate or interact via CDP

```bash
TARGET_WS=$(curl -s http://localhost:9222/json | node -e "
const c=[]; process.stdin.on('data',d=>c.push(d));
process.stdin.on('end',()=>{const t=JSON.parse(c.join(''));
const p=t.find(x=>x.type==='page');if(p)console.log(p.webSocketDebuggerUrl);});
")

node -e "
const ws = new WebSocket('$TARGET_WS');
let id=0;
function send(m,p={}){return new Promise(r=>{const i=++id;
const h=e=>{const d=JSON.parse(e.data);if(d.id===i){ws.removeEventListener('message',h);r(d);}};
ws.addEventListener('message',h);ws.send(JSON.stringify({id:i,method:m,params:p}));});}
ws.addEventListener('open', async()=>{
  // Examples:
  // Navigate: await send('Page.navigate', {url: 'https://localhost:2222/Y-j-/schedule'});
  // Scroll:   await send('Runtime.evaluate', {expression: 'window.scrollTo(0, 500)'});
  // Click:    await send('Input.dispatchMouseEvent', {type:'mousePressed', x:200, y:400, button:'left', clickCount:1});
  // Get title: const r = await send('Runtime.evaluate', {expression: 'document.title'}); console.log(r.result);
  process.exit(0);
});
"
```

## Debug loop
1. Screenshot -> identify issue -> fix code -> Vite HMR auto-refreshes -> screenshot to verify
2. Compare against user's phone screenshots when provided
