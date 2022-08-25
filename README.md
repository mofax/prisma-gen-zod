## PRISMA-GEN-ZOD

> Generate zod models from Prisma schema.

## Installation

```bash
npm install prisma-gen-zod
```

## Usage

In your prisma schema, include the custom generator:

```prisma
generator zod {
    provider = "prisma-gen-zod"
    output   = "../prisma-zod"
}
```

run `prisma generate` to generate the zod models.
