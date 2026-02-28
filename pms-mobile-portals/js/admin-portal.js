// PMS Admin Client
const API_BASE_URL = 'http://localhost:3000/api';
const API_ROOT = API_BASE_URL.replace(/\/api$/, '');
const DEMO_ADMIN_CREDENTIALS = {
    username: 'admin_pm',
    password: 'password123'
};
const DEMO_ADMIN_ACCOUNTS = [
    { label: 'Admin PM', username: 'admin_pm', password: 'password123' },
    { label: 'System Admin', username: 'admin', password: 'Admin123!@#' }
];

// Simplified ApiClient reuse
class ApiClient {
    static get token() {
        return localStorage.getItem('pms_admin_token');
    }

    static set token(value) {
        if (value) {
            localStorage.setItem('pms_admin_token', value);
        } else {
            localStorage.removeItem('pms_admin_token');
        }
    }

    static async ensureAuth() {
        if (this.token) return this.token;
        const creds = window.ADMIN_PORTAL_DEMO_CREDS || DEMO_ADMIN_CREDENTIALS;
        const response = await fetch(`${API_ROOT}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });
        if (!response.ok) {
            throw new Error('Admin auto-login failed');
        }
        const data = await response.json();
        const token = data.accessToken || data.access_token;
        if (!token) throw new Error('Missing access token');
        this.token = token;
        return token;
    }

    static async request(endpoint, options = {}, retry = true) {
        await this.ensureAuth();
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
            ...options.headers
        };
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        if (response.status === 401 && retry) {
            this.token = null;
            return this.request(endpoint, options, false);
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed: ${response.status}`);
        }
        return response.json();
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
}

const AdminApp = {
    state: {
        property: null,
        stats: null,
        units: [],
        inspections: [],
        tasks: [],
        unitFilters: {
            search: '',
            status: 'all'
        }
    },

    async init() {
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        this.setupNavigation();
        this.setupUnitFilters();
        this.setupInteractions();
        
        try {
            this.renderDemoAccountSwitcher();
            await ApiClient.ensureAuth();
            await this.loadDashboard();
        } catch (e) {
            console.error("Admin load failed", e);
        }
    },

    setupNavigation() {
        // Expose showPage globally for HTML onclick handlers
        window.showPage = (pageName) => {
            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            // Show selected
            document.getElementById('page-' + pageName).classList.add('active');
            
            // Update nav state
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.remove('active');
                n.classList.add('text-muted-foreground'); // Reset all to inactive color
                
                // If this nav item targets the current page
                if(n.getAttribute('onclick')?.includes(`'${pageName}'`)) {
                    n.classList.add('active');
                    n.classList.remove('text-muted-foreground'); // Highlight active
                }
            });

            // Lazy load data for specific pages
            if (pageName === 'units') this.loadUnits();
            if (pageName === 'inspections') this.loadInspections();
        };
    },

    setupUnitFilters() {
        const searchInput = document.querySelector('#page-units input[type="text"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.unitFilters.search = e.target.value.toLowerCase();
                this.renderUnitsList();
            });
        }

        const filterContainer = document.querySelector('#page-units .overflow-x-auto');
        if (filterContainer) {
            const buttons = filterContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update UI
                    buttons.forEach(b => {
                        b.classList.remove('bg-primary', 'text-white');
                        b.classList.add('bg-surface', 'border', 'border-border', 'text-xs');
                    });
                    btn.classList.remove('bg-surface', 'border', 'border-border');
                    btn.classList.add('bg-primary', 'text-white');

                    // Update State
                    const text = btn.textContent.toLowerCase();
                    if (text.includes('all')) this.state.unitFilters.status = 'all';
                    else if (text.includes('occupied')) this.state.unitFilters.status = 'occupied';
                    else if (text.includes('vacant')) this.state.unitFilters.status = 'vacant';
                    else if (text.includes('late')) this.state.unitFilters.status = 'late_rent';
                    
                    this.renderUnitsList();
                });
            });
        }
    },

    setupInteractions() {
        // AI Inspection Button
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiBtn = buttons.find(b => b.textContent.includes('Start AI Inspection'));
        if (aiBtn) {
            aiBtn.addEventListener('click', () => {
                // In a real app, this would open the camera or file picker
                const confirm = window.confirm("Start AI Inspection?\n\nThis would open the camera to capture photos for analysis.");
                if (confirm) {
                    setTimeout(() => alert("Photos processed! Work plan generated."), 1000);
                }
            });
        }

        // Sign Out
        const signOutBtn = buttons.find(b => b.textContent.includes('Sign Out'));
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                if(confirm('Are you sure you want to sign out?')) {
                    ApiClient.token = null;
                    window.location.reload();
                }
            });
        }

        // Generic "Not Implemented" for More page grid
        const moreGrid = document.querySelector('#page-more .grid');
        if (moreGrid) {
            moreGrid.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const feature = btn.querySelector('span')?.textContent;
                    alert(`${feature} feature coming soon!`);
                });
            });
        }
    },

    async loadDashboard() {
        const [prop, stats, tasks] = await Promise.all([
            ApiClient.get('/properties/current'),
            ApiClient.get('/properties/stats'),
            ApiClient.get('/tasks/priority')
        ]);

        this.state.property = prop;
        this.state.stats = stats;
        this.state.tasks = tasks.data;

        this.renderPropertyHeader(prop);
        this.renderStats(stats);
        this.renderTasks(tasks.data);
    },

    renderDemoAccountSwitcher() {
        const header = document.querySelector('header .flex.items-center.gap-3')?.parentElement;
        if (!header || header.querySelector('.demo-switcher')) return;

        const current = localStorage.getItem('pms_last_demo_admin') || DEMO_ADMIN_ACCOUNTS[0].username;
        const setAccount = (username) => {
            const acct = DEMO_ADMIN_ACCOUNTS.find(a => a.username === username);
            if (!acct) return;
            window.ADMIN_PORTAL_DEMO_CREDS = { username: acct.username, password: acct.password };
            localStorage.setItem('pms_last_demo_admin', acct.username);
        };
        setAccount(current);

        const createSelect = () => {
            const select = document.createElement('select');
            select.className = 'text-xs bg-transparent focus:outline-none';
            DEMO_ADMIN_ACCOUNTS.forEach(acct => {
                const option = document.createElement('option');
                option.value = acct.username;
                option.textContent = acct.label;
                select.appendChild(option);
            });
            select.value = localStorage.getItem('pms_last_demo_admin') || current;
            return select;
        };

        const handleSwitch = (username) => {
            const acct = DEMO_ADMIN_ACCOUNTS.find(a => a.username === username);
            if (!acct) return;
            window.ADMIN_PORTAL_DEMO_CREDS = { username: acct.username, password: acct.password };
            ApiClient.token = null;
            localStorage.setItem('pms_last_demo_admin', acct.username);
            window.location.reload();
        };

        const panel = document.createElement('div');
        panel.className = 'demo-switcher hidden sm:flex items-center gap-2 bg-white/80 border border-border rounded-xl px-2 py-1 shadow-sm';
        const desktopSelect = createSelect();
        const button = document.createElement('button');
        button.textContent = 'Switch';
        button.className = 'text-xs font-semibold text-accent hover:underline';
        button.addEventListener('click', () => handleSwitch(desktopSelect.value));
        panel.appendChild(desktopSelect);
        panel.appendChild(button);
        header.appendChild(panel);

        const mobilePanel = document.createElement('div');
        mobilePanel.className = 'demo-switcher-mobile sm:hidden fixed bottom-24 right-4 z-40 bg-white/95 border border-border rounded-2xl shadow-lg p-3 flex flex-col gap-2 text-xs';
        const title = document.createElement('span');
        title.className = 'font-semibold text-foreground';
        title.textContent = 'Demo admin';
        const mobileSelect = createSelect();
        mobileSelect.className = 'bg-muted/50 rounded-lg px-2 py-1 text-xs';
        const mobileButton = document.createElement('button');
        mobileButton.textContent = 'Switch account';
        mobileButton.className = 'w-full bg-accent text-white rounded-lg py-1 font-semibold';
        mobileButton.addEventListener('click', () => handleSwitch(mobileSelect.value));
        mobilePanel.appendChild(title);
        mobilePanel.appendChild(mobileSelect);
        mobilePanel.appendChild(mobileButton);
        document.body.appendChild(mobilePanel);
    },

    renderPropertyHeader(prop) {
        // Update the big property switcher button text
        const container = document.querySelector('#page-dashboard button .text-left');
        if (container) {
            container.innerHTML = `
                <p class="font-medium text-sm">${prop.name}</p>
                <p class="text-xs text-muted-foreground">${prop.unitsCount} units • ${prop.location}</p>
            `;
        }
    },

    renderStats(stats) {
        // Main stats cards (Occupancy, Rent)
        // We select by context to be safe
        const dashboard = document.getElementById('page-dashboard');
        const largeStats = dashboard.querySelectorAll('.text-2xl.font-bold');
        
        if (largeStats[0]) largeStats[0].textContent = `${stats.occupancy.value}%`;
        if (largeStats[1]) largeStats[1].textContent = `$${(stats.rentCollected.value / 1000).toFixed(1)}K`;

        // Small stats row (Late Rent, Maint, Vacant)
        const smallStats = dashboard.querySelectorAll('.grid.grid-cols-3 .text-lg');
        if (smallStats[0]) smallStats[0].textContent = stats.lateRentCount;
        if (smallStats[1]) smallStats[1].textContent = stats.openMaintenanceCount;
        if (smallStats[2]) smallStats[2].textContent = stats.vacantUnitsCount;
    },

    renderTasks(tasks) {
        // Find the "Priority Tasks" container
        // It's under the h2 "Priority Tasks"
        const header = Array.from(document.querySelectorAll('h2')).find(h => h.textContent === 'Priority Tasks');
        const container = header?.nextElementSibling?.nextElementSibling || header?.parentElement?.querySelector('.space-y-3');

        if (!container) return;
        
        container.innerHTML = ''; // Clear static HTML

        tasks.forEach(task => {
            let icon = 'alert-circle', color = 'blue', badgeColor = 'blue';

            // Map task types to visual styles
            if (task.type === 'maintenance_approval') { 
                icon = 'alert-triangle'; 
                color = 'red'; 
                badgeColor = 'red';
            } else if (task.type === 'lease_renewal') { 
                icon = 'file-signature'; 
                color = 'blue'; 
                badgeColor = 'amber';
            } else if (task.type === 'inspection_due') { 
                icon = 'clipboard-check'; 
                color = 'purple'; 
                badgeColor = 'purple';
            }

            // Generate Action Buttons
            const buttonsHtml = task.actions.map((action, i) => {
                const isPrimary = i === 0;
                const bgClass = isPrimary ? `bg-${badgeColor}-600 text-white` : 'border border-border bg-transparent';
                return `<button class="px-4 py-2 ${bgClass} rounded-xl text-xs font-semibold touch-feedback">${action}</button>`;
            }).join('');

            const html = `
            <div class="bg-surface rounded-xl p-4 border border-border card-hover">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-${badgeColor}-100 flex items-center justify-center shrink-0">
                  <i data-lucide="${icon}" class="w-5 h-5 text-${badgeColor}-600"></i>
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium text-sm">${task.title}</p>
                      <p class="text-xs text-muted-foreground">${task.subtitle}</p>
                    </div>
                    <span class="px-2 py-1 bg-${badgeColor}-100 text-${badgeColor}-700 text-xs rounded-full font-medium">${task.badge}</span>
                  </div>
                  <p class="text-xs text-foreground mt-2">${task.meta}</p>
                  <div class="mt-3 flex items-center gap-2">
                    ${buttonsHtml}
                  </div>
                </div>
              </div>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
        
        if (window.lucide) lucide.createIcons();
    },

    async loadInspections() {
        // If already loaded, maybe skip? For now, refresh always to get latest state
        const res = await ApiClient.get('/inspections');
        this.state.inspections = res.data;
        this.renderInspections();
    },

    renderInspections() {
        const containers = document.querySelectorAll('#page-inspections .space-y-3');
        const upcomingEl = containers[0];
        const completedEl = containers[1];
        
        if (!upcomingEl || !completedEl) return;

        upcomingEl.innerHTML = '';
        completedEl.innerHTML = '';

        const upcoming = this.state.inspections.filter(i => i.status !== 'completed').sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        const completed = this.state.inspections.filter(i => i.status === 'completed').sort((a,b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

        const renderItem = (insp, isCompleted) => {
            const date = new Date(insp.scheduledDate);
            const month = date.toLocaleString('default', { month: 'short' });
            const day = date.getDate();
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const unit = insp.unit || 'Unit 4B'; 
            const tenant = insp.tenant || 'Jordan Davis';
            
            let bgDate = 'bg-accent/10';
            let textDate = 'text-accent';
            let borderDate = 'border-accent/20';

            if (isCompleted) {
                bgDate = 'bg-green-100';
                textDate = 'text-green-600';
                borderDate = 'border-transparent';
            } else if (insp.type.toLowerCase().includes('move')) {
                bgDate = 'bg-blue-50';
                textDate = 'text-blue-600';
                borderDate = 'border-blue-200';
            }

            return `
            <div class="bg-surface rounded-xl p-4 border border-border card-hover ${isCompleted ? 'opacity-75' : ''}">
              <div class="flex items-start gap-3">
                <div class="w-14 h-16 rounded-xl ${bgDate} flex flex-col items-center justify-center shrink-0 border ${borderDate}">
                  <span class="text-xs font-semibold ${textDate} uppercase">${month}</span>
                  <span class="text-xl font-bold ${textDate}">${day}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-semibold text-sm">${insp.type} Inspection</p>
                      <p class="text-xs text-muted-foreground">${unit} • ${tenant}</p>
                    </div>
                    ${isCompleted ? '<span class="text-xs text-green-600 font-medium">Passed</span>' : ''}
                  </div>
                  <p class="text-xs text-muted-foreground mt-1">${isCompleted ? date.toLocaleDateString() : time + ' • ' + (insp.durationMinutes || 30) + ' min'}</p>
                  ${!isCompleted ? `
                  <div class="mt-3 flex items-center gap-2">
                    <button class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium touch-feedback">Start</button>
                    <button class="px-3 py-1.5 border border-border rounded-lg text-xs font-medium touch-feedback">Reschedule</button>
                  </div>` : ''}
                </div>
                ${isCompleted ? `<div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 ml-auto"><i data-lucide="check" class="w-5 h-5 text-green-600"></i></div>` : ''}
              </div>
            </div>`;
        };

        upcoming.forEach(insp => {
            upcomingEl.insertAdjacentHTML('beforeend', renderItem(insp, false));
        });

        completed.forEach(insp => {
            completedEl.insertAdjacentHTML('beforeend', renderItem(insp, true));
        });

        if (window.lucide) lucide.createIcons();
    },

    async loadUnits() {
        const res = await ApiClient.get('/units');
        this.state.units = res.data;
        this.renderUnitsList();
    },

    renderUnitsList() {
        const container = document.querySelector('#page-units .space-y-3');
        if (!container) return;
        
        container.innerHTML = '';

        const filter = this.state.unitFilters;
        const filteredUnits = this.state.units.filter(unit => {
            // Apply Search
            if (filter.search && !unit.number.toLowerCase().includes(filter.search) && 
                !(unit.tenant || '').toLowerCase().includes(filter.search)) return false;
            
            // Apply Status Filter
            if (filter.status !== 'all' && unit.status !== filter.status) return false;
            
            return true;
        });

        filteredUnits.forEach(unit => {
            let statusBadge = '';
            let borderColor = 'border-border';
            let iconBg = 'bg-primary';
            let iconText = 'text-white';
            
            if (unit.status === 'occupied') {
                statusBadge = '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Current</span>';
            } else if (unit.status === 'late_rent') {
                statusBadge = '<span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Late</span>';
                iconBg = 'bg-red-500';
            } else if (unit.status === 'vacant') {
                statusBadge = '<span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Available</span>';
                iconBg = 'bg-slate-200';
                iconText = 'text-slate-600';
                borderColor = 'border-dashed border-border';
            }

            const html = `
            <div class="bg-surface rounded-xl p-4 border ${borderColor} card-hover">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="w-12 h-12 rounded-xl ${iconBg} ${iconText} flex items-center justify-center font-bold text-lg">${unit.number}</span>
                  <div>
                    <p class="font-semibold text-sm ${unit.status === 'vacant' ? 'text-muted-foreground' : ''}">${unit.tenant || 'Vacant'}</p>
                    <p class="text-xs text-muted-foreground">${unit.status === 'vacant' ? 'Market: ' : ''}$${unit.rent || unit.marketRent}/mo</p>
                  </div>
                </div>
                ${statusBadge}
              </div>
              
               <div class="flex items-center gap-2 pt-2 border-t border-border ${unit.status === 'vacant' ? 'border-dashed' : ''}">
                <button class="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-medium touch-feedback">
                  Details
                </button>
                <button class="flex-1 py-2 border border-border rounded-lg text-xs font-medium touch-feedback">
                  Contact
                </button>
              </div>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
        
        if (window.lucide) lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});
