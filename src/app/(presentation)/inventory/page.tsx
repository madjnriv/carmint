import ClassifiedList from "@/components/inventory/classified-list";
import { Sidebar } from "@/components/inventory/sidebar";
import { PaginationBtns } from "@/components/shared/pagination-btns";
import { CLASSIFIEDS_PER_PAGE } from "@/config/constants";
import { routes } from "@/config/route";
import { AwaitedPageProps, Favourites, PageProps } from "@/config/types";
import { ClassifiedStatus, Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import z from "zod";

const pageSchema = z
  .string()
  .transform((val) => Math.max(Number(val), 1))
  .optional();

const classifiedFilterSchema = z.object({
  searchQuery: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  modelVariant: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minReading: z.string().optional(),
  maxReading: z.string().optional(),
  currency: z.string().optional(),
  odoUnit: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  bodyType: z.string().optional(),
  color: z.string().optional(),
  doors: z.string().optional(),
  seats: z.string().optional(),
  ulezCompliance: z.string().optional(),
});

const buildClassifiedFilterQuery = (
  searchParams: AwaitedPageProps["searchParams"] | undefined,
): Prisma.ClassifiedWhereInput => {
  const { data } = classifiedFilterSchema.safeParse(searchParams);

  if (!data) return { status: ClassifiedStatus.LIVE };

  const keys = Object.keys(data);

  const taxonomyFilters = ["make", "model", "modelVariant"];

  const mapParamsToFields = keys.reduce(
    (acc, key) => {
      const value = searchParams?.[key] as string | undefined;

      if (!value) return acc;

      if (taxonomyFilters.includes(key)) {
        acc[key] = { id: Number(value) };
      }

      return acc;
    },
    {} as { [key: string]: any },
  );

  return {
    status: ClassifiedStatus.LIVE,

    ...(searchParams?.searchQuery && {
      OR: [
        {
          title: {
            contains: searchParams.searchQuery as string,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchParams.searchQuery as string,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...mapParamsToFields,
  };
};

const getInventory = async (searchParams: AwaitedPageProps["searchParams"]) => {
  const validPage = pageSchema.parse(searchParams?.page);
  const page = validPage ? validPage : 1;

  const offset = (page - 1) * CLASSIFIEDS_PER_PAGE;

  return prisma.classified.findMany({
    include: { images: { take: 1 } },
    where: buildClassifiedFilterQuery(searchParams),
    skip: offset,
    take: CLASSIFIEDS_PER_PAGE,
  });
};

export default async function InventoryPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const classifieds = await getInventory(searchParams);
  const count = await prisma.classified.count({
    where: buildClassifiedFilterQuery(searchParams),
  });

  const sourceId = await getSourceId();
  const favourites = await redis.get<Favourites>(sourceId ?? "");
  const totalPages = Math.ceil(count / CLASSIFIEDS_PER_PAGE);

  console.log(favourites);

  return (
    <div className="flex">
      <Sidebar minMaxValues={null} searchParams={searchParams} />

      <div className="flex-1 p-4 bg-primary-foreground">
        <div className="flex space-y-2 flex-col items-center justify-center pb-4 -mt-1">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sm md:text-base lg:text-xl font-semibold min-w-fit">
              We have found {count} classifieds for you
            </h2>
            {/* <DialogFilter/> */}
          </div>
          <PaginationBtns
            baseURL={routes.inventory}
            totalPages={totalPages}
            styles={{
              root: " justify-end",
              previous: "",
              next: " ",
              link: "border-none active:border",
              activeLink: "",
            }}
          />
          <ClassifiedList
            classifieds={classifieds}
            favourites={favourites ? favourites.ids : []}
          />
        </div>
      </div>
    </div>
  );
}
