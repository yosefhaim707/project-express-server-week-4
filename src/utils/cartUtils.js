export const roundMoney = (amount) => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const findProductById = (products, productId) => {
  return products.find((product) => product.id === productId);
};

export const getCartDetails = (cart, products) => {
  const items = cart.map((cartItem) => {
    const product = findProductById(products, cartItem.productId);
    const price = product ? product.price : 0;

    return {
      productId: cartItem.productId,
      name: product ? product.name : "Unknown product",
      price,
      quantity: cartItem.quantity,
      itemTotal: roundMoney(price * cartItem.quantity),
      availableStock: product ? product.stock : 0,
      inStock: product ? product.stock > 0 : false,
    };
  });

  const total = items.reduce((sum, item) => sum + item.itemTotal, 0);

  return {
    items,
    total: roundMoney(total),
  };
};
