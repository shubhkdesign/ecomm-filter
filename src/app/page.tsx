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
import { useCallback, useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import debounce from "lodash.debounce";
import EmptyState from "@/components/Products/EmptyState";

const SIZE_FILTERS = {
  id: "size",
  name: "size",
  options: [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
  ],
} as const;

const PRICE_FILTERS = {
  id: "price",
  name: "price",
  options: [
    { value: [0, 100], label: "Any price" },
    { value: [0, 20], label: "Under 20" },
    { value: [0, 40], label: "Under 40" },
  ],
} as const;

const COLOR_FILTERS = {
  id: "color",
  name: "color",
  options: [
    { value: "white", label: "White" },
    { value: "beige", label: "Beige" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "purple", label: "Purple" },
  ],
} as const;

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price Low to High", value: "price-asc" },
  { name: "Price High to Low", value: "price-desc" },
] as const;

const SUBCATEGORIES = [
  { name: "T-shirts", selected: true, href: "#" },
  { name: "Hoodies", selected: false, href: "#" },
  { name: "Sweatshirts", selected: false, href: "#" },
  { name: "Accessories", selected: false, href: "#" },
] as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ["white", "blue", "beige", "green", "purple"],
    size: ["S", "M", "L"],
    sort: "none",
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
  });

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<ProductType>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            size: filter.size,
            price: filter.price.range,
          },
        }
      );
      return data;
    },
  });

  const onSubmit = () => refetch();

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
    _debounceSubmit();
  };
  const debounceSubmit = debounce(onSubmit, 400);
  const _debounceSubmit = useCallback(debounceSubmit, []);

  const minFilterCustom = Math.min(
    filter.price.range[0],
    filter.price.range[1]
  );
  const maxFilterCustom = Math.max(
    filter.price.range[0],
    filter.price.range[1]
  );

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
                    setFilter((prev) => ({ ...prev, sort: option.value }));
                    _debounceSubmit();
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
            {/* COLOR FILTER ACCORDIAN */}
            <Accordion type="multiple" className="animate-none">
              {/* COLOR FILTER ACCORDION ITEM*/}
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

              {/* SIZE FILTER ACCORDION ITEM */}
              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-sm text-gray-900 hover:text-gray-700">
                  <span className="font-medium font-gray-900">Size</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          onChange={() => {
                            applyArrayFilter({
                              subcategory: "size",
                              value: option.value,
                            });
                          }}
                          checked={filter.size.includes(option.value)}
                          type="checkbox"
                          id={`size-${optionIdx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          className="ml-3 text-small text-gray-600"
                          htmlFor={`size-${optionIdx}`}
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* PRICE FILTER ACCORDION ITEM */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-900 hover:text-gray-700">
                  <span className="font-medium font-gray-900">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((option, optionIdx) => (
                      <li key={option.label} className="flex items-center">
                        <input
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));
                            _debounceSubmit();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                          type="radio"
                          id={`price-${optionIdx}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          className="ml-3 text-small text-gray-600"
                          htmlFor={`price-${optionIdx}`}
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className="flex justify-center flex-col gap-2">
                      <div>
                        <input
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));
                            _debounceSubmit();
                          }}
                          checked={filter.price.isCustom}
                          type="radio"
                          id={`price-${PRICE_FILTERS.options.length}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          className="ml-3 text-small text-gray-600"
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                        >
                          Custom
                        </label>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          {filter.price.isCustom
                            ? minFilterCustom.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{" "}
                          -{" "}
                          {filter.price.isCustom
                            ? maxFilterCustom.toFixed(0)
                            : filter.price.range[1]}
                        </div>
                      </div>
                      <Slider
                        className={cn({ "opacity-50": !filter.price.isCustom })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;
                          setFilter((prev) => ({
                            ...prev,
                            price: { isCustom: true, range: [newMin, newMax] },
                          }));
                          _debounceSubmit();
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={4}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Products in this div */}
          <div className="lg:col-span-3">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products && products.length === 0 ? (
                <EmptyState />
              ) : products ? (
                products.map((product) => (
                  <Product key={product.id} product={product.metadata!} />
                ))
              ) : (
                new Array(12)
                  .fill(null)
                  .map((_, index) => <ProductsSkeleton key={index} />)
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
