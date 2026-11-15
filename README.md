# BillCheck

A simple bill and installment tracker (originally named PayBills, which is still the folder name). This is a **demo**: it has no backend and no database, and every bill is saved in the visitor's own browser (`localStorage`). The first visit loads sample bills, and **Reset demo** brings them back.

## Features
- **Export / Import backup** (bottom of the page): saves all bills, with images, to a file you can keep in Files, Google Drive or email, and restores them on any device. Includes a gentle reminder if your bills haven't been backed up in 14 days.
- **Built for Android and iPhone**: asks the device to keep data permanently, refreshes to the newest version when you return after 30+ minutes, explains iPhone's separate Safari / home-screen storage, and avoids iPhone's zoom-on-tap.
- **Add app to home screen**: installs BillCheck as an app (Chrome, Edge and Android install directly; Safari shows the Share → Add to Home Screen steps). Works offline once installed.
- **Demo Mode / Empty State toggle**: Demo Mode shows sample bills; Empty State starts with no bills. Each mode saves its own bills separately.
- **+ button**: add a bill with a title, amount, due date and payment method
- **Payment method image**: upload a QR code, card photo or account screenshot
- **Installments**: split a total into 2–48 payments (monthly, every 2 weeks or weekly). The bill's card is divided into one box per payment.
- **Confirm paid**: tap a box, confirm, and optionally attach a receipt. You can undo it.
- **Next payment** shown at the top, with the due date highlighted
- **Summary** of overdue / due in 30 days / left to pay, with a "View overdue bills" list
- **Tabs**: All Bills, Next Bill, Ongoing Bills, Done Bills, and Trash (restore or delete forever)
- Works on phones, and opens in dark mode by default (the moon/sun button switches to light, and the choice is remembered)

## Folder structure
```
PayBills/
├── index.html              Page layout (header slot, tabs, panels, + button). Loads the CSS and assets/js/main.js
├── manifest.json           App name, icons and colors used when installing to the home screen
├── sw.js                   Service worker: makes the app installable and lets it open offline
│
├── config/
│   ├── settings.js         Currency, payment methods, frequencies, tabs, storage keys
│   └── demoData.js         Sample bills for the demo
│
├── assets/
│   ├── css/
│   │   ├── variables.css   Color palette + light/dark themes
│   │   ├── base.css        Reset, text, buttons, form fields
│   │   ├── layout.css      Page container, header, tabs, grid, + button
│   │   ├── components.css  Styles for each component
│   │   └── responsive.css  Phone layout
│   ├── images/
│   │   ├── favicon.svg     Browser tab icon
│   │   └── icons/          Home screen icons (PNG 192/512, Apple 180) + source app-icon.svg
│   └── js/
│       ├── main.js         Entry point: builds the page, loads data, handles clicks
│       ├── state.js        Bills + trash data, saving/loading
│       ├── render.js       Redraws the screen, switches tabs
│       ├── actions.js      Pay, unpay, delete, restore, reset
│       ├── theme.js        Dark mode
│       ├── install.js      "Add app to home screen" button and popup
│       ├── backup.js       Export / Import backup and the backup reminder
│       ├── backupStatus.js When the last backup was, and whether one is needed
│       └── utils/          Helpers: dates, formatting, schedule, images, money input, device detection, DOM
│
├── components/             Reusable pieces of the screen
│   ├── header.js           App name, date, install button, Demo/Empty toggle, Reset demo, dark mode button
│   ├── footer.js           "Saved on this device", last backup, Export / Import backup
│   ├── nextPayment.js      "Next payment" card at the top
│   ├── summary.js          Overdue / Due in 30 days / Left to pay
│   ├── billCard.js         One bill card with its installment boxes
│   ├── billGrid.js         Grid of bill cards (sorting)
│   ├── paymentRow.js       One payment row in a list
│   ├── billForm.js         "New bill" popup
│   ├── confirmDialog.js    Confirmation popup
│   ├── overdueDialog.js    "Overdue bills" popup
│   ├── imageViewer.js      Full-size image popup
│   ├── uploadField.js      Image upload box
│   └── toast.js            Bottom message with Undo
│
└── pages/                  One file per tab
    ├── allBills.js
    ├── nextBill.js
    ├── ongoingBills.js
    ├── doneBills.js
    └── trash.js
```
There is no `api/` folder because the app has no backend. If you add one later (for example, to save bills to a database), put it in `api/`; Vercel turns files there into serverless functions.

## Run locally
It is plain HTML, CSS and JavaScript modules with no build step. Because it uses JavaScript modules, open it through a local server rather than double-clicking `index.html`:

```bash
npx serve .
```

## Deploy to Vercel
**Option A, CLI** (run these inside this folder):
```bash
npx vercel login
npx vercel --prod
```
Accept the defaults. If asked about framework or build settings, choose **Other**, leave the build command empty and keep the directory as `./`. Run `npx vercel --prod` again to publish changes.

**Option B, GitHub:** push this folder to a GitHub repo, then at https://vercel.com/new import the repo, set Framework Preset to **Other**, and deploy. After that, every push redeploys automatically.

## Customize
- Currency, payment methods, installment options: `config/settings.js`
- Demo bills: `config/demoData.js`
- Colors: `assets/css/variables.css`
