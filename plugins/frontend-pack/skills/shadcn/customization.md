# Customization & Theming

Components reference semantic CSS variable tokens. Change the variables to change every component.

## Contents

- How it works (CSS variables → Tailwind utilities → components)
- Color variables and OKLCH format
- Dark mode setup
- Changing the theme (presets, CSS variables)
- Adding custom colors (Tailwind v3 and v4)
- Border radius
- Customizing components (variants, className, wrappers)
- Checking for updates

---

## How It Works

1. CSS variables defined in `:root` (light) and `.dark` (dark mode).
2. Tailwind maps them to utilities: `bg-primary`, `text-muted-foreground`, etc.
3. Components use these utilities — changing a variable changes all components that reference it.

---

## Color Variables

Every color follows the `name` / `name-foreground` convention. The base variable is for backgrounds, `-foreground` is for text/icons on that background.

| Variable                                     | Purpose                          |
| -------------------------------------------- | -------------------------------- |
| `--background` / `--foreground`              | Page background and default text |
| `--card` / `--card-foreground`               | Card surfaces                    |
| `--primary` / `--primary-foreground`         | Primary buttons and actions      |
| `--secondary` / `--secondary-foreground`     | Secondary actions                |
| `--muted` / `--muted-foreground`             | Muted/disabled states            |
| `--accent` / `--accent-foreground`           | Hover and accent states          |
| `--destructive` / `--destructive-foreground` | Error and destructive actions    |
| `--border`                                   | Default border color             |
| `--input`                                    | Form input borders               |
| `--ring`                                     | Focus ring color                 |
| `--chart-1` through `--chart-5`              | Chart/data visualization         |
| `--sidebar-*`                                | Sidebar-specific colors          |

Colors use OKLCH: `--primary: oklch(0.205 0 0)` where values are lightness (0–1), chroma (0 = gray), and hue (0–360).

---

## Dark Mode

Class-based toggle via `.dark` on the root element. In Next.js, use `next-themes`:

```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

---

## Changing the Theme

```bash
# Apply a preset code from ui.shadcn.com.
npx shadcn@latest apply --preset a2r6bw

# Positional shorthand also works.
npx shadcn@latest apply a2r6bw

# Switch to a named preset and overwrite existing components.
npx shadcn@latest apply --preset nova

# Preserve existing components instead.
npx shadcn@latest init --preset nova --force --no-reinstall

# Use a custom theme URL.
npx shadcn@latest apply --preset "https://ui.shadcn.com/init?base=radix&style=nova&theme=blue&..."
```

Or edit CSS variables directly in `globals.css`.

---

## Custom Colors (not in Mdigital projects)

Mdigital projects use only the shadcn variables above; adding `--warning`, `--success`, `--brand` and the like is not allowed. Change the **values** of the existing variables in the file at `tailwindCssFile` instead, and map meanings onto them:

- hover: `hover:bg-primary/90`, `hover:bg-secondary/80`, ghost/outline `hover:bg-accent`; disabled: `disabled:opacity-50`;
- error: `destructive` (`aria-invalid:border-destructive aria-invalid:ring-destructive/20`);
- success / warning / info: neutral Badge `default` / `secondary` / `outline` with text, never raw palette colours;
- a truly distinct colour (charts): `chart-1..5`.

---

## Border Radius

`--radius` controls border radius globally. Components derive values from it (`rounded-lg` = `var(--radius)`, `rounded-md` = `calc(var(--radius) * 0.8)`, up to `rounded-4xl`).

When a brand spec defines its own radius scale, pin each step in `@theme inline` (`--radius-sm` … `--radius-4xl`) instead of deriving from `--radius`. See [design-system.md](./design-system.md#radius).

---

## Customizing Components

See also: [rules/styling.md](./rules/styling.md) for Incorrect/Correct examples.

Prefer these approaches in order:

### 1. Built-in variants

```tsx
<Button variant="outline" size="sm">
  Click
</Button>
```

### 2. Tailwind classes via `className`

```tsx
<Card className="mx-auto max-w-md">...</Card>
```

### 3. Add a new variant

Edit the component source to add a variant via `cva`:

```tsx
// components/ui/button.tsx — shadcn tokens only, hover = opacity
subtle: "bg-muted text-foreground hover:bg-muted/80",
```

### 4. Wrapper components

Compose shadcn/ui primitives into higher-level components:

```tsx
export function ConfirmDialog({ title, description, onConfirm, children }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## Checking for Updates

```bash
npx shadcn@latest add button --diff
```

To preview exactly what would change before updating, use `--dry-run` and `--diff`:

```bash
npx shadcn@latest add button --dry-run        # see all affected files
npx shadcn@latest add button --diff button.tsx # see the diff for a specific file
```

See [Updating Components in SKILL.md](./SKILL.md#updating-components) for the full smart merge workflow.
