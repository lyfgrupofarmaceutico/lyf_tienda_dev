import { Image } from "lucide-react";

const CategoryCard = ({ img, titulo }) => {
  return (
    <div className="group block">
      <div className="relative h-64 w-full overflow-hidden shadow-xl rounded-md border-4 border-white">
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/20" />
        {img ? (
          <img src={img} alt={titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <Image className="w-20 h-20 text-gray-200" />
          </div>
        )}
      </div>
      <h3 className="pt-2 mx-auto px-2 text-xl md:text-2xl font-bold text-center">
        {titulo}
      </h3>
    </div>
  );
};

export default CategoryCard;
