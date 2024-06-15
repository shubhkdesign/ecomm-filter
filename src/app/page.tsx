"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { Product as ProductType } from "@/db";
import Product from "@/components/Products/Product";
import ProductsSkeleton from "@/components/Products/ProductsSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductState } from "@/lib/validators/product-validator";

const COLOR_FILTERS = {
  id: "color",
  name: "color",
  options: [
    { value: "white", label: "White" },
    { value: "beige", label: "Beige" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "purple", label: "Purple" },
  ] as const,
};

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price Low to High", value: "price-asc" },
  { name: "Price High to Low", value: "price-dsc" },
] as const;

const SUBCATEGORIES = [
  { name: "T-shirts", selected: true, href: "#" },
  { name: "Hoodies", selected: false, href: "#" },
  { name: "Sweatshirts", selected: false, href: "#" },
  { name: "Accessories", selected: false, href: "#" },
] as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const applyArrayFilter = ({
    subcategory,
    value,
  }: {
    subcategory: keyof Omit<typeof filter, "price" | "sort">;
    value: string;
  }) => {
    const isFilterApplied = filter[subcategory].includes(value as never);
    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [subcategory]: prev[subcategory].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [subcategory]: [...prev[subcategory], value],
      }));
    }
  };

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<ProductType>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
          },
        }
      );
      return data;
    },
  });

  const [filter, setFilter] = useState<ProductState>({
    color: ["white", "blue", "beige", "green", "purple"],
    size: ["S", "M", "L"],
    sort: "none",
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
  });

  console.log(filter);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High Quality Supima Cotton
        </h1>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  className={cn("text-left w-full block px-4 py-2 text-sm", {
                    "text-gray-900 bg-gray-100": option.value === filter.sort,
                    "text-gray-500": option.value !== filter.sort,
                  })}
                  key={option.name}
                  onClick={() => {
                    // setFilter((prev) => ({ ...prev, sort: option.value }));
                  }}
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters in this div */}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUBCATEGORIES.map((subcategory) => (
                <li key={subcategory.name}>
                  <button
                    disabled={!subcategory.selected}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {subcategory.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type="multiple" className="animate-none">
              {/* COLOR FILTER */}
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-900 hover:text-gray-700">
                  <span className="font-medium font-gray-900">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          onChange={() => {
                            applyArrayFilter({
                              subcategory: "color",
                              value: option.value,
                            });
                          }}
                          checked={filter.color.includes(option.value)}
                          type="checkbox"
                          id={`color-${optionIdx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          className="ml-3 text-small text-gray-600"
                          htmlFor={`color-${optionIdx}`}
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Products in this div */}
          <div className="lg:col-span-3">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products
                ? products.map((product) => (
                    <Product key={product.id} product={product.metadata!} />
                  ))
                : new Array(12)
                    .fill(null)
                    .map((_, index) => <ProductsSkeleton key={index} />)}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
