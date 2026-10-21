# BillCheck

A simple bill and installment tracker (originally named PayBills, which is still the folder name). This is a **demo**: it has no backend and no database, and every bill is saved in the visitor's own browser (`localStorage`). The first visit loads sample bills, and **Reset demo** brings them back.

## Features
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
│   │   └── favicon.svg
│   └── js/
│       ├── main.js         Entry point: builds the page, loads data, handles clicks
│       ├── state.js        Bills + trash data, saving/loading
│       ├── render.js       Redraws the screen, switches tabs
│       ├── actions.js      Pay, unpay, delete, restore, reset
│       ├── theme.js        Dark mode
│       └── utils/          Helpers: dates, formatting, schedule, images, DOM
│
├── components/             Reusable pieces of the screen
│   ├── header.js           App name, date, Reset demo, dark mode button
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
