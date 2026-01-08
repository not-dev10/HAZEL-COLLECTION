import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { AddToWishlistButton } from '@/components/ui/add-to-wishlist-button';
import { CartItem } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  category?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  isNew,
  isSale,
  originalPrice,
  category,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const productSlug = name.toLowerCase().replace(/\s+/g, '-');

  const cartItem: CartItem = {
    id: id.toString(),
    name,
    price,
    quantity: 1,
    image,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/product/${productSlug}`);
  };

  return (
    <article 
      className="group flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="product-card-image relative aspect-[3/4] bg-muted mb-4 flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        {isNew && (
          <span className="absolute top-4 left-4 bg-foreground text-background text-[10px] tracking-wider px-3 py-1 uppercase">
            New
          </span>
        )}
        {isSale && (
          <span className="absolute top-4 left-4 bg-sale text-sale-foreground text-[10px] tracking-wider px-3 py-1 uppercase">
            Sale
          </span>
        )}
        {/* Action Buttons - Desktop Overlay */}
        <div className="hidden md:absolute md:inset-0 md:bg-black/40 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300 md:flex md:items-center md:justify-center md:gap-3">
          <AddToCartButton
            item={cartItem}
            variant="default"
            size="md"
            showIcon={true}
          />
          <AddToWishlistButton
            itemId={id.toString()}
            itemName={name}
            itemPrice={price}
            itemImage={image}
            variant="default"
            size="md"
          />
        </div>
      </div>
      <div className="text-center space-y-1.5 flex-grow flex flex-col justify-between">
        <div>
          {category && (
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold mb-1">
              {category}
            </p>
          )}
          <h3 className="text-xs tracking-wider uppercase font-medium line-clamp-1 h-4 hover:opacity-70 transition-opacity">
            {name}
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm">
          {isSale && originalPrice && (
            <span className="text-muted-foreground line-through">
              £{originalPrice.toLocaleString()}
            </span>
          )}
          <span className={`font-medium ${isSale ? 'text-sale' : ''}`}>
            £{price.toLocaleString()}
          </span>
        </div>
        {/* Action Buttons - Mobile */}
        <div className="md:hidden flex items-center justify-center gap-2 pt-2">
          <div className="flex-1">
            <AddToCartButton
              item={cartItem}
              variant="default"
              size="sm"
              showIcon={true}
              className="w-full text-xs py-2"
            />
          </div>
          <div>
            <AddToWishlistButton
              itemId={id.toString()}
              itemName={name}
              itemPrice={price}
              itemImage={image}
              variant="default"
              size="sm"
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
