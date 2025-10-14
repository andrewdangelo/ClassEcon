# ClassEcon Landing Page

A modern, responsive marketing website for ClassEcon - the classroom economy management platform.

## Features

- 🎯 **Hero Landing Page** with clear value proposition and CTAs
- 👨‍🎓 **For Students** - Feature showcase for student benefits
- 👩‍🏫 **For Teachers** - Feature showcase for teacher benefits  
- 💰 **Pricing Page** - Three-tier pricing with founding member special (50% OFF)
- 📝 **Waitlist Page** - Signup form for early access with benefits
- 📧 **Contact Page** - Contact form with multiple support channels
- 📱 **Fully Responsive** - Mobile-first design with hamburger menu
- 🎨 **Modern UI** - Tailwind CSS with gradient accents and smooth animations

## Tech Stack

- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Router 6.20** - Client-side routing
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or pnpm)
- Git

### Installation

1. **Navigate to the LandingPage directory:**
   ```bash
   cd LandingPage
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
pnpm preview
```

## Project Structure

```
LandingPage/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/       # Page components
│   │   ├── HomePage.tsx
│   │   ├── ForStudentsPage.tsx
│   │   ├── ForTeachersPage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── WaitlistPage.tsx
│   │   └── ContactPage.tsx
│   ├── App.tsx      # Main app with routing
│   ├── main.tsx     # Entry point
│   └── index.css    # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Routes

- `/` - Home page
- `/for-students` - Student features
- `/for-teachers` - Teacher features
- `/pricing` - Pricing plans
- `/waitlist` - Join waitlist
- `/contact` - Contact form

## Customization

### Colors

Edit the primary color in `tailwind.config.js`:

```js
colors: {
  primary: {
    50: '#eff6ff',
    // ... customize colors
  }
}
```

### Content

All content is in the respective page components in `src/pages/`. Update text, images, and features directly in these files.

### Contact Info

Update contact information in `src/pages/ContactPage.tsx` and `src/components/Footer.tsx`.

## Integration Notes

### Waitlist Form

The waitlist form in `WaitlistPage.tsx` currently logs to console. To integrate with a backend:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Replace with your API call
  await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  setSubmitted(true);
};
```

### Contact Form

Similar integration needed in `ContactPage.tsx` for the contact form submission.

## Deployment

### Vercel

```bash
vercel
```

### Netlify

```bash
netlify deploy --prod
```

### Other Platforms

Build the project and deploy the `dist` folder to any static hosting service.

## License

MIT

## Support

For questions or issues, contact hello@classecon.com
