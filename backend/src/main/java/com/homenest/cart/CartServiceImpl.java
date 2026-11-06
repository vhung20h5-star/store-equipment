package com.homenest.cart;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.homenest.auth.User;
import com.homenest.auth.UserRepository;
import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.catalog.ProductResponseDTO;
import com.homenest.catalog.ProductService;
import com.homenest.exception.ResourceNotFoundException;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductService productService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    private Cart getOrCreateCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + userEmail));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCartByUserEmail(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        List<CartItemEntity> items = cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponseDTO> itemDTOs = new ArrayList<>();
        int totalItems = 0;
        long totalPrice = 0L;

        for (CartItemEntity item : items) {
            ProductResponseDTO productDTO = productService.getProductById(item.getProduct().getId());
            long itemTotal = item.getProduct().getPrice() * item.getQuantity();

            CartItemResponseDTO itemDTO = new CartItemResponseDTO(
                    item.getId(),
                    productDTO,
                    item.getQuantity(),
                    itemTotal
            );
            itemDTOs.add(itemDTO);
            totalItems += item.getQuantity();
            totalPrice += itemTotal;
        }

        return new CartResponseDTO(itemDTOs, totalItems, totalPrice);
    }

    @Override
    @Transactional
    public CartResponseDTO addToCart(String userEmail, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userEmail);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện đã ngừng kinh doanh.");
        }

        Optional<CartItemEntity> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItemEntity existing = existingItemOpt.get();
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
        } else {
            CartItemEntity newItem = new CartItemEntity(cart, product, request.getQuantity());
            cartItemRepository.save(newItem);
        }

        return getCartByUserEmail(userEmail);
    }

    @Override
    @Transactional
    public CartResponseDTO updateCartItem(String userEmail, String productId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userEmail);

        if (request.getQuantity() <= 0) {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm: " + productId));
            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' hiện đã ngừng kinh doanh.");
            }
            Optional<CartItemEntity> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
            if (existingItemOpt.isPresent()) {
                CartItemEntity existing = existingItemOpt.get();
                existing.setQuantity(request.getQuantity());
                cartItemRepository.save(existing);
            } else {
                CartItemEntity newItem = new CartItemEntity(cart, product, request.getQuantity());
                cartItemRepository.save(newItem);
            }
        }

        return getCartByUserEmail(userEmail);
    }

    @Override
    @Transactional
    public CartResponseDTO removeFromCart(String userEmail, String productId) {
        Cart cart = getOrCreateCart(userEmail);
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        return getCartByUserEmail(userEmail);
    }

    @Override
    @Transactional
    public CartResponseDTO clearCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        cartItemRepository.deleteByCartId(cart.getId());
        return new CartResponseDTO(new ArrayList<>(), 0, 0L);
    }

    @Override
    @Transactional
    public CartResponseDTO syncCart(String userEmail, SyncCartRequest request) {
        Cart cart = getOrCreateCart(userEmail);

        if (request.getItems() != null) {
            for (SyncCartItemRequest guestItem : request.getItems()) {
                Optional<Product> productOpt = productRepository.findById(guestItem.getProductId());
                if (productOpt.isPresent() && !Boolean.FALSE.equals(productOpt.get().getIsActive())) {
                    Product product = productOpt.get();
                    Optional<CartItemEntity> existingOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
                    if (existingOpt.isPresent()) {
                        CartItemEntity existing = existingOpt.get();
                        existing.setQuantity(existing.getQuantity() + guestItem.getQuantity());
                        cartItemRepository.save(existing);
                    } else {
                        CartItemEntity newItem = new CartItemEntity(cart, product, guestItem.getQuantity());
                        cartItemRepository.save(newItem);
                    }
                }
            }
        }

        return getCartByUserEmail(userEmail);
    }
}

