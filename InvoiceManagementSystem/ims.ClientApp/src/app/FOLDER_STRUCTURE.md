# Application Folder Structure

This document explains the folder organization of the application.

## Feature-Based Organization

Each business entity/feature has its own dedicated folder containing all related components, services, models, and routing.

### Current Structure

```
src/app/
├── companies/                 # Companies domain (parent folder)
│   ├── company/              # Company feature module
│   │   ├── company-list/     # List all companies
│   │   ├── company-form/     # Create/Edit company
│   │   ├── company.service.ts    # Company API service
│   │   ├── company.module.ts     # Company feature module
│   │   └── company-routing.module.ts  # Company routes
│   │
│   └── branch/               # Branch feature module
│       ├── branch-list/      # List all branches
│       ├── branch-form/      # Create/Edit branch
│       ├── branch.service.ts     # Branch API service
│       ├── branch.module.ts      # Branch feature module
│       └── branch-routing.module.ts  # Branch routes
│
└── [other-domains]/          # Other business domains (invoices/, customers/, etc.)

```

## Adding New Features

When adding a new feature within the companies domain (e.g., Department, Team):
1. Create a new folder under `companies/` with the feature name (singular, lowercase)
2. Follow the same pattern as company and branch folders

When adding a new business domain (e.g., Invoices, Customers, Products):
1. Create a new parent folder (e.g., `invoices/`, `customers/`)
2. Create feature modules inside following the same pattern
3. Update `app.routes.ts` to include the new domain routes

Example for a new domain:
```
invoices/
  ├── invoice/
  │   ├── invoice-list/
  │   ├── invoice-form/
  │   ├── invoice.service.ts
  │   └── invoice.module.ts
  └── invoice-item/
      ├── invoice-item-list/
      └── invoice-item.service.ts
```

## Benefits

- **Domain-Driven**: Features grouped by business domain (companies, invoices, etc.)
- **Modularity**: Each feature is self-contained within its domain
- **Scalability**: Easy to add new features and domains without cluttering
- **Maintainability**: Clear organization makes code easier to find and modify
- **Team Collaboration**: Different team members can work on different domains independently
- **Lazy Loading**: Features can be lazy-loaded for better performance
- **Logical Grouping**: Related features (Company and Branch) are together
