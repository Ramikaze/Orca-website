// orca-cart.js
class OrcaCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('orca_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.renderCart();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Gestion globale de l'UI (Ouvrir/Fermer)
        document.addEventListener('click', (e) => {
            // Ouvrir le panier au clic sur l'icône du header
            if (e.target.closest('#cart-toggle')) {
                this.openCart();
            }
            
            // Fermer le panier
            if (e.target.closest('#close-cart') || e.target.closest('#cart-overlay')) {
                this.closeCart();
            }
            
            // Retirer un article
            // Retirer un article
            if (e.target.classList.contains('remove-item')) {
                const cb = e.target.dataset.cb;
                this.removeItem(cb);
            }
            
            // Finaliser la liste (Devis)
            if (e.target.classList.contains('checkout-btn')) {
                this.generateQuotation();
            }
        });
    }

    addItem(cb) {
        // Trouver le produit dans les données globales
        const product = window.ORCA_PRODUCTS.find(p => p.cb === cb);
        if (!product) return;

        // Vérifier si déjà présent
        const existing = this.items.find(item => item.cb === cb);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                cb: product.cb,
                nom: product.nom,
                prix: product.prix_promo > 0 ? product.prix_promo : product.prix,
                quantity: 1
            });
        }

        this.save();
        this.openCart();
        this.showFeedback("Article ajouté !");
    }

    removeItem(cb) {
        this.items = this.items.filter(item => item.cb !== cb);
        this.save();
    }

    save() {
        localStorage.setItem('orca_cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.renderCart();
    }

    updateCartCount() {
        const counts = document.querySelectorAll('.cart-count');
        const totalQty = this.items.reduce((sum, item) => sum + item.quantity, 0);
        counts.forEach(el => {
            el.textContent = totalQty;
            el.style.display = totalQty > 0 ? 'flex' : 'none';
        });
    }

    openCart() {
        document.getElementById('cart-drawer').classList.add('active');
        document.getElementById('cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cart-drawer').classList.remove('active');
        document.getElementById('cart-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    renderCart() {
        const container = document.getElementById('cart-items-list');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<div class="empty-cart-msg">Votre panier est vide</div>';
            document.getElementById('cart-total').textContent = '0 FCFA';
            return;
        }

        let total = 0;
        container.innerHTML = this.items.map(item => {
            total += item.prix * item.quantity;
            return `
                <div class="cart-item">
                    <img src="assets/produits/${item.cb}.jpg" alt="${item.nom}" class="cart-item-img" onerror="this.src='assets/images/placeholder.png'">
                    <div class="cart-item-info">
                        <h4>${item.nom}</h4>
                        <div class="cart-item-price">${item.prix.toLocaleString()} FCFA ${item.quantity > 1 ? ' x ' + item.quantity : ''}</div>
                        <button class="remove-item" data-cb="${item.cb}">Supprimer</button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('cart-total').textContent = total.toLocaleString() + ' FCFA';
    }

    showFeedback(msg) {
        // Optionnel : un petit toast ou alerte
        console.log(msg);
    }

    generateQuotation() {
        if (this.items.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        const printWindow = window.open('', '_blank');
        const total = this.items.reduce((sum, item) => sum + item.prix * item.quantity, 0);
        const date = new Date().toLocaleDateString('fr-FR');

        let html = `
            <html>
            <head>
                <title>Ma Sélection ORCA - ${date}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; color: #111; padding: 40px; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo { height: 80px; }
                    .quote-info { text-align: right; }
                    .quote-info h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; background: #f9f9f9; padding: 15px; border-bottom: 2px solid #111; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                    td { padding: 15px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    .item-img { width: 70px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; }
                    .item-cb { font-family: monospace; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: bold; }
                    .price { font-weight: 600; }
                    .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
                    .total-box { background: #111; color: white; padding: 20px 40px; text-align: right; }
                    .total-label { font-size: 14px; opacity: 0.8; text-transform: uppercase; }
                    .total-amount { font-size: 24px; font-weight: bold; display: block; margin-top: 5px; }
                    .disclaimer { margin-top: 60px; padding: 20px; border: 1px dashed #ccc; font-size: 13px; color: #666; background: #fafafa; }
                    .no-print-zone { margin-top: 40px; text-align: center; }
                    .print-btn { background: #111; color: white; padding: 15px 30px; border: none; cursor: pointer; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                    @media print {
                        .no-print-zone { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="assets/images/logo.png" class="logo">
                    <div class="quote-info">
                        <h1>MA SÉLECTION</h1>
                        <p>Date : ${date}</p>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Désignation</th>
                            <th>Code-Barre</th>
                            <th>Prix Unitaire</th>
                            <th>Quantité</th>
                            <th style="text-align:right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.items.map(item => `
                            <tr>
                                <td><img src="assets/produits/${item.cb}.jpg" class="item-img" onerror="this.onerror=null; this.src='assets/images/placeholder.png'"></td>
                                <td><strong>${item.nom}</strong></td>
                                <td><span class="item-cb">${item.cb}</span></td>
                                <td class="price">${item.prix.toLocaleString()} FCFA</td>
                                <td>${item.quantity}</td>
                                <td class="price" style="text-align:right">${(item.prix * item.quantity).toLocaleString()} FCFA</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-box">
                        <span class="total-label">Total Estimé de la sélection</span>
                        <span class="total-amount">${total.toLocaleString()} FCFA</span>
                    </div>
                </div>

                <div class="disclaimer">
                    <strong>Note importante :</strong> Ce document est une aide à la vente facilitant l'établissement d'un devis officiel en magasin. 
                    Les prix et la disponibilité des stocks sont donnés à titre indicatif au moment de la consultation et doivent être validés 
                    par un conseiller ORCA Deco lors de votre passage en boutique.
                </div>

                <div class="no-print-zone">
                    <button class="print-btn" onclick="window.print()">Imprimer ou Enregistrer en PDF</button>
                    <p style="margin-top:10px; font-size:12px; color:#888;">Présentez ce document à un vendeur pour scanner rapidement vos articles.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }
}

// Initialisation globale
window.orcaCart = new OrcaCart();
