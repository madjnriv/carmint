// prisma/seed/taxonomy.seed.ts
import type { Prisma, PrismaClient } from "@prisma-generated";
import { parse } from "csv-parse"; // ← use csv-parse (modern fork; install if needed: bun add csv-parse)
import fs from "node:fs";   // prefer promise-based fs

type Row = {
  make: string;
  model: string;
  variant: string | undefined;
  yearStart: number;
  yearEnd: number;
};

const BATCH_SIZE = 100;

export async function seedTaxonomy(prisma: PrismaClient) {
  // ── 1. Read and parse CSV ────────────────────────────────────────────────
  const rows: Row[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream("taxonomy.csv")
      .pipe(
        parse({
          columns: true,
          trim: true,
          skip_empty_lines: true,
          cast: (value, context) => {
            if (context.header) return value;
            if (["Year_Start", "Year_End"].includes(context.column as string)) {
              return value ? Number(value) : undefined;
            }
            return value;
          },
        })
      )
      .on("data", (row: Record<string, string>) => {
        rows.push({
          make: row.Make?.trim() ?? "",
          model: row.Model?.trim() ?? "",
          variant: row.Model_Variant?.trim() || undefined,
          yearStart: Number(row.Year_Start) || new Date().getFullYear() - 20, // fallback
          yearEnd: row.Year_End ? Number(row.Year_End) : new Date().getFullYear(),
        });
      })
      .on("error", (error) => reject(error))
      .on("end", () => resolve());
  });

  if (rows.length === 0) {
    console.log("No rows found in taxonomy.csv");
    return;
  }

  console.log(`Parsed ${rows.length} rows from taxonomy.csv`);

  // ── 2. Build nested structure ────────────────────────────────────────────
  type VariantInfo = { yearStart: number; yearEnd: number };
  type ModelInfo = { [variant: string]: VariantInfo };
  type MakeInfo = { [model: string]: { variant: ModelInfo } };

  const result: { [make: string]: MakeInfo } = {};

  for (const row of rows) {
    if (!row.make || !row.model) continue;

    if (!result[row.make]) result[row.make] = {};
    if (!result[row.make][row.model]) result[row.make][row.model] = { variant: {} };

    if (row.variant) {
      result[row.make][row.model].variant[row.variant] = {
        yearStart: row.yearStart,
        yearEnd: row.yearEnd,
      };
    }
  }

  // ── 3. Seed Makes ────────────────────────────────────────────────────────
  const makePromises = Object.keys(result).map((name) =>
    prisma.make.upsert({
      where: { name },
      update: { name },
      create: {
        name,
        image: `https://vl.imgix.net/img/${name
          .replace(/\s+/g, "-")
          .toLowerCase()}-logo.png?auto=format,compress`,
      },
    })
  );

  const makes = await Promise.all(makePromises);
  console.log(`Seeded ${makes.length} makes 🌱`);

  // ── 4. Seed Models (batched) ─────────────────────────────────────────────
  const modelPromises: Array<ReturnType<typeof prisma.model.upsert>> = [];

  for (const make of makes) {
    const modelsForMake = result[make.name] ?? {};
    for (const modelName in modelsForMake) {
      modelPromises.push(
        prisma.model.upsert({
          where: {
            makeId_name: {
              makeId: make.id,
              name: modelName,
            },
          },
          update: { name: modelName },
          create: {
            name: modelName,
            image: `https://vl.imgix.net/img/${modelName
              .replace(/\s+/g, "-")
              .toLowerCase()}.png?auto=format,compress`,
            make: { connect: { id: make.id } },
          },
        })
      );
    }
  }

  await insertInBatches(modelPromises, BATCH_SIZE, async (batch) => {
    const inserted = await Promise.all(batch);
    console.log(`Seeded batch of ${inserted.length} models 🌱`);
  });

  // ── 5. Seed Variants (batched) ───────────────────────────────────────────
  const variantPromises: Array<ReturnType<typeof prisma.modelVariant.upsert>> = [];

  for (const make of makes) {
    const models = await prisma.model.findMany({
      where: { makeId: make.id },
      select: { id: true, name: true },
    });

    for (const model of models) {
      const variantsForModel = result[make.name]?.[model.name]?.variant ?? {};
      for (const [variantName, range] of Object.entries(variantsForModel)) {
        variantPromises.push(
          prisma.modelVariant.upsert({
            where: {
              modelId_name: {
                modelId: model.id,
                name: variantName,
              },
            },
            update: { name: variantName },
            create: {
              name: variantName,
              yearStart: range.yearStart,
              yearEnd: range.yearEnd,
              model: { connect: { id: model.id } },
            },
          })
        );
      }
    }
  }

  await insertInBatches(variantPromises, BATCH_SIZE, async (batch) => {
    const inserted = await Promise.all(batch);
    console.log(`Seeded batch of ${inserted.length} variants 🌱`);
  });

  console.log("Taxonomy seeding completed.");
}

// Reusable batch helper (fixed signature)
async function insertInBatches<T>(
  promises: T[],
  batchSize: number,
  processBatch: (batch: T[]) => Promise<void>
) {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    await processBatch(batch);
  }
}