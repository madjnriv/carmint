"use client";

import { AwaitedPageProps } from "@/config/types";
import { ChangeEvent, useState } from "react";
import { Select } from "../ui/select";

interface TaxonomyFiltersProps extends AwaitedPageProps {
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

type FilterOptions<LType, VType> = Array<{
  label: LType;
  value: VType;
}>;
export const TaxonomyFilters = (props: TaxonomyFiltersProps) => {
  const { searchParams, ...rest } = props;

  const [makes, setMakes] = useState<FilterOptions<string, string>>([]);
  const [models, setModels] = useState<FilterOptions<string, string>>([]);
  const [modelVariants, setModelVariants] = useState<
    FilterOptions<string, string>
  >([]);

  return (
    <div>
      <Select
        label="model"
        name="make"
        value={searchParams?.make as string}
        options={[]}
        onchange={() => null}
      />
      <Select
        label="Model"
        name="model"
        value={searchParams?.model as string}
        options={[]}
        onchange={() => null}
        disabled={false}
      />
      <Select
        label="Model Variant"
        name="modelVariant"
        value={searchParams?.modelVariant as string}
        options={[]}
        onchange={() => null}
        disabled={false}
      />
    </div>
  );
};
