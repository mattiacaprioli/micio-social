# CLAUDE.md — Micio Social

React Native + Expo + Supabase social app for pet owners. Uses Expo Router v5 for file-based navigation.

---

## Running the App

```bash
yarn install          # Install dependencies (uses yarn 1.22.22)
npx expo start        # Start dev server
npx expo run:android  # Android emulator
npx expo run:ios      # iOS simulator (macOS only)
npx expo start --web  # Web browser
```

**Testing & Linting:**
```bash
yarn test   # Jest with watch mode (jest-expo preset)
yarn lint   # Expo linter
```

> **Note:** `metro.config.js` sets `unstable_enablePackageExports = false` to fix compatibility issues — do not remove this.

---

## Project Structure

```
app/                     # Expo Router file-based routes
  _layout.tsx            # Root layout — Auth + Theme providers
  index.tsx              # Entry route
  welcome.tsx
  login.tsx
  signUp.tsx
  (tabs)/                # Bottom tab navigator (home, explore, ecommerce, profile)
    _layout.tsx          # TabsLayout with FAB in center
    home.tsx
    explore.tsx
    ecommerce.tsx
    profile.tsx
  (main)/                # Modal stack (detail screens)
    _layout.tsx
    newPost.tsx
    postDetails.tsx
    editProfile.tsx
    search.tsx
    userProfile.tsx
    followers.tsx / followings.tsx
    notifications.tsx
    chat/                # Chat list + chat conversation
    pets/                # Pet CRUD
    ecommerce/
    settings/

components/              # Reusable UI (styled-components/native)
  ecommerce/
  chat/
  pets/

context/
  AuthContext.tsx        # user, setAuth, setUserData
  ThemeContext.tsx       # isDarkMode, toggleTheme
  RefreshContext.tsx     # pull-to-refresh trigger

services/                # Supabase API layer — one file per domain
  authService.ts
  postService.ts
  userService.ts
  chatService.ts
  notificationService.ts
  petService.ts
  imageService.ts
  followsService.ts
  ecommerceService.ts
  types.ts               # ApiResponse<T> type

hooks/
  useModal.ts            # RBSheet modal ref + helpers
  useNetworkError.ts

lib/
  supabase.ts            # Supabase client (AsyncStorage session persistence)
  i18n.js                # i18next setup (en + it)

constants/
  theme.ts               # lightTheme / darkTheme objects
  index.js               # SUPABASE_URL, SUPABASE_ANON_KEY re-exports

helpers/
  common.js              # hp(), wp(), formatTime(), stripHtmlTags()

src/types/
  index.ts               # User, Post, Comment types
  supabase.ts            # Database<> interface (full table types)
  common.ts

assets/
  icons/                 # Feather icon components
  images/
  fonts/

translations/
  en.json
  it.json
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.79 + Expo 53 (new arch enabled) |
| Router | Expo Router v5 (typed routes) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Styling | styled-components/native v6 |
| State | React Context (Auth, Theme, Refresh) + local useState |
| Rich text | react-native-pell-rich-editor + react-native-render-html |
| Bottom sheet | react-native-raw-bottom-sheet (RBSheet) |
| Image/video | expo-image-picker, expo-file-system |
| i18n | i18next + react-i18next (en/it) |
| Dates | moment.js |
| TypeScript | 5.8.3 with strict mode |

---

## Conventions

### File Naming
- **Components:** PascalCase → `PostCard.tsx`
- **Services:** camelCase → `postService.ts`
- **Hooks:** camelCase with `use` prefix → `useModal.ts`
- **Screens (Expo Router):** camelCase → `newPost.tsx`

### Absolute Imports
Configured in `tsconfig.json` with `"@/*": ["./*"]`:
```typescript
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
```

### Responsive Sizing
Always use `hp()` / `wp()` from `helpers/common.js` — never hardcode pixel values:
```typescript
import { hp, wp } from "@/helpers/common";

const Container = styled.View`
  padding: ${wp(4)}px;
  height: ${hp(6)}px;
`;
```

### Styling Pattern
All components use styled-components/native with theme from context:
```typescript
import styled from "styled-components/native";

const Card = styled.View`
  background-color: ${props => props.theme.colors.cardBg};
  border-radius: ${props => props.theme.radius.md}px;
  padding: ${wp(4)}px;
`;
```

Access theme values:
```typescript
import { useTheme as useStyledTheme } from "styled-components/native";
import { useTheme } from "@/context/ThemeContext";

const theme = useStyledTheme();        // full theme object for styles
const { isDarkMode } = useTheme();     // for conditional logic
```

### Component Props Pattern
```typescript
interface ComponentProps {
  item: DataType;
  currentUser: User | null;
  router: Router;
  onDelete?: (item: DataType) => void;
  variant?: "classic" | "edgeToEdge" | "modal";
}

const Component: React.FC<ComponentProps> = ({ item, currentUser, router, variant = "classic" }) => {
  // ...
};

export default Component;
```

---

## Service Layer Pattern

All service functions return `ApiResponse<T>` (defined in `services/types.ts`):

```typescript
import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./types";

export const createPost = async (post: CreatePostInput): Promise<ApiResponse<PostRow>> => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .upsert({ ...post })
      .select()
      .single();

    if (error) return { success: false, msg: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};
```

**Always use `try/catch` + `if (error)` check. Never throw from services — always return `{ success: false }`.**

---

## Supabase Schema Summary

### Key Tables

| Table | Key Columns |
|-------|-------------|
| `users` | `id` (UUID), `name`, `email`, `image`, `bio`, `website`, `birthday`, `gender`, `phoneNumber` |
| `posts` | `id`, `user_id`, `body` (HTML text), `file` (storage path), `category`, `pet_ids` (UUID[]) |
| `comments` | `id`, `post_id`, `user_id`, `text` |
| `postLikes` | `post_id`, `user_id` |
| `conversations` | `id`, `user1_id`, `user2_id`, `last_message_at`, `updated_at` |
| `messages` | `id`, `conversation_id`, `sender_id`, `content`, `is_read`, `is_deleted` |
| `notifications` | `id`, `sender_id`, `receiver_id`, `type`, `data` |
| `pets` | `id`, `user_id`, `name`, `breed`, `age`, `gender`, `bio`, `image`, `weight`, `birth_date`, `is_neutered`, `medical_notes` |
| `follows` | `follower_id`, `following_id` |

### Storage Buckets
- `uploads/postImages/` — post images
- `uploads/postVideos/` — post videos
- User avatars under `uploads/`

**Image URL pattern:**
```
{SUPABASE_URL}/storage/v1/object/public/uploads/{filePath}
```

### Common Query Patterns

**Select with relations:**
```typescript
const { data, error } = await supabase
  .from("posts")
  .select(`
    *,
    user:user_id(id, name, image),
    comments(count),
    postLikes(user_id)
  `)
  .eq("id", postId)
  .single();
```

**Upsert (create or update):**
```typescript
await supabase.from("posts").upsert({ id: post.id, ...fields }).select().single();
```

**Search:**
```typescript
await supabase.from("users").select("id, name, image").ilike("name", `%${query}%`).limit(20);
```

**Real-time subscriptions:**
```typescript
const subscription = supabase
  .channel(`post_${postId}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "comments",
    filter: `post_id=eq.${postId}`,
  }, (payload) => {
    // handle change
  })
  .subscribe();

// Cleanup:
return () => { supabase.removeChannel(subscription); };
```

---

## Navigation Patterns

**Always use `useRouter()` from expo-router — not React Navigation directly:**
```typescript
const router = useRouter();
router.push("/(main)/postDetails");
router.replace("/welcome");
```

**Re-fetch on screen focus:**
```typescript
import { useFocusEffect } from "expo-router";

useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [])
);
```

---

## Context / State Management

```typescript
// Auth state
const { user, setAuth, setUserData } = useAuth();

// Theme
const { isDarkMode, toggleTheme } = useTheme();

// Trigger home feed refresh from anywhere
const { triggerRefresh } = useRefresh();
```

Do **not** add Redux or Zustand — the app uses React Context intentionally.

---

## Modal Pattern (RBSheet)

Use `useModal` hook + `PrimaryModal` component:

```typescript
const { modalRef, showError, showSuccess, showConfirm } = useModal();

showError("Something went wrong", "Error Title");
showConfirm("Delete this post?", onConfirm, onCancel);

return <PrimaryModal ref={modalRef} />;
```

---

## Internationalization

Use `useTranslation` from react-i18next. Translation keys live in `translations/en.json` and `translations/it.json`. Default language is English.

```typescript
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
return <Text>{t("home.title")}</Text>;
```

---

## Environment / Config

- Supabase credentials live in `env.js` (not committed to production — use `.env` for secrets in CI)
- Re-exported via `constants/index.js`
- Theme primary color: `#FF6F3C` (orange)

---

## Things to Avoid

- Do not hardcode pixel values — always use `hp()` / `wp()`
- Do not use inline styles — use styled-components
- Do not throw errors from service functions — return `{ success: false, msg }`
- Do not add global state libraries — use React Context
- Do not use React Navigation directly — use Expo Router hooks
- Do not skip `useFocusEffect` for data that needs to refresh on screen focus
