---
name: storybook-patterns
description: Storybook creation pattern library. Aggregates detailed CSF 3.0, MSW, accessibility, and responsive examples referenced by StorybookCreatorAgent.
---

# Storybook Patterns

## 🏗️ Story Structure (CSF 3.0 Pattern)

### Component Story Template

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta = {
  title: "Features/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// ✅ Default state
export const Default: Story = {
  args: {
    // typical prop values
  },
};

// ✅ Interactive variant
export const Hover: Story = {
  args: { /* hover-relevant props */ },
  parameters: {
    pseudo: { hover: true },
  },
};

// ✅ Error state (if component accepts error prop)
export const WithError: Story = {
  args: {
    error: "Validation message",
  },
};

// ✅ Loading state (if component has async behavior)
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

### Page Story Template (with MSW)

```tsx
// PageName.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { PageName } from "./PageName";

const meta = {
  title: "Pages/PageName",
  component: PageName,
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.get("*/api/endpoint", () => {
          return HttpResponse.json({
            // mock response
          });
        }),
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PageName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/todos", () => {
          return HttpResponse.json([
            { id: 1, title: "Task 1", completed: false },
          ]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/todos", () => {
          return HttpResponse.json(
            { error: "Server error" },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/todos", () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
```

## 📖 Story Variant Checklist

For every component, generate these variants when applicable:

### All Components

- [ ] **Default** — Typical usage with most common props
- [ ] **Focus** — Interactive element with `focus-visible` active (use `pseudo: { focus: true }`)
- [ ] **Hover** — Button/link in hover state (use `pseudo: { hover: true }`)

### Form Components

- [ ] **Default** — Empty state
- [ ] **Filled** — With user input
- [ ] **Error** — With validation error message
- [ ] **Disabled** — Disabled state
- [ ] **Loading** — Async submission in progress

### Data Display Components

- [ ] **Default** — With typical data
- [ ] **Empty** — No data available
- [ ] **Loading** — Data fetching in progress
- [ ] **Error** — Failed to fetch data

### Page-Level Components

- [ ] **Default** — Happy path with data
- [ ] **Empty** — No data available
- [ ] **Loading** — Initial data load
- [ ] **Error** — API error response
- [ ] **Mobile** — Responsive layout (show sm breakpoint)
- [ ] **Tablet** — Responsive layout (show md breakpoint)

### Interactive Components

- [ ] **Default** — Initial closed/inactive state
- [ ] **Active** — Expanded/opened state
- [ ] **Disabled** — Disabled state
- [ ] **Keyboard Focus** — Focus visible state
- [ ] **Error** — Error state if applicable

## 🌐 Responsive Stories

Show how components adapt to different screen sizes:

```tsx
// Responsive story example
export const Mobile: Story = {
  args: { /* props */ },
  parameters: {
    viewport: {
      defaultViewport: "iphone12",
    },
  },
};

export const Tablet: Story = {
  args: { /* props */ },
  parameters: {
    viewport: {
      defaultViewport: "ipad",
    },
  },
};
```

## ♿ Accessibility Stories

Create stories that test keyboard navigation and screen reader usage:

```tsx
// Accessibility-focused story
export const KeyboardNavigation: Story = {
  args: { /* props */ },
  render: (args) => (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Use Tab to navigate. Press Enter or Space to interact.
      </p>
      <ComponentName {...args} />
    </div>
  ),
};

// Focus visible testing
export const FocusVisible: Story = {
  args: { /* props */ },
  parameters: {
    pseudo: { focus: true },
  },
};
```

## 🔌 MSW Integration

### Example: Component with API call

```tsx
// UserProfile.stories.tsx
import { http, HttpResponse } from "msw";

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/users/:id", ({ params }) => {
          return HttpResponse.json({
            id: params.id,
            name: "John Doe",
            email: "john@example.com",
            avatar: "https://via.placeholder.com/150",
          });
        }),
      ],
    },
  },
};

export const ApiError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/users/:id", () => {
          return HttpResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }),
      ],
    },
  },
};

export const NetworkTimeout: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/users/:id", async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Timeout
          return HttpResponse.json({});
        }),
      ],
    },
  },
};
```

## 🎨 Tailwind-Specific Stories

When components use Tailwind responsive utilities:

```tsx
// Example: Component with responsive classes
export const ResponsiveLayout: Story = {
  render: (args) => (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-4">
        Resize viewport to see responsive behavior
      </p>
      <ComponentName {...args} />
    </div>
  ),
};
```
