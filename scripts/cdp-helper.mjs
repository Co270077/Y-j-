// cdp-helper.mjs — CDP interaction helper
// Usage: node scripts/cdp-helper.mjs <action> [args...]
// Actions: eval <js>, click <x> <y>, navigate <path>, screenshot, tap <x> <y>, scroll <y>

const WS_URL = process.argv[2];
const ACTION = process.argv[3];
const args = process.argv.slice(4);

const ws = new WebSocket(WS_URL);
let id = 0;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    const timeout = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 10000);
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === msgId) {
        ws.removeEventListener('message', handler);
        clearTimeout(timeout);
        resolve(data);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

async function tap(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function touchTap(x, y) {
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }]
  });
  await new Promise(r => setTimeout(r, 50));
  await send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });
}

ws.addEventListener('open', async () => {
  try {
    switch (ACTION) {
      case 'eval': {
        const r = await send('Runtime.evaluate', {
          expression: args.join(' '),
          returnByValue: true,
          awaitPromise: true
        });
        console.log(JSON.stringify(r.result?.result?.value ?? r.result, null, 2));
        break;
      }
      case 'tap': {
        const x = parseInt(args[0]), y = parseInt(args[1]);
        await touchTap(x, y);
        console.log(`Tapped at (${x}, ${y})`);
        break;
      }
      case 'click': {
        const x = parseInt(args[0]), y = parseInt(args[1]);
        await tap(x, y);
        console.log(`Clicked at (${x}, ${y})`);
        break;
      }
      case 'navigate': {
        const path = args[0] || '/';
        await send('Runtime.evaluate', {
          expression: `window.location.hash = ''; window.location.pathname = '/Y-j-${path}'`,
          returnByValue: true
        });
        console.log(`Navigated to ${path}`);
        break;
      }
      case 'scroll': {
        const y = parseInt(args[0]);
        await send('Runtime.evaluate', {
          expression: `document.querySelector('[data-scroll-container]')?.scrollTo(0, ${y}) || window.scrollTo(0, ${y})`,
          returnByValue: true
        });
        console.log(`Scrolled to y=${y}`);
        break;
      }
      case 'info': {
        const r = await send('Runtime.evaluate', {
          expression: `JSON.stringify({
            url: location.href,
            title: document.title,
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: window.devicePixelRatio,
            scrollY: window.scrollY
          })`,
          returnByValue: true
        });
        console.log(r.result?.result?.value);
        break;
      }
      default:
        console.error(`Unknown action: ${ACTION}`);
        process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  setTimeout(() => process.exit(0), 300);
});

ws.addEventListener('error', (e) => { console.error('WS error'); process.exit(1); });
