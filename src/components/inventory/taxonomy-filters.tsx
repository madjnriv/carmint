"use client";

import { AwaitedPageProps } from "@/config/types";
import { ChangeEvent, useEffect, useState } from "react";
import { Select } from "../ui/select";
import { endpoints } from "@/config/endpoints";
import { api } from "@/lib/api-client";

interface TaxonomyFiltersProps extends AwaitedPageProps {
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

type FilterOptions<LType, VType> = Array<{
  label: LType;
  value: VType;
}>;
export const TaxonomyFilters = (props: TaxonomyFiltersProps) => {
  const { searchParams, handleChange } = props;

  const [makes, setMakes] = useState<FilterOptions<string, string>>([]);
  const [models, setModels] = useState<FilterOptions<string, string>>([]);
  const [modelVariants, setModelVariants] = useState<
    FilterOptions<string, string>
  >([]);

  useEffect(() => {
    (async function fetchMakeOptions() {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(
        searchParams as Record<string, string>,
      )) {
        if (value) params.set(key, value as string);
      }

      const url = new URL(endpoints.taxonomy, window.location.href);

      url.search = params.toString();

      const data = await api.get<{
        makes: FilterOptions<string, string>;
        models: FilterOptions<string, string>;
        modelVariants: FilterOptions<string, string>;
      }>(url.toString());

      setMakes(data.makes);
      setModels(data.models);
      setModelVariants(data.modelVariants);
    })();
  }, [searchParams]);
  return (
    <div>
      <Select
        label="Make"
        name="make"
        value={searchParams?.make as string}
        options={makes}
        onchange={handleChange}
      />
      <Select
        label="Model"
        name="model"
        value={searchParams?.model as string}
        options={models}
        onchange={handleChange}
        disabled={!models.length}
      />
      <Select
        label="Model Variant"
        name="modelVariant"
        value={searchParams?.modelVariant as string}
        options={modelVariants}
        onchange={handleChange}
        disabled={!modelVariants.length}
      />
    </div>
  );
};
