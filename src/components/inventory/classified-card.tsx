"use client";

import { routes } from "@/config/route";
import { ClassifiedWithImages, MultiStepFormEnum } from "@/config/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Cog, Fuel, GaugeCircle, Paintbrush2 } from "lucide-react";
import {
  formatColour,
  formatFuelType,
  formatNumber,
  formatOdometerUnit,
  formatTransmission,
} from "@/utils/classified";
import FavouriteButton from "./favourite-button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "../ui/separator";

interface ClassifiedCardProps {
  classified: ClassifiedWithImages;
  favourites: number[];
}

const getKeyClassifiedInfo = (classified: ClassifiedWithImages) => {
  return [
    {
      id: "odoReading",
      icon: <GaugeCircle className="w-4 h-4" />,
      value: `${formatNumber(classified?.odoReading)} ${formatOdometerUnit(classified?.odoUnit)}`,
    },
    {
      id: "transmission",
      icon: <Cog className="w-4 h-4" />,
      value: classified.transmission
        ? formatTransmission(classified.transmission)
        : null,
    },
    {
      id: "fuelType",
      icon: <Fuel className="w-4 h-4" />,
      value: classified.fuelType ? formatFuelType(classified.fuelType) : null,
    },
    {
      id: "colour",
      icon: <Paintbrush2 className="w-4 h-4" />,
      value: classified.colour ? formatColour(classified.colour) : null,
    },
  ];
};

export function ClassifiedCard(props: ClassifiedCardProps) {
  const { classified, favourites } = props;

  const pathname = usePathname();
  const [isFavourite, setIsFavourite] = useState(
    favourites.includes(classified.id),
  );
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isFavourite && pathname === routes.favourites) setIsVisible(false);
  }, [isFavourite, pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className=" rounded-md shadow-none border-border">
            <CardHeader className="">
              <CardTitle className="text-primary text-base line-clamp-1 transition-colors hover:text-primary/80">
                <Link href={routes.singleClassified(classified.slug)}>
                  {classified.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 space-y-5">
              <div className="h-48 w-full relative">
                <Image
                  placeholder="blur"
                  blurDataURL={classified.images[0]?.blurHash}
                  src={classified.images[0]?.src}
                  alt={classified.images[0]?.alt}
                  className="object-cover rounded-md"
                  fill={true}
                  quality={25}
                />
              </div>
              <Separator className="bg-secondary h-[0.5px]" />
              <div className="flex items-center justify-around gap-2">
                {getKeyClassifiedInfo(classified)
                  .filter((v) => v.value)
                  .map(({ id, icon, value }) => (
                    <div
                      key={id}
                      className="flex items-center gap-1 text-sm font-medium"
                    >
                      <p>{icon}</p>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
            </CardContent>

            <CardFooter className="bg-transparent border-0 gap-3 flex items-center">
              <Button
                asChild
                className="h-10 flex-1 flex items-center justify-center col-span-4"
              >
                <Link
                  href={routes.reserve(
                    classified.slug,
                    MultiStepFormEnum.WELCOME,
                  )}
                >
                  Reserve
                </Link>
              </Button>
              <FavouriteButton
                setIsFavourite={setIsFavourite}
                isFavourite={isFavourite}
                id={classified.id}
                className="size-10"
              />
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
