import ClassifiedList from "@/components/inventory/classified-list";
import { Sidebar } from "@/components/inventory/sidebar";
import { PaginationBtns } from "@/components/shared/pagination-btns";
import { CLASSIFIEDS_PER_PAGE } from "@/config/constants";
import { routes } from "@/config/route";
import { AwaitedPageProps, Favourites, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import z from "zod";

const pageSchema = z
  .string()
  .transform((val) => Math.max(Number(val), 1))
  .optional();

const getInventory = async (searchParams: AwaitedPageProps["searchParams"]) => {
  const validPage = pageSchema.parse(searchParams?.page);
  const page = validPage ? validPage : 1;

  const offset = (page - 1) * CLASSIFIEDS_PER_PAGE;
  return prisma.classified.findMany({
    include: { images: { take: 1 } },
    where: {},
    skip: offset,
    take: CLASSIFIEDS_PER_PAGE,
  });
};

export default async function InventoryPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const classifieds = await getInventory(searchParams);
  const count = await prisma.classified.count({
    where: {},
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
