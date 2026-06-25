import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorizeUserMock: vi.fn(),
  countOrdersMock: vi.fn(),
  createOrderMock: vi.fn(),
  createOrderItemsMock: vi.fn(),
  deleteOrderMock: vi.fn(),
  findOrdersMock: vi.fn(),
  findUniqueOrderMock: vi.fn(),
  updateOrderStatusMock: vi.fn(),
  getUserCartMock: vi.fn(),
  clearCartItemsMock: vi.fn(),
  updateProductStockMock: vi.fn(),
  paystackCheckoutMock: vi.fn(),
  createOrderSchemaParseMock: vi.fn(),
  pageResponseMapperMock: vi.fn(),
  userOrderMapperMock: vi.fn(),
  adminOrderMapperMock: vi.fn(),
  discountFindManyMock: vi.fn(),
  orderItemUpdateMock: vi.fn(),
  orderUpdateMock: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  default: {
    authorizeUser: mocks.authorizeUserMock,
  },
}));

vi.mock('@/repositories/order.repository', () => ({
  countOrders: mocks.countOrdersMock,
  createOrder: mocks.createOrderMock,
  createOrderItems: mocks.createOrderItemsMock,
  deleteOrder: mocks.deleteOrderMock,
  findOrders: mocks.findOrdersMock,
  findUniqueOrder: mocks.findUniqueOrderMock,
  updateOrderStatus: mocks.updateOrderStatusMock,
}));

vi.mock('@/services/cart.service', () => ({
  default: {
    getUserCart: mocks.getUserCartMock,
    clearCartItems: mocks.clearCartItemsMock,
  },
}));

vi.mock('@/services/product.service', () => ({
  default: {
    updateProductStock: mocks.updateProductStockMock,
    updateSoldProduct: mocks.updateProductStockMock,
  },
}));

vi.mock('@/services/paystack/checkout', () => ({
  paystackCheckout: mocks.paystackCheckoutMock,
}));

vi.mock('@/validationSchemas/order', () => ({
  createOrderSchema: {
    parse: mocks.createOrderSchemaParseMock,
  },
}));

vi.mock('@/mapper/pagedResponse', () => ({
  pageResponseMapper: mocks.pageResponseMapperMock,
}));

vi.mock('@/mapper/order', () => ({
  userOrderMapper: mocks.userOrderMapperMock,
  adminOrderMapper: mocks.adminOrderMapperMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    discount: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    orderItem: {
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import OrderService from '@/services/order.service';
import { NotFoundError } from '@/lib/errors';

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.discount.findMany = vi.fn().mockResolvedValue([]);
    prisma.orderItem.update = vi.fn().mockResolvedValue({});
    prisma.order.update = vi.fn().mockResolvedValue({});
  });

  it('returns paginated current user orders', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findOrdersMock.mockResolvedValue([{ id: 'order-1' }]);
    mocks.countOrdersMock.mockResolvedValue(1);
    mocks.userOrderMapperMock.mockReturnValue({ id: 'order-1' });
    mocks.pageResponseMapperMock.mockReturnValue({ data: [{ id: 'order-1' }] });

    await expect(
      OrderService.getCurrentUserOrders({ page: 2, limit: 5, status: 'PENDING' }),
    ).resolves.toEqual({ data: [{ id: 'order-1' }] });

    expect(mocks.findOrdersMock).toHaveBeenCalledWith(
      false,
      { userId: 'user-1', status: 'PENDING' },
      5,
      5,
    );
    expect(mocks.countOrdersMock).toHaveBeenCalledWith({ userId: 'user-1', status: 'PENDING' });
  });

  it('returns a user order by id', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findOrdersMock.mockResolvedValue([{ id: 'order-1' }]);
    mocks.userOrderMapperMock.mockReturnValue({ id: 'order-1' });

    await expect(OrderService.getUserOrderById('order-1')).resolves.toEqual({ id: 'order-1' });

    expect(mocks.findOrdersMock).toHaveBeenCalledWith(false, { id: 'order-1', userId: 'user-1' }, 0, 1);
  });

  it('throws when a user order is missing', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findOrdersMock.mockResolvedValue([]);

    await expect(OrderService.getUserOrderById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns paginated admin orders', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findOrdersMock.mockResolvedValue([{ id: 'order-1' }]);
    mocks.countOrdersMock.mockResolvedValue(1);
    mocks.adminOrderMapperMock.mockReturnValue({ id: 'order-1' });
    mocks.pageResponseMapperMock.mockReturnValue({ data: [{ id: 'order-1' }] });

    await expect(
      OrderService.getAllOrders({ page: 1, limit: 10, status: 'SHIPPED' }),
    ).resolves.toEqual({ data: [{ id: 'order-1' }] });

    expect(mocks.findOrdersMock).toHaveBeenCalledWith(true, { status: 'SHIPPED' }, 0, 10);
    expect(mocks.countOrdersMock).toHaveBeenCalledWith({ status: 'SHIPPED' });
  });

  it('returns an admin order by id', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'admin-1' });
    mocks.findOrdersMock.mockResolvedValue([{ id: 'order-1' }]);
    mocks.adminOrderMapperMock.mockReturnValue({ id: 'order-1' });

    await expect(OrderService.getOrderById('order-1')).resolves.toEqual({ id: 'order-1' });

    expect(mocks.findOrdersMock).toHaveBeenCalledWith(true, { id: 'order-1' }, 0, 1);
  });

  it('creates an order, charges checkout, and clears the cart', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        productId: 'product-1',
        quantity: 2,
        size: 'M',
        product: { price: 1500 },
      },
      {
        id: 'cart-item-2',
        productId: 'product-2',
        quantity: 1,
        size: null,
        product: { price: 2000 },
      },
    ];

    mocks.createOrderSchemaParseMock.mockReturnValue({
      streetAddress: '12 Market Road',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      country: 'Nigeria',
      contactEmail: 'buyer@example.com',
      contactName: 'Buyer Name',
      contactPhone: '+2347000000000',
      note: 'Leave at reception',
      shippingMethod: 'within_port_harcourt',
    });
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.getUserCartMock.mockResolvedValue({ id: 'cart-1', items: cartItems });
    mocks.createOrderMock.mockResolvedValue({ id: 'order-1' });
    mocks.paystackCheckoutMock.mockResolvedValue('https://paystack.example.com/checkout');

    await expect(
      OrderService.createNewOrder({
        deliveryAddress: '12 Market Road',
        contactEmail: 'buyer@example.com',
        contactName: 'Buyer Name',
        contactPhone: '+2347000000000',
        note: 'Leave at reception',
      } as never),
    ).resolves.toBe('https://paystack.example.com/checkout');

    expect(mocks.createOrderMock).toHaveBeenCalledWith({
      street_address: '12 Market Road',
      city: 'Lagos',
      state: 'Lagos',
      zip_code: '100001',
      country: 'Nigeria',
      contact_email: 'buyer@example.com',
      contact_name: 'Buyer Name',
      contact_phone: '+2347000000000',
      note: 'Leave at reception',
      totalAmount: 10375,
      shippingMethod: 'WITHIN_PORT_HARCOURT',
      user: { connect: { id: 'user-1' } },
    });
    expect(mocks.createOrderItemsMock).toHaveBeenCalledWith([
      {
        quantity: 2,
        size: 'M',
        price_at_purchase: 1500,
        orderId: 'order-1',
        productId: 'product-1',
      },
      {
        quantity: 1,
        size: null,
        price_at_purchase: 2000,
        orderId: 'order-1',
        productId: 'product-2',
      },
    ]);
    expect(mocks.paystackCheckoutMock).toHaveBeenCalledWith({
      orderId: 'order-1',
      email: 'buyer@example.com',
      totalAmount: 10375,
    });
    expect(mocks.clearCartItemsMock).toHaveBeenCalledWith(cartItems);
  });

  it('rolls back the order when checkout initialization fails', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        productId: 'product-1',
        quantity: 2,
        size: 'M',
        product: { price: 1500 },
      },
    ];

    mocks.createOrderSchemaParseMock.mockReturnValue({
      streetAddress: '12 Market Road',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      country: 'Nigeria',
      contactEmail: 'buyer@example.com',
      contactName: 'Buyer Name',
      contactPhone: '+2347000000000',
      note: undefined,
      shippingMethod: 'within_port_harcourt',
    });
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.getUserCartMock.mockResolvedValue({ id: 'cart-1', items: cartItems });
    mocks.createOrderMock.mockResolvedValue({ id: 'order-1' });
    mocks.paystackCheckoutMock.mockResolvedValue(null);

    await expect(
      OrderService.createNewOrder({
        deliveryAddress: '12 Market Road',
        contactEmail: 'buyer@example.com',
        contactName: 'Buyer Name',
        contactPhone: '+2347000000000',
      } as never),
    ).rejects.toThrow('Failed to initialize payment');

    expect(mocks.deleteOrderMock).toHaveBeenCalledWith('order-1');
    expect(mocks.clearCartItemsMock).not.toHaveBeenCalled();
  });

  it('marks a paid order as processing and decrements stock', async () => {
    mocks.findUniqueOrderMock.mockResolvedValue({
      id: 'order-1',
      orderItems: [
        { quantity: 2, product: { slug: 'product-one', stock_count: 10 } },
        { quantity: 1, product: { slug: 'product-two', stock_count: 10 } },
      ],
    });

    await expect(OrderService.processPaidOrder('order-1')).resolves.toBeUndefined();

    expect(mocks.updateOrderStatusMock).toHaveBeenCalledWith('order-1', { status: 'PROCESSING' });
    expect(mocks.updateProductStockMock).toHaveBeenCalledWith('product-one', -2);
    expect(mocks.updateProductStockMock).toHaveBeenCalledWith('product-two', -1);
  });

  it('initializes payment for a pending order owned by the current user', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findUniqueOrderMock.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'PENDING',
      contact_email: 'buyer@example.com',
      shippingMethod: 'within_port_harcourt',
      orderItems: [
        { quantity: 2, price_at_purchase: 1000, product: { id: 'product-1', price: 1000, category: { name: 'Clothing' } } },
        { quantity: 1, price_at_purchase: 2500, product: { id: 'product-2', price: 2500, category: { name: 'Clothing' } } },
      ],
    });
    mocks.paystackCheckoutMock.mockResolvedValue('https://paystack.example.com/order');

    await expect(OrderService.initializePaymentForOrder('order-1')).resolves.toBe(
      'https://paystack.example.com/order',
    );

    expect(mocks.paystackCheckoutMock).toHaveBeenCalledWith({
      orderId: 'order-1',
      email: 'buyer@example.com',
      totalAmount: 9837.5,
    });
  });

  it('rejects payment initialization for non-pending orders', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findUniqueOrderMock.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: 'PROCESSING',
      contact_email: 'buyer@example.com',
      orderItems: [],
    });

    await expect(OrderService.initializePaymentForOrder('order-1')).rejects.toThrow(
      'Payment can only be initialized for pending orders',
    );
  });

  it('throws when initializing payment for an unknown or foreign order', async () => {
    mocks.authorizeUserMock.mockResolvedValue({ id: 'user-1' });
    mocks.findUniqueOrderMock.mockResolvedValue({
      id: 'order-1',
      userId: 'user-2',
      status: 'PENDING',
      contact_email: 'buyer@example.com',
      orderItems: [],
    });

    await expect(OrderService.initializePaymentForOrder('order-1')).rejects.toBeInstanceOf(NotFoundError);
  });
});
