# Frontend Component Development

## Description

Guidelines for building new React/TypeScript frontend components with proper light/dark mode support and other best practices to avoid costly refactoring.

## When to Use

**ONLY invoke this skill when:**
- Creating a new frontend component from scratch
- Building new pages, forms, tables, cards, or UI elements
- Adding new features that require new React components
- Implementing new designs/mockups as functional components

**DO NOT invoke for:**
- Fixing existing components
- Backend/API work
- Documentation updates
- Minor styling tweaks to existing components
- Code reviews of existing components

## Critical Requirements

### 1. Light/Dark Mode Support (MANDATORY)

**NEVER use hardcoded color values.** Always use Tailwind CSS semantic color tokens:

| Instead of | Use |
|------------|-----|
| `bg-[#201f1f]`, `bg-black`, `bg-zinc-900` | `bg-card`, `bg-muted` |
| `text-[#e5e2e1]`, `text-white` | `text-card-foreground` |
| `text-[#918fa1]`, `text-gray-400` | `text-muted-foreground` |
| `text-[#c3c0ff]` | `text-brand-primary` |
| `text-[#4fdbc8]` | `text-brand-secondary` |
| `text-[#ffb4ab]`, `text-red-400` | `text-destructive` |
| `border-[#918fa1]/30` | `border-border` |
| `bg-[#03b4a2]/20` | `bg-brand-secondary/20` |
| `rgba(26, 26, 26, 0.6)` glass cards | `bg-card border border-border` |

**For status badges/alerts:**
- Use semantic colors with dark mode variants: `bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300`
- Or use theme tokens: `bg-destructive/20 text-destructive`

### 2. Component Structure

- Use named exports: `export function ComponentName()`
- Define TypeScript interfaces for props
- Keep components focused and single-responsibility

### 3. Form Handling

- Use Inertia.js `useForm` for form state
- Use shared UI components: `Input`, `Textarea`, `Button`, `Label`
- Add proper error handling with `InputError`

### 4. Icons

- Use `lucide-react` for icons
- Import only needed icons, not the entire library

### 5. Styling Best Practices

- Prefer Tailwind utility classes over inline styles
- Use `className` for conditional classes (cn/clsx if available)
- Keep responsive design in mind (mobile-first)

## Verification Checklist

Before considering a component complete:

- [ ] No hardcoded hex colors (search for `#` in className/style)
- [ ] No `rgba()` backgrounds for cards (use `bg-card`)
- [ ] All text uses semantic color tokens
- [ ] Borders use `border-border` or `border-border/50`
- [ ] Badges use proper semantic colors
- [ ] Buttons use semantic colors
- [ ] Test in both light and dark mode

## Example: Correct vs Incorrect

### ❌ INCORRECT (Hardcoded colors)
```tsx
<div className="rounded-xl p-4 bg-[#201f1f] border border-[#918fa1]/30">
  <h2 className="text-[#e5e2e1] font-semibold">Title</h2>
  <p className="text-[#918fa1]">Description</p>
  <Badge className="bg-[#03b4a2]/20 text-[#4fdbc8]">Active</Badge>
</div>
```

### ✅ CORRECT (Semantic colors)
```tsx
<div className="rounded-xl p-4 bg-card border border-border">
  <h2 className="text-card-foreground font-semibold">Title</h2>
  <p className="text-muted-foreground">Description</p>
  <Badge className="bg-brand-secondary/20 text-brand-secondary">Active</Badge>
</div>
```

## Common Mistakes to Avoid

1. **Glass morphism with rgba()** - Use `bg-card` instead of `rgba(26, 26, 26, 0.6)`
2. **Status colors** - Use `amber` for warnings, `destructive` for errors, `brand-secondary` for success
3. **Input backgrounds** - Use `bg-muted` not `bg-[#201f1f]`
4. **Hover states** - Use `hover:bg-muted` not `hover:bg-[#2a2a2a]`

## Related Skills

- `tailwindcss-development` - For Tailwind-specific styling help
- `inertia-react-development` - For Inertia.js patterns
