// js/chatbot.js
class OrcaChatbot {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.renderWidget();
        this.setupEventListeners();
        // Petit délai avant d'envoyer le premier message
        setTimeout(() => this.sendBotMessage("Bonjour ! Je suis l'assistant ORCA 🐳. Comment puis-je vous aider aujourd'hui ?"), 1000);
        setTimeout(() => this.showQuickReplies(), 1500);
    }

    renderWidget() {
        const html = `
            <div id="orca-chatbot-widget" class="chatbot-widget">
                <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Ouvrir le chat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <div id="chatbot-window" class="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-info">
                            <div class="chatbot-avatar">
                                <img src="assets/images/logo.png" alt="ORCA">
                            </div>
                            <h3>Assistant ORCA</h3>
                        </div>
                        <button id="chatbot-close" class="chatbot-close">&times;</button>
                    </div>
                    <div id="chatbot-messages" class="chatbot-messages">
                        <!-- Les messages apparaîtront ici -->
                    </div>
                    <div id="chatbot-quick-replies" class="chatbot-quick-replies"></div>
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" placeholder="Écrivez votre message...">
                        <button id="chatbot-send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const inputField = document.getElementById('chatbot-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());

        sendBtn.addEventListener('click', () => this.handleUserSubmit());
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserSubmit();
        });

        // Event delegation for quick replies
        document.getElementById('chatbot-quick-replies').addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply-btn')) {
                const text = e.target.textContent;
                const keyword = e.target.dataset.keyword;
                this.handleUserAction(text, keyword);
            }
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('chatbot-window');
        const toggleBtn = document.getElementById('chatbot-toggle');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatWindow.classList.add('active');
            toggleBtn.classList.add('hidden');
        } else {
            chatWindow.classList.remove('active');
            toggleBtn.classList.remove('hidden');
        }
    }

    handleUserSubmit() {
        const input = document.getElementById('chatbot-input');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this.appendMessage('user', text);
        this.processUserInput(text.toLowerCase());
    }

    handleUserAction(text, keyword) {
        document.getElementById('chatbot-quick-replies').innerHTML = ''; // Hide quick replies temporarily
        this.appendMessage('user', text);
        this.processUserInput(keyword.toLowerCase());
    }

    appendMessage(sender, text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message', `chat-message-${sender}`);
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    sendBotMessage(text) {
        this.appendMessage('bot', text);
    }

    sendBotTypingThenMessage(text, delay = 800) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('chat-message', 'chat-message-bot', 'typing-indicator');
        typingDiv.innerHTML = `<div class="message-content"><span>.</span><span>.</span><span>.</span></div>`;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();

        setTimeout(() => {
            typingDiv.remove();
            this.sendBotMessage(text);
            this.showQuickReplies();
        }, delay);
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showQuickReplies() {
        const container = document.getElementById('chatbot-quick-replies');
        container.innerHTML = `
            <button class="quick-reply-btn" data-keyword="livraison">🚚 Livraison & Montage</button>
            <button class="quick-reply-btn" data-keyword="horaires">🕒 Horaires</button>
            <button class="quick-reply-btn" data-keyword="adresses">📍 Adresses</button>
            <button class="quick-reply-btn" data-keyword="salon">🛋️ Chercher un meuble</button>
            <button class="quick-reply-btn" data-keyword="contact">📞 Nous contacter</button>
        `;
        this.scrollToBottom();
    }

    processUserInput(input) {
        // Normalisation (enlever les accents et mettre en minuscules)
        const normalizedInput = input.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        // Logique de mots-clés étendue
        if (normalizedInput.includes('livraison') || normalizedInput.includes('montage') || normalizedInput.includes('livrer') || normalizedInput.includes('monter')) {
            this.sendBotTypingThenMessage("Les livraisons se font à partir d'un achat de 500 000 Fr. CFA. 🚚<br><br>De plus, le montage des meubles se fait gratuitement au moment de la livraison par nos équipes spécialisées.");
        } 
        else if (normalizedInput.includes('horaire') || normalizedInput.includes('heure') || normalizedInput.includes('ouvert') || normalizedInput.includes('ferme')) {
            this.sendBotTypingThenMessage("Nos magasins sont ouverts du Lundi au Samedi, de 9h30 à 18h30 sans interruption. 🕒");
        }
        else if (normalizedInput.includes('adresse') || normalizedInput.includes('localisation') || normalizedInput.includes('ou etes vous') || normalizedInput.includes('magasin')) {
            this.sendBotTypingThenMessage("📍 **Brazzaville** : Rond point de la gare<br>📍 **Pointe Noire** : Av. Marien Ngouabi × Av. Simon Kimbango");
        }
        else if (normalizedInput.includes('devis') || normalizedInput.includes('panier') || normalizedInput.includes('commander') || normalizedInput.includes('prix')) {
            this.sendBotTypingThenMessage("Pour commander ou connaître les prix, vous pouvez ajouter vos articles à votre sélection en cliquant sur l'icône de panier, puis générer un devis automatiquement depuis la page Boutique ! 📄");
        }
        else if (normalizedInput.includes('salon') || normalizedInput.includes('canape') || normalizedInput.includes('fauteuil') || normalizedInput.includes('sofa')) {
            this.sendBotTypingThenMessage("Vous cherchez un salon ? 🛋️ Rendez-vous dans la rubrique 'Boutique' et tapez 'Salon' ou 'Canapé' dans la barre de recherche. Vous y découvrirez tous nos modèles !");
        }
        else if (normalizedInput.includes('chambre') || normalizedInput.includes('lit') || normalizedInput.includes('matelas') || normalizedInput.includes('armoire')) {
            this.sendBotTypingThenMessage("Pour aménager votre chambre 🛏️, visitez notre page 'Boutique' et filtrez par la catégorie 'Chambre à coucher'. Nous avons un large choix de lits et matelas !");
        }
        else if (normalizedInput.includes('table') || normalizedInput.includes('salle a manger') || normalizedInput.includes('chaise')) {
            this.sendBotTypingThenMessage("Nos ensembles de salle à manger 🪑 sont magnifiques ! Vous pouvez les trouver dans la 'Boutique' en cherchant 'Salle à manger' ou 'Chaise'.");
        }
        else if (normalizedInput.includes('deco') || normalizedInput.includes('tapis') || normalizedInput.includes('miroir') || normalizedInput.includes('lampe')) {
            this.sendBotTypingThenMessage("Nous avons un immense rayon décoration ✨ (tapis, luminaires, miroirs...). Allez faire un tour dans la Boutique pour voir nos articles !");
        }
        else if (normalizedInput.includes('contact') || normalizedInput.includes('telephone') || normalizedInput.includes('appeler') || normalizedInput.includes('numero')) {
            this.sendBotTypingThenMessage("Vous pouvez nous joindre par téléphone :<br>📞 Brazzaville : 06 903 49 46<br>📞 Pointe-Noire : 06 527 58 41");
        }
        else if (normalizedInput.includes('paiement') || normalizedInput.includes('payer') || normalizedInput.includes('carte') || normalizedInput.includes('espece')) {
            this.sendBotTypingThenMessage("Nous acceptons les paiements en espèces, par carte bancaire, et par virement bancaire directement en magasin. 💳");
        }
        else if (normalizedInput.includes('garantie') || normalizedInput.includes('retour') || normalizedInput.includes('sav') || normalizedInput.includes('casse')) {
            this.sendBotTypingThenMessage("Nos produits bénéficient d'une garantie selon leur catégorie. Pour toute question de Service Après-Vente (SAV), veuillez vous rapprocher de votre magasin muni de votre devis ou facture. 🛠️");
        }
        else if (normalizedInput.includes('merci') || normalizedInput.includes('super') || normalizedInput.includes('top') || normalizedInput.includes('genial')) {
            this.sendBotTypingThenMessage("C'est un plaisir ! 😊 Avez-vous besoin d'autre chose ?");
        }
        else if (normalizedInput.includes('bonjour') || normalizedInput.includes('salut') || normalizedInput.includes('coucou')) {
            this.sendBotTypingThenMessage("Bonjour ! Ravi de vous voir. Comment puis-je vous orienter ?");
        }
        else {
            this.sendBotTypingThenMessage("Je ne suis pas sûr de comprendre. 😅<br>Je suis un robot en apprentissage. Vous pouvez utiliser les boutons ci-dessous ou me demander des infos sur nos **horaires**, la **livraison** ou nos **meubles** !");
        }
    }
}

// Initialiser le chatbot au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.orcaChatbot = new OrcaChatbot();
});
