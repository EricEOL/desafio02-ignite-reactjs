import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product): any => {
    const subtotal = Number(product.price) * Number(product.amount);

    return {
      id: product.id,
      title: product.title,
      priceFormatted: formatPrice(product.price),
      image: product.image,
      amount: product.amount,
      subTotal: formatPrice(subtotal),
    }
  })

  const total =
     formatPrice(
       cart.reduce((sumTotal, product): any => {
         return sumTotal + product.price * product.amount;
       }, 0)
      )

  function handleProductIncrement(product: Product) {
    const {id, amount} = product;
    const currentAmount = amount + 1;
    const productToIncrement = {
      productId: id,
      amount: currentAmount 
    }
    updateProductAmount(productToIncrement);
  }

  function handleProductDecrement(product: Product) {
    const {id, amount} = product;
    const currentAmount = amount - 1;
    const productToIncrement = {
      productId: id,
      amount: currentAmount 
    }
    updateProductAmount(productToIncrement);
  }

  function handleRemoveProduct(productId: number) {
    console.log(productId);
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(product => (
            <tr data-testid="product" key={product.id}>
              <td>
                <img src={product.image} alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{product.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={product.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{product.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
        ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
