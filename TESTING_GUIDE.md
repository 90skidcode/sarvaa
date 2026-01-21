# 🧪 Testing Guide - Sarvaa Sweets

## 🎯 **What to Test**

### **Test 1: Homepage & Navigation** ✅

**URL:** http://localhost:3000

**Check:**

- [ ] Homepage loads correctly
- [ ] Tamil text visible in hero: "தமிழ்நாட்டின் #1 இனிப்பு கடை"
- [ ] Featured products show Tamil sweets (Mysore Pak, Tirunelveli Halwa, etc.)
- [ ] Cart badge visible in header (should show "0" initially)
- [ ] Navigation links work (Home, Shop Sweets, TN Traditional, Temple Prasadam, Contact)

---

### **Test 2: Products Page & Filtering** ✅

**URL:** http://localhost:3000/products

**Check:**

- [ ] Products page loads with all 12 Tamil sweets
- [ ] Category filter buttons visible (All, Traditional, Temple Prasadam, Chettinad, Festival, Gift Boxes)
- [ ] Click "Traditional" - shows only Traditional TN Sweets
- [ ] Click "Temple Prasadam" - shows temple sweets
- [ ] Each product card shows:
  - Product image
  - Product name
  - Description
  - Weight selector dropdown
  - Quantity +/- buttons
  - "Add to Cart" button
  - Price updates when weight changes

---

### **Test 3: Weight-Based Pricing** ✅

**URL:** http://localhost:3000/products

**Test with Mysore Pak:**

- [ ] Default shows 250g option
- [ ] Select 250g → Price shows ₹349
- [ ] Select 500g → Price changes to ₹649
- [ ] Select 1kg → Price changes to ₹1199
- [ ] Price updates correctly for each product

---

### **Test 4: Add to Cart Functionality** 🛒

**URL:** http://localhost:3000/products

**Steps:**

1. Select "Mysore Pak Premium"
2. Choose weight: 500g
3. Set quantity: 2 (using + button)
4. Click "Add to Cart"

**Expected:**

- [ ] Toast notification appears: "Added 2x Mysore Pak Premium (500g) to cart!"
- [ ] Cart badge updates to show "2" items
- [ ] Toast shows total: ₹1298.00

**Repeat with different product:** 5. Select "Tirunelveli Halwa" 6. Choose weight: 250g 7. Quantity: 1 8. Click "Add to Cart"

**Expected:**

- [ ] Cart badge now shows "3" total items
- [ ] New toast notification

---

### **Test 5: Shopping Cart Page** 🛒

**URL:** http://localhost:3000/cart

**After adding items above, check:**

- [ ] Cart page shows both products
- [ ] Each item displays:
  - Product image
  - Product name
  - Selected weight (500g for Mysore Pak, 250g for Halwa)
  - Quantity controls (+/- buttons)
  - Price per item
  - Subtotal (price × quantity)
  - Remove button (trash icon)

**Cart Summary:**

- [ ] Shows item count: "Showing 2 items"
- [ ] Subtotal calculation correct
- [ ] Free shipping progress bar visible
- [ ] Shows "Add ₹XXX more for free shipping" if under ₹999
- [ ] Shipping cost shows ₹50 (if under ₹999)
- [ ] Total = Subtotal + Shipping

**Cart Actions:**

- [ ] Click + on Mysore Pak → Quantity increases, prices update
- [ ] Click - on Mysore Pak → Quantity decreases
- [ ] Click trash icon → Item removed, cart updates
- [ ] "Clear Cart" button removes all items
- [ ] Empty cart shows "Your Cart is Empty" message

---

### **Test 6: Free Shipping Progress** 🚚

**URL:** http://localhost:3000/cart

**Steps:**

1. Add items totaling less than ₹999
2. Check progress bar shows: "Add ₹XXX more for free shipping"
3. Add more items to exceed ₹999
4. Check green success message: "🎉 You qualify for FREE shipping!"
5. Verify shipping changes from ₹50 to FREE

**Example to reach ₹999:**

- Mysore Pak 500g × 2 = ₹1298 ✅ (Already qualifies!)

---

### **Test 7: Cart Persistence** 💾

**Steps:**

1. Add items to cart
2. Note the cart count
3. Refresh the page (F5)
4. Check cart badge still shows same count
5. Visit cart page - items still there

**Expected:**

- [ ] Cart persists across page refreshes
- [ ] Items stored in localStorage
- [ ] Can close browser and come back - cart still intact

---

### **Test 8: About Page** 📖

**URL:** http://localhost:3000/about

**Check:**

- [ ] Page loads with purple gradient hero
- [ ] Brand story section visible
- [ ] "Our Values" cards show:
  - Pure Ingredients
  - Traditional Recipes
  - Handcrafted Daily
  - 50,000+ Happy Customers
- [ ] Heritage section with Tamil town badges:
  - Srivilliputhur Palgova
  - Tirunelveli Halwa
  - Kovilpatti Kadalai Mittai
  - Chettinad Specialties
- [ ] CTA button "Browse Our Collection" links to /products

---

### **Test 9: Contact Page** 📞

**URL:** http://localhost:3000/contact

**Check:**

- [ ] Contact form visible with fields:
  - Full Name (required)
  - Email (required)
  - Phone (optional)
  - Message (required)
- [ ] Contact information cards show:
  - Store address: Chennai, T. Nagar
  - Phone: +91-9876543210
  - Email: admin@sarvaasweets.com
  - WhatsApp button

**Test Form Submission:**

1. Fill in all required fields
2. Click "Send Message"
3. Expected: Toast notification "Message sent successfully!"
4. Form resets to empty

**Test WhatsApp:**

- [ ] Click "Chat on WhatsApp" button
- [ ] Opens WhatsApp with correct number

---

### **Test 10: Responsive Design** 📱

**Test on different screen sizes:**

**Desktop (> 1024px):**

- [ ] 3-column product grid
- [ ] Full navigation menu
- [ ] Cart summary sticky on right

**Tablet (768px - 1024px):**

- [ ] 2-column product grid
- [ ] Condensed navigation

**Mobile (< 768px):**

- [ ] Single column layout
- [ ] Stacked cart summary
- [ ] Touch-friendly buttons

---

### **Test 11: Navigation Flow** 🔄

**Complete user journey:**

1. **Homepage** → Click "Shop Now"
2. **Products** → Filter by category → Select product
3. **Change weight** → Adjust quantity → Add to cart
4. **Toast appears** → Cart badge updates
5. **Click cart badge** → View cart
6. **Manage items** → Update quantities
7. **Check shipping progress** → Add more if needed
8. **Click "Proceed to Checkout"** (will go to checkout later)
9. **Visit About page** → Read story
10. **Visit Contact page** → Fill form

---

## ✅ **Expected Behavior Summary**

| Feature                 | Expected Behavior                                                     |
| ----------------------- | --------------------------------------------------------------------- |
| **Weight Selector**     | Dropdown shows 3 options (250g, 500g, 1kg), price updates dynamically |
| **Quantity Control**    | +/- buttons work, disabled at min/max limits                          |
| **Add to Cart**         | Toast notification, cart badge updates, items added                   |
| **Cart Badge**          | Shows total item count (not unique products)                          |
| **Cart Page**           | Shows all items, quantities editable, remove works                    |
| **Free Shipping**       | Progress bar fills, turns green at ₹999+                              |
| **Category Filter**     | Filters products in real-time                                         |
| **Cart Persistence**    | Survives page refresh                                                 |
| **Empty Cart**          | Shows empty state with "Browse Sweets" button                         |
| **Toast Notifications** | Appears top-right, auto-dismisses                                     |

---

## 🐛 **Common Issues to Check**

- [ ] TypeScript errors in console
- [ ] Images not loading
- [ ] Toast notifications not appearing
- [ ] Cart badge showing "CartBadge" instead of count
- [ ] Weight selector not showing options
- [ ] Prices not updating when weight changes
- [ ] Cart not persisting
- [ ] Free shipping bar not showing

---

## 🚀 **Testing Checklist**

- [ ] All pages load without errors
- [ ] Cart system works end-to-end
- [ ] Weight-based pricing calculates correctly
- [ ] Category filtering works
- [ ] Toast notifications appear
- [ ] Free shipping progress accurate
- [ ] Cart persists across refreshes
- [ ] Forms submit successfully
- [ ] All links work
- [ ] Responsive on mobile/tablet

---

**Ready to test!** Open http://localhost:3000 and go through the checklist above.

Report any issues you find and I'll fix them immediately! 🔧
