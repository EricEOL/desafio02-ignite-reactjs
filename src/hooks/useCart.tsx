import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  useEffect(() => {
    api.get('products')
      .then(response => setProducts(response.data));

    api.get('stock')
      .then(response => setStock(response.data));
  }, []);

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, []);

  const addProduct = async (productId: number) => {
    try {
      const foundProduct = products.filter(product => product.id === productId);

      if(!foundProduct) {
        toast.error('Erro na adição do produto');
        return;
      }

      const { id, title, price, image } = foundProduct[0];
      const productForAdd = {
        id,
        title,
        price,
        image,
        amount: 1
      }

      const stockQuantity = stock[Number(productId) - 1].amount;

      const searchForProductInCart = cart.find(product => product.id === productId);

      if (!searchForProductInCart && stockQuantity > 0) {
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, productForAdd]));
        setCart([...cart, productForAdd]);
      }

      if(searchForProductInCart && searchForProductInCart.amount >= stockQuantity) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (searchForProductInCart && searchForProductInCart.amount < stockQuantity) {
        const newCart = cart.map(product => {
          if (product.id === productId) {
            product.amount += 1;
            return product;
          }
          return product;
        })
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        setCart(newCart);

      }     
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const foundProduct = cart.filter(product => product.id === productId);

      if(!foundProduct) {
        toast.error('Erro na remoção do produto');
        return;
      }

      const newCartWithoutProduct = cart.filter(product => {
        if(product.id !== productId) {
          return product;
        }
      })
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartWithoutProduct));
      setCart(newCartWithoutProduct);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      const foundProduct = cart.filter(product => product.id === productId);

      if(!foundProduct) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }

      if(amount <= 0) {
        return;
      }
      
      const stockQuantity = stock[Number(productId) - 1].amount;

      if(stockQuantity < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = cart.map(product => {
        if (product.id === productId) {
          if(amount > product.amount) {
            product.amount += 1;
            return product;
          } else {
            product.amount -= 1
            return product;
          }
        }
        return product;
      })
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      setCart(newCart);
      
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
