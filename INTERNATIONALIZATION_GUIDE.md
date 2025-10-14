# Internationalization (i18n) Guide

## Overview

ClassEcon now supports multiple languages to make the platform accessible to educators and students worldwide. The application uses `react-i18next` for internationalization, providing a robust and flexible translation system.

## Supported Languages

- 🇺🇸 **English (en)** - Default
- 🇪🇸 **Español (es)** - Spanish
- 🇧🇷 **Português (pt)** - Portuguese (Brazilian)
- 🇮🇹 **Italiano (it)** - Italian

## Features

### 1. Automatic Language Detection
The system automatically detects the user's preferred language from:
- Browser settings
- Previously saved preference (localStorage)
- HTML language tag

### 2. Manual Language Switching
Users can change the language at any time using the language switcher in the header:
- Click the globe icon (🌐)
- Select your preferred language
- The interface updates immediately
- Your choice is saved for future sessions

### 3. Persistent Preferences
Language preferences are stored in localStorage, so users don't need to select their language every time they visit.

## For Developers

### File Structure

```
Frontend/src/i18n/
├── config.ts                 # i18n configuration
├── LanguageContext.tsx       # React context for language management
├── locales/
│   ├── en.json              # English translations
│   ├── es.json              # Spanish translations
│   ├── pt.json              # Portuguese translations
│   └── it.json              # Italian translations
```

### Using Translations in Components

There are several ways to use translations in your components:

#### Method 1: Using the `useLanguage` hook

```tsx
import { useLanguage } from "@/i18n/LanguageContext";

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.overview")}</p>
    </div>
  );
}
```

#### Method 2: Using the `useI18n` hook

```tsx
import { useI18n } from "@/hooks/useI18n";

function MyComponent() {
  const { t, language } = useI18n();
  
  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>Current language: {language}</p>
    </div>
  );
}
```

#### Method 3: Using `useTranslation` directly

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  
  return <button>{t("common.save")}</button>;
}
```

### Translation Keys Structure

Translations are organized by feature/section:

```json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "signIn": "Sign In",
    "email": "Email"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "classes": "Classes"
  },
  "dashboard": {
    "title": "Dashboard",
    "overview": "Overview"
  }
}
```

### Adding New Translations

To add a new translatable string:

1. **Add the key to all language files:**

   ```json
   // en.json
   {
     "myFeature": {
       "newKey": "New English Text"
     }
   }
   
   // es.json
   {
     "myFeature": {
       "newKey": "Nuevo Texto en Español"
     }
   }
   
   // pt.json
   {
     "myFeature": {
       "newKey": "Novo Texto em Português"
     }
   }
   
   // it.json
   {
     "myFeature": {
       "newKey": "Nuovo Testo in Italiano"
     }
   }
   ```

2. **Use it in your component:**

   ```tsx
   const { t } = useLanguage();
   return <div>{t("myFeature.newKey")}</div>;
   ```

### Interpolation (Dynamic Values)

You can pass dynamic values to translations:

```tsx
// Translation file
{
  "greeting": "Hello, {{name}}!",
  "balance": "Your balance is {{amount}}"
}

// Component
const { t } = useLanguage();
return (
  <>
    <p>{t("greeting", { name: "John" })}</p>
    <p>{t("balance", { amount: "$100" })}</p>
  </>
);
```

### Pluralization

i18next supports pluralization:

```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

```tsx
<p>{t("items", { count: 1 })}</p>  // "1 item"
<p>{t("items", { count: 5 })}</p>  // "5 items"
```

### Adding a New Language

To add support for a new language:

1. **Create a new translation file:**
   - Create `Frontend/src/i18n/locales/[language-code].json`
   - Copy the structure from `en.json`
   - Translate all keys

2. **Update the configuration:**

   ```typescript
   // Frontend/src/i18n/config.ts
   import newLang from "./locales/[language-code].json";

   export const languages = {
     // ... existing languages
     [code]: { name: "Language Name", flag: "🏳️" },
   };

   const resources = {
     // ... existing resources
     [code]: { translation: newLang },
   };
   ```

3. **Test the new language:**
   - Run the app
   - Switch to the new language using the language switcher
   - Verify all text appears correctly

## Best Practices

### 1. Always Use Translation Keys

❌ **Don't hardcode text:**
```tsx
<button>Save</button>
```

✅ **Use translation keys:**
```tsx
<button>{t("common.save")}</button>
```

### 2. Organize Keys Logically

Group related translations together:
```json
{
  "store": {
    "title": "Store",
    "addToCart": "Add to Cart",
    "checkout": "Checkout"
  }
}
```

### 3. Keep Keys Consistent

Use the same naming pattern across all language files.

### 4. Provide Context

For ambiguous terms, add context to the key:
```json
{
  "close_button": "Close",
  "close_proximity": "Near"
}
```

### 5. Test All Languages

Before deploying, test the UI in all supported languages to ensure:
- All text is translated
- UI elements don't overflow or break
- Formatting is correct

### 6. Use Descriptive Keys

❌ Bad:
```json
{ "text1": "Hello" }
```

✅ Good:
```json
{ "greeting.hello": "Hello" }
```

## Currency Formatting

Each language has its own currency symbol:
- English: $ (Dollar)
- Spanish: $ (Dollar)
- Portuguese: R$ (Real)
- Italian: € (Euro)

Use the currency formatting from translations:
```tsx
const { t } = useLanguage();
const formattedAmount = t("currency.format", { amount: `${t("currency.symbol")}100` });
```

## Common Translation Sections

### Available Sections

- `common` - Shared UI elements (buttons, labels, etc.)
- `auth` - Authentication (login, signup)
- `navigation` - Menu and navigation items
- `dashboard` - Dashboard page
- `classes` - Classes management
- `students` - Student management
- `store` - Store and shopping
- `jobs` - Jobs system
- `requests` - Request management
- `backpack` - Student backpack
- `activity` - Activity/transactions
- `fines` - Fines management
- `notifications` - Notifications
- `profile` - User profile
- `settings` - Settings page
- `onboarding` - Onboarding flow
- `errors` - Error messages

## Testing i18n

### Manual Testing

1. **Language Switching:**
   - Start the app
   - Click the language switcher (🌐 icon)
   - Switch between languages
   - Verify all text changes

2. **Persistence:**
   - Switch to a non-default language
   - Refresh the page
   - Verify the language persists

3. **Browser Detection:**
   - Clear localStorage
   - Change browser language settings
   - Reload the app
   - Verify correct language is detected

### Automated Testing

```tsx
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";

test("renders translated text", () => {
  render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  );
  
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Translation not showing

**Possible causes:**
1. Key doesn't exist in translation file
2. Typo in the key name
3. Language file not imported in config

**Solution:**
- Check the browser console for missing key warnings
- Verify the key exists in all language files
- Ensure proper import in `config.ts`

### Issue: Language not persisting

**Possible cause:** LocalStorage not working

**Solution:**
- Check browser privacy settings
- Ensure localStorage is not disabled
- Check for errors in browser console

### Issue: New language not appearing

**Possible causes:**
1. Language not added to `config.ts`
2. Missing import
3. Invalid language code

**Solution:**
- Verify language is added to both `languages` object and `resources` object
- Check import statement
- Use valid ISO language codes (en, es, pt, it, etc.)

## Contributing Translations

We welcome contributions to improve translations or add new languages!

### To contribute:

1. Fork the repository
2. Create/update translation files in `Frontend/src/i18n/locales/`
3. Test your translations thoroughly
4. Submit a pull request

### Translation guidelines:

- Keep translations concise and clear
- Maintain consistent terminology
- Consider cultural context
- Preserve formatting placeholders ({{variable}})
- Test in the actual UI to ensure proper fit

## Additional Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Detection Plugin](https://github.com/i18next/i18next-browser-languageDetector)

## Support

If you encounter issues with translations or need help implementing i18n in a new component:

1. Check this guide first
2. Review existing component examples
3. Check the browser console for errors
4. Consult the react-i18next documentation
5. Open an issue on GitHub

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0
