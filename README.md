# One Panchang — Frontend PWA

React PWA for daily panchang (Telugu and English).

**Production site:** [https://www.onepanchang.com](https://www.onepanchang.com) (apex [https://onepanchang.com](https://onepanchang.com) should redirect to `www` in DNS / hosting).

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env   # optional: set VITE_API_URL
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Routes

- `/` — Today
- `/calendar` — Month view
- `/day/:date` — Day detail
- `/location` — Location settings
- `/settings` — App settings
- `/about` — About & attribution
