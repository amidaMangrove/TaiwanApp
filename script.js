class TaipeiSpotsApp {
    constructor() {
        this.spots = taipeiSpots;
        this.spotStatuses = JSON.parse(localStorage.getItem('taipeiSpotStatuses')) || {};
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.renderSpots();
        this.bindEvents();
    }

    bindEvents() {
        // フィルターボタンのイベント
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // モーダル関連のイベント
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('spotModal').addEventListener('click', (e) => {
            if (e.target.id === 'spotModal') {
                this.closeModal();
            }
        });

        // モーダル内のボタンイベント
        document.getElementById('modalWantBtn').addEventListener('click', () => {
            this.setSpotStatus(this.currentSpotId, 'want-to-visit');
        });

        document.getElementById('modalVisitedBtn').addEventListener('click', () => {
            this.setSpotStatus(this.currentSpotId, 'visited');
        });

        document.getElementById('modalResetBtn').addEventListener('click', () => {
            this.setSpotStatus(this.currentSpotId, null);
        });

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    renderSpots() {
        const spotsGrid = document.getElementById('spotsGrid');
        spotsGrid.innerHTML = '';

        const filteredSpots = this.getFilteredSpots();

        filteredSpots.forEach(spot => {
            const spotCard = this.createSpotCard(spot);
            spotsGrid.appendChild(spotCard);
        });
    }

    createSpotCard(spot) {
        const status = this.spotStatuses[spot.id];
        const card = document.createElement('div');
        card.className = `spot-card ${status || ''}`;
        card.addEventListener('click', () => this.openModal(spot));

        card.innerHTML = `
            <img src="${spot.image}" alt="${spot.name}" class="spot-image" 
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'">
            <div class="spot-info">
                <h3 class="spot-title">${spot.name}</h3>
                <p class="spot-description">${this.truncateText(spot.description, 80)}</p>
                ${status ? `<span class="spot-status ${status}">${this.getStatusText(status)}</span>` : ''}
            </div>
        `;

        return card;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    getStatusText(status) {
        switch (status) {
            case 'visited':
                return '行った';
            case 'want-to-visit':
                return '行きたい';
            default:
                return '';
        }
    }

    getFilteredSpots() {
        if (this.currentFilter === 'all') {
            return this.spots;
        }
        return this.spots.filter(spot => this.spotStatuses[spot.id] === this.currentFilter);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // ボタンのアクティブ状態を更新
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.renderSpots();
    }

    openModal(spot) {
        this.currentSpotId = spot.id;
        const modal = document.getElementById('spotModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        modalImage.src = spot.image;
        modalImage.alt = spot.name;
        modalImage.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop';
        };
        modalTitle.textContent = spot.name;
        modalDescription.textContent = spot.description;

        // ボタンの状態を更新
        this.updateModalButtons(spot.id);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('spotModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentSpotId = null;
    }

    updateModalButtons(spotId) {
        const status = this.spotStatuses[spotId];
        const wantBtn = document.getElementById('modalWantBtn');
        const visitedBtn = document.getElementById('modalVisitedBtn');
        const resetBtn = document.getElementById('modalResetBtn');

        // ボタンのスタイルをリセット
        wantBtn.style.opacity = status === 'want-to-visit' ? '0.6' : '1';
        visitedBtn.style.opacity = status === 'visited' ? '0.6' : '1';
        resetBtn.style.display = status ? 'block' : 'none';
    }

    setSpotStatus(spotId, status) {
        if (status) {
            this.spotStatuses[spotId] = status;
        } else {
            delete this.spotStatuses[spotId];
        }

        // ローカルストレージに保存
        localStorage.setItem('taipeiSpotStatuses', JSON.stringify(this.spotStatuses));

        // UIを更新
        this.renderSpots();
        this.updateModalButtons(spotId);
        
        // モーダルを閉じる
        setTimeout(() => {
            this.closeModal();
        }, 300);
    }
}

// アプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    new TaipeiSpotsApp();
});