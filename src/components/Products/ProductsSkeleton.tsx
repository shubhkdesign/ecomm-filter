import React from "react";

const ProductsSkeleton = () => {
  return (
    <div className="relative animate-pulse">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80">
        <div className="h-full w-full bg-gray-200"> </div>
      </div>
      <div className="bg-gray-200 mt-4 flex flex-col gap-2">
        <div className="bg-gray-200 h-full w-full "> </div>
        <div className="bg-gray-200 h-full w-full "> </div>
      </div>
    </div>
  );
};

export default ProductsSkeleton;
