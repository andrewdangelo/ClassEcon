# Quick Start: Using Multi-Language Support

## For Users

### Changing Language

1. Look for the **🌐 globe icon** in the top-right corner of the header
2. Click it to open the language menu
3. Select your language:
   - 🇺🇸 **English**
   - 🇪🇸 **Español** (Spanish)
   - 🇧🇷 **Português** (Portuguese)
   - 🇮🇹 **Italiano** (Italian)
4. The interface updates immediately!

Your language choice is saved automatically for future visits.

---

## For Developers

### Quick Usage

```tsx
// Import the hook
import { useLanguage } from "@/i18n/LanguageContext";

// Use in your component
function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### Common Translation Keys

```tsx
// Buttons
t("common.save")      // "Save"
t("common.cancel")    // "Cancel"
t("common.delete")    // "Delete"
t("common.edit")      // "Edit"

// Navigation
t("navigation.dashboard")  // "Dashboard"
t("navigation.classes")    // "Classes"
t("navigation.students")   // "Students"
t("navigation.store")      // "Store"

// Auth
t("auth.signIn")   // "Sign In"
t("auth.email")    // "Email"
t("auth.password") // "Password"
```

### Adding New Translations

1. Add to ALL language files:
   ```json
   // en.json
   { "myFeature": { "title": "My Feature" } }
   
   // es.json
   { "myFeature": { "title": "Mi Función" } }
   
   // pt.json
   { "myFeature": { "title": "Minha Funcionalidade" } }
   
   // it.json
   { "myFeature": { "title": "La Mia Funzionalità" } }
   ```

2. Use in component:
   ```tsx
   {t("myFeature.title")}
   ```

### Dynamic Values

```tsx
// Translation with variable
t("greeting", { name: "John" })

// In translation file:
{ "greeting": "Hello, {{name}}!" }
```

---

## Translation Categories

All translations are organized by feature:

- **common** - Buttons, labels, shared UI
- **auth** - Login, signup
- **navigation** - Menu items
- **dashboard** - Dashboard page
- **classes** - Class management
- **students** - Student management
- **store** - Store & shopping
- **jobs** - Jobs system
- **requests** - Payment requests
- **backpack** - Student inventory
- **activity** - Transaction history
- **fines** - Fines management
- **notifications** - Notifications
- **profile** - User profile
- **settings** - Settings
- **errors** - Error messages

---

## Files Location

```
Frontend/src/i18n/
├── config.ts                 # Configuration
├── LanguageContext.tsx       # Context provider
└── locales/
    ├── en.json              # English
    ├── es.json              # Spanish
    ├── pt.json              # Portuguese
    └── it.json              # Italian
```

---

## Testing

1. Start the app: `pnpm run dev`
2. Click the language switcher (🌐)
3. Try each language
4. Refresh - language persists ✓

---

## Full Documentation

See **INTERNATIONALIZATION_GUIDE.md** for complete documentation.

---

**Status:** ✅ Ready to use!
