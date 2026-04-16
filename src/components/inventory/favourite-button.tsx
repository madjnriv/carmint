"use client";

import { Bookmark, HeartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { endpoints } from "@/config/endpoints";

type FavouriteButtonProps = {
  isFavourite: boolean;
  setIsFavourite: (isFavourite: boolean) => void;
  id: number;
  className?: string;
  iconClassName?: string;
};

const FavouriteButton = (props: FavouriteButtonProps) => {
  const { isFavourite, setIsFavourite, id, className, iconClassName } = props;

  const router = useRouter();

  const handleFavouriteClick = async () => {
    const { ids } = await api.post<{ ids: number[] }>(endpoints.favourites, {
      json: { id },
    });

    if (ids.includes(id)) {
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }

    setTimeout(() => {
      router.refresh();
    }, 250);
  };

  return (
    <Button
      variant={"outline"}
      size={"lg"}
      className={cn(
        "rounded-full cursor-pointer",
        className,
        isFavourite && "bg-secondary",
      )}
      onClick={handleFavouriteClick}
    >
      <Bookmark
        className={cn(
          "duration-200 transition-all ease-in-out w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-6 xl:h-6 text-primary group-hover:text-primary",
          iconClassName,
          isFavourite ? "fill-primary" : "fill-none",
        )}
      />
    </Button>
  );
};

export default FavouriteButton;
