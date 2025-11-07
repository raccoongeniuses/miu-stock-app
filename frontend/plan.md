# 📦 Shopee Stock App Plan
**Category:** Imported Car Accessories (China)  
**Purpose:** To monitor stock, shipping, and selling prices from a single internal dashboard.

---

## 🗂️ Page 1 — Stock Management

### Product Stock Table
| Product Name | SKU | Initial Stock | Stock Out | Pending Stock | Real Stock (Available) | Notes |
|---------------|------|---------------|-------------|----------------|-------------------------|--------|
| Premium Leather Steering Cover | CSK001 | 100 | 20 | 5 | 75 | Batch #A01 |
| Universal Car Mat | KMU002 | 80 | 10 | 3 | 67 | Batch #B02 |
| High-End Silicone Wiper | WSH003 | 120 | 15 | 10 | 95 | Batch #C03 |

> **Formula per product:**  
> `Real Stock = Initial Stock - (Stock Out + Pending Stock)`

**Additional Features:**
- 🔍 Search by product name/SKU  
- ⏳ Filter low-stock items (e.g., <10 pcs)  
- 🧾 Export to Excel/CSV  
- ✏️ Manual stock editing (real-time update)  

---

## 🚢 Page 2 — Shipping Status (Sea & Air)

### Shipping Table
| Date | Method | Container / AWB Number | Estimated Arrival | Total Products | Status | Notes |
|------|---------|-------------------------|--------------------|----------------|---------|--------|
| 2025-10-10 | Sea | CNT-SEA-8821 | 2025-11-05 | 250 | In Transit | ETA confirmed |
| 2025-10-15 | Air | AWB-AIR-5509 | 2025-10-30 | 50 | Received | Items stored in warehouse |
| 2025-10-25 | Sea | CNT-SEA-8890 | 2025-11-15 | 300 | Processing | Loading in Guangzhou |

**Notes:**
- **Method:** Sea (cheaper, slower) / Air (faster, more expensive)  
- **Status:** Processing, In Transit, Received  
- Auto notification feature when shipment arrives

---

## 💰 Page 3 — Pricing & Profit Margin

### Product Pricing Table
| Product Name | SKU | Real Stock | Cost Price (RMB/pcs) | Cost Price (IDR) | Shopee Selling Price (IDR) | Margin (%) |
|---------------|------|-------------|------------------------|-------------------|-----------------------------|-------------|
| Premium Leather Steering Cover | CSK001 | 75 | ¥8.5 | 18,000 | 35,000 | 94% |
| Universal Car Mat | KMU002 | 67 | ¥15 | 32,000 | 60,000 | 87% |
| High-End Silicone Wiper | WSH003 | 95 | ¥6 | 13,000 | 28,000 | 115% |

> **Margin Formula:**  
> `(Selling Price - Cost Price) / Cost Price × 100%`

**Additional Features:**
- 🔁 Auto-update cost based on daily RMB → IDR exchange rate  
- 📉 Low margin indicator (below 30%)  
- 📊 Average margin graph per product category  

---

## 🔧 Technical Notes (for development)
- Backend: Express.js + MySQL (tables: `products`, `shipments`, `prices`)  
- Frontend: Vue 3 + TailwindCSS + DaisyUI  
- Excel import/export via `xlsx` library  
- Option to print monthly stock reports (PDF format)

---

## 🌐 App Navigation Example
```
📊 Dashboard
 ├── 📦 Stock Management
 ├── 🚢 Shipping
 └── 💰 Pricing & Margin
```

---

## 🧠 Future Plans
- Integration with Shopee Seller Center API (auto sync stock & pricing)  
- Multi-warehouse support (Jakarta / Batam)  
- Reorder reminders when stock < minimum threshold

---

© 2025 Shopee Stock App – Imported Car Accessories (China)