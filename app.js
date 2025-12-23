// Application State
let currentProjectIndex = 0;
let savedProjects = [];
let projectsPool = [...selfHostedProjects];
let currentCard = null;

// AI Guide Messages
const aiMessages = [
    "Welcome! Swipe right to save projects you like, or left to skip them. Let me guide you through amazing self-hosted tools!",
    "Great choice! This project is perfect for improving your self-hosted setup.",
    "Interesting! Let's find more projects that match your interests.",
    "This one's popular in the community. Over {stars} stars on GitHub!",
    "Looking for {category} solutions? This might be exactly what you need.",
    "You've saved {count} projects so far. Keep exploring!",
    "Pro tip: Check the GitHub repo for documentation and community support.",
    "Many users love this for its {tag} capabilities.",
    "This project has an active community and regular updates.",
    "Consider the license type when choosing projects for your setup."
];

// Initialize the application
function init() {
    loadSavedProjects();
    updateSavedCount();
    shuffleProjects();
    showNextCard();
    setupEventListeners();
}

// Load saved projects from localStorage
function loadSavedProjects() {
    const saved = localStorage.getItem('wallestars_saved');
    if (saved) {
        savedProjects = JSON.parse(saved);
    }
}

// Save projects to localStorage
function saveSavedProjects() {
    localStorage.setItem('wallestars_saved', JSON.stringify(savedProjects));
    updateSavedCount();
}

// Update saved count display
function updateSavedCount() {
    document.getElementById('savedCount').textContent = savedProjects.length;
}

// Shuffle projects array
function shuffleProjects() {
    for (let i = projectsPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [projectsPool[i], projectsPool[j]] = [projectsPool[j], projectsPool[i]];
    }
}

// Create a project card element
function createCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;
    
    card.innerHTML = `
        <div class="card-category">${project.category}</div>
        <h2 class="card-title">${project.name}</h2>
        <p class="card-description">${project.description}</p>
        <div class="card-tags">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="card-meta">
            <span class="stars">⭐ ${project.stars}</span>
            <a href="${project.url}" target="_blank" class="card-link" onclick="event.stopPropagation()">View on GitHub →</a>
        </div>
    `;
    
    return card;
}

// Show the next card
function showNextCard() {
    if (currentProjectIndex >= projectsPool.length) {
        showNoMoreCards();
        return;
    }
    
    const project = projectsPool[currentProjectIndex];
    const cardStack = document.getElementById('cardStack');
    
    // Remove old cards
    cardStack.innerHTML = '';
    
    // Create new card
    currentCard = createCard(project);
    cardStack.appendChild(currentCard);
    
    // Add touch/mouse event listeners
    addSwipeListeners(currentCard);
    
    // Update AI guide message
    updateAIMessage(project);
}

// Add swipe listeners to card
function addSwipeListeners(card) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    const onStart = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        card.classList.add('dragging');
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        
        currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        const rotation = diff / 20;
        
        card.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        card.style.opacity = 1 - Math.abs(diff) / 500;
    };
    
    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        card.classList.remove('dragging');
        const diff = currentX - startX;
        
        if (Math.abs(diff) > 150) {
            // Swipe threshold reached
            if (diff > 0) {
                handleSave();
            } else {
                handleSkip();
            }
        } else {
            // Reset card position
            card.style.transform = '';
            card.style.opacity = '';
        }
    };
    
    // Mouse events
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    
    // Touch events
    card.addEventListener('touchstart', onStart);
    card.addEventListener('touchmove', onMove);
    card.addEventListener('touchend', onEnd);
}

// Handle save action
function handleSave() {
    const project = projectsPool[currentProjectIndex];
    
    // Check if already saved
    if (!savedProjects.find(p => p.id === project.id)) {
        savedProjects.push(project);
        saveSavedProjects();
    }
    
    animateCardRemoval('swipe-right');
    updateAIMessage(project, 'saved');
}

// Handle skip action
function handleSkip() {
    animateCardRemoval('swipe-left');
    updateAIMessage(null, 'skipped');
}

// Animate card removal
function animateCardRemoval(direction) {
    if (currentCard) {
        currentCard.classList.add('removed', direction);
        
        setTimeout(() => {
            currentProjectIndex++;
            showNextCard();
        }, 500);
    }
}

// Update AI guide message
function updateAIMessage(project, action) {
    const aiText = document.getElementById('aiText');
    let message = '';
    
    if (action === 'saved') {
        message = `Great choice! ${project.name} has been saved to your collection. You now have ${savedProjects.length} saved project${savedProjects.length !== 1 ? 's' : ''}.`;
    } else if (action === 'skipped') {
        message = "No worries! Let's find something else that matches your needs.";
    } else if (project) {
        // Random contextual message
        const messages = [
            `${project.name} is a popular ${project.category} solution with ${project.stars} stars!`,
            `This ${project.category} tool is great for ${project.tags[0]} enthusiasts.`,
            `Looking for a ${project.category} solution? ${project.name} might be perfect for you!`,
            `${project.name} uses ${project.tags[0]} and has an active community.`,
            `Over ${project.stars} developers trust ${project.name} for their ${project.category} needs.`
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    } else {
        message = aiMessages[0];
    }
    
    aiText.textContent = message;
}

// Show no more cards message
function showNoMoreCards() {
    document.getElementById('cardStack').style.display = 'none';
    document.getElementById('noMoreCards').style.display = 'block';
}

// Restart the deck
function restartDeck() {
    currentProjectIndex = 0;
    shuffleProjects();
    document.getElementById('cardStack').style.display = 'block';
    document.getElementById('noMoreCards').style.display = 'none';
    showNextCard();
}

// Show saved projects modal
function showSavedModal() {
    const modal = document.getElementById('savedModal');
    const list = document.getElementById('savedProjectsList');
    
    if (savedProjects.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No Saved Projects Yet</h3>
                <p>Start swiping right on projects you like!</p>
            </div>
        `;
    } else {
        list.innerHTML = savedProjects.map(project => `
            <div class="saved-project-item" data-id="${project.id}">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div style="margin-top: 10px;">
                    <span class="tag">${project.category}</span>
                    <span class="stars" style="margin-left: 10px;">⭐ ${project.stars}</span>
                </div>
                <a href="${project.url}" target="_blank" class="card-link" style="display: inline-block; margin-top: 10px;">View on GitHub →</a>
                <button class="delete-btn" onclick="deleteSavedProject(${project.id})">Remove</button>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

// Delete saved project
function deleteSavedProject(projectId) {
    savedProjects = savedProjects.filter(p => p.id !== projectId);
    saveSavedProjects();
    showSavedModal(); // Refresh the list
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    // Action buttons
    document.getElementById('saveBtn').addEventListener('click', handleSave);
    document.getElementById('skipBtn').addEventListener('click', handleSkip);
    
    // Header buttons
    document.getElementById('viewSavedBtn').addEventListener('click', showSavedModal);
    document.getElementById('refreshBtn').addEventListener('click', restartDeck);
    document.getElementById('restartBtn').addEventListener('click', restartDeck);
    
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', () => closeModal('savedModal'));
    document.getElementById('closeDetailsModal').addEventListener('click', () => closeModal('detailsModal'));
    
    // Close modal on backdrop click
    document.getElementById('savedModal').addEventListener('click', (e) => {
        if (e.target.id === 'savedModal') {
            closeModal('savedModal');
        }
    });
    
    document.getElementById('detailsModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailsModal') {
            closeModal('detailsModal');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            handleSkip();
        } else if (e.key === 'ArrowRight') {
            handleSave();
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
