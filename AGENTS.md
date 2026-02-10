# AGENTS.md - Rentaloop Platform Development Guide

This file provides essential information for AI agents working on the Rentaloop C2C rental platform codebase.

## Project Overview

Rentaloop is a Consumer-to-Consumer rental platform for high-value, low-frequency items (photography equipment, camping gear, home appliances). Built with Next.js 16.1.1, TypeScript, and PostgreSQL.

## Development Commands

### Core Commands
```bash
# Development (run from root)
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database operations (run from rentaloop-next/)
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle database studio
npm run db:generate      # Generate database migrations
```

### Testing
Currently no testing framework is configured. When adding tests:
- Use Jest for unit/integration tests
- Use Playwright for E2E tests
- Run individual tests with `npm test -- --testNamePattern="test_name"`

## Code Style Guidelines

### TypeScript & React
- **Strict TypeScript** mode enabled
- Use **type assertions** sparingly; prefer proper typing
- **Server Actions** for backend logic in `src/app/actions/`
- **Client components** marked with `"use client"`
- **Path aliases**: `@/*` maps to `./src/*`

### Import Organization
```typescript
// 1. React/Next.js imports
import { useState } from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { zod } from 'zod';
import { toast } from 'react-hot-toast';

// 3. Internal imports (use path aliases)
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
```

### Component Structure
- **Server Components** by default (no "use client")
- **Client Components** only when interactivity is needed
- **Co-located types** with components
- **Feature-based organization** in `src/components/`

### Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard`, `MemberProfile`)
- **Functions**: camelCase (e.g., `createRental`, `validateUser`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RENTAL_DAYS`)
- **Database tables**: snake_case (e.g., `rental_items`, `user_profiles`)

### Styling Guidelines
- **Tailwind CSS v4** for all styling
- **CSS custom properties** for design system colors
- **Responsive design** mobile-first approach
- **Component variants** using utility classes

### Database Patterns
- **Drizzle ORM** for all database operations
- **Schema-first** approach in `src/lib/schema.ts`
- **Transactions** for multi-table operations
- **Zod validation** for all inputs

## Architecture Patterns

### Authentication & Authorization
- **NextAuth v5** with Google OAuth
- **Role-based access control**: `basic`, `verified`, `admin`
- **KYC verification** system for enhanced privileges
- **Middleware protection** for sensitive routes

### Business Logic
- **Rental state machine** with status transitions
- **Multi-level categories** (L1 > L2 > L3)
- **Content filtering** for Q&A to prevent contact sharing
- **Review system** with ratings

### File Organization
```
src/
├── app/                 # Next.js App Router
│   ├── actions/         # Server Actions
│   ├── api/             # API routes
│   └── [routes]/        # Page components
├── components/          # Reusable components
│   ├── ui/              # Base UI components
│   ├── admin/           # Admin-specific components
│   └── [features]/      # Feature components
├── lib/                 # Utilities and configurations
│   ├── db.ts            # Database connection
│   ├── schema.ts        # Database schema
│   └── utils.ts         # Helper functions
└── types/               # Global type definitions
```

## Error Handling

### Server Actions
```typescript
'use server';

export async function createRental(data: RentalSchema) {
  try {
    // Validate input
    const validated = RentalSchema.parse(data);
    
    // Database operation
    const result = await db.insert(rentals).values(validated);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Rental creation failed:', error);
    return { success: false, error: 'Failed to create rental' };
  }
}
```

### Client Components
```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  try {
    setError(null);
    await createRental(formData);
    toast.success('Rental created successfully');
  } catch (err) {
    setError('Failed to create rental');
    toast.error('Please try again');
  }
};
```

## Security Best Practices

- **Input validation** with Zod schemas
- **SQL injection prevention** via Drizzle ORM
- **XSS protection** through React auto-escaping
- **Content Security Policy** headers
- **Rate limiting** for API endpoints
- **Role-based access** for sensitive operations

## Performance Guidelines

- **Server Components** for data fetching
- **Next.js Image** for optimized images
- **Incremental builds** with TypeScript
- **Database indexing** for query performance
- **Caching strategies** for static content

## Common Patterns

### Form Handling
```typescript
// Server Action validation
const FormSchema = z.object({
  title: z.string().min(1).max(100),
  price: z.number().min(0),
});

// Client form with React Hook Form
import { useForm } from 'react-hook-form';
```

### Data Fetching
```typescript
// Server Component
async function getProducts() {
  return await db.query.products.findMany({
    with: { category: true, owner: true }
  });
}
```

### API Routes
```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  // Authentication check
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' });
  
  // Data fetching
  const products = await getProducts();
  return NextResponse.json(products);
}
```

## Development Workflow

1. **Environment Setup**: Use `.env.local` for local variables
2. **Database Changes**: Update schema, then run `npm run db:push`
3. **Code Quality**: Run `npm run lint` before commits
4. **Testing**: Add tests for new features (framework to be determined)
5. **Deployment**: Railway or nixpacks configuration available

## Business Context

### Core Flows
1. **User Registration** → KYC verification → Enhanced privileges
2. **Item Listing** → Category classification → Publication
3. **Rental Booking** → Payment → Item exchange → Return
4. **Review Process** → Rating system → Trust building

### Admin Features
- **Member management** with KYC approval workflow
- **Item moderation** and category management
- **Content management** for banners and promotional materials
- **Email template** customization

### Legal Framework
- **Service terms** and privacy policies implemented
- **Rental contracts** with liability clauses
- **Dispute resolution** processes documented

## Key Dependencies

- **Next.js 16.1.1** - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Drizzle ORM** - Database ORM
- **NextAuth v5** - Authentication
- **Zod** - Schema validation
- **React Hot Toast** - Notifications
- **Cloudinary** - Image management
- **Resend** - Email services

## Notes for Agents

- This is a **monorepo** with the main app in `rentaloop-next/`
- **Server Actions** are preferred over API routes for form submissions
- **Role-based access** is strictly enforced
- **KYC verification** is required for certain privileges
- **Content filtering** prevents contact information exchange in Q&A
- **Multi-language support** (Chinese) is partially implemented
- **Mobile responsiveness** is required for all components