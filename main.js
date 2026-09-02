/* ═══════════════════════════════════════════════════
   BoB (Bull or Bear) — Main JavaScript
   Features: GSAP Animations, Wallet Connect,
   Staking UI, Admin Panel, Toast Notifications
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM Helpers ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ─── DOM References ───
  const loader = $('#loader');
  const loaderBarFill = $('#loader-bar-fill');
  const loaderPercent = $('#loader-percent');
  const navbar = $('#navbar');
  const bgAudio = $('#bg-audio');
  const soundToggle = $('#sound-toggle');
  const soundIconOn = $('#sound-icon-on');
  const soundIconOff = $('#sound-icon-off');
  const hamburger = $('#nav-hamburger');
  const navLinks = $('#nav-links');

  // Wallet
  const walletConnectBtn = $('#wallet-connect-btn');
  const walletConnectBtnMobile = $('#wallet-connect-btn-mobile');
  const walletBtnText = $('#wallet-btn-text');
  const walletBtnTextMobile = $('#wallet-btn-text-mobile');
  const walletModal = $('#wallet-modal');
  const walletInfoModal = $('#wallet-info-modal');
  const walletDisplayAddress = $('#wallet-display-address');
  const walletSolBalance = $('#wallet-sol-balance');
  const walletBobBalance = $('#wallet-bob-balance');
  const walletDisconnectBtn = $('#wallet-disconnect-btn');

  // Staking
  const stakingNotConnected = $('#staking-not-connected');
  const stakingConnected = $('#staking-connected');
  const stakingConnectBtn = $('#staking-connect-btn');
  const stakingAvailable = $('#staking-available');
  const stakingStaked = $('#staking-staked');
  const stakingRewards = $('#staking-rewards');
  const stakingAmount = $('#staking-amount');
  const stakingMaxBtn = $('#staking-max-btn');
  const stakeBtn = $('#stake-btn');
  const unstakeBtn = $('#unstake-btn');
  const stakingTimer = $('#staking-timer');

  // Admin
  const adminTrigger = $('#admin-trigger');
  const adminLoginModal = $('#admin-login-modal');
  const adminPassword = $('#admin-password');
  const adminLoginError = $('#admin-login-error');
  const adminLoginBtn = $('#admin-login-btn');
  const adminPanelModal = $('#admin-panel-modal');
  const adminCaInput = $('#admin-ca-input');
  const adminCaToggle = $('#admin-ca-toggle');
  const adminPromoInput = $('#admin-promo-input');
  const adminPromoToggle = $('#admin-promo-toggle');
  const adminGameUrl = $('#admin-game-url');
  const adminGameToggle = $('#admin-game-toggle');
  const adminTaglineInput = $('#admin-tagline-input');
  const adminTaglineSave = $('#admin-tagline-save');
  const adminSaveBtn = $('#admin-save-btn');
  const adminLogoutBtn = $('#admin-logout-btn');

  // Banners
  const promoBanner = $('#promo-banner');
  const promoBannerText = $('#promo-banner-text');
  const promoBannerClose = $('#promo-banner-close');
  const caBanner = $('#ca-banner');
  const caBannerAddress = $('#ca-banner-address');
  const caCopyBtn = $('#ca-copy-btn');

  // Game
  const gameEntryBtn = $('#game-entry-btn');
  const heroTagline = $('#hero-tagline');

  // Toast
  const toast = $('#toast');
  const toastText = $('#toast-text');

  // ─── State ───
  let isMuted = true;
  let isWalletConnected = false;
  let walletAddress = '';
  let isAdminLoggedIn = false;

  // Mock balances
  let mockSolBalance = 0;
  let mockBobBalance = 0;
  let mockStaked = 0;
  let mockRewards = 0;
  let selectedFaction = 'bull';

  // Admin password (SHA-256 hash of "bob2026")
  const ADMIN_PASS_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // placeholder

  /* ═══════════════════════════════════════════════
     UTILS
     ═══════════════════════════════════════════════ */
  function showToast(msg) {
    toastText.textContent = msg;
    toast.style.display = 'block';
    toast.classList.remove('fade-out');
    
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2500);
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function formatAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 4) + '...' + addr.slice(-4);
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // Simple password check (client-side — not meant to be secure, just a convenience)
  function checkPassword(pass) {
    return pass === 'bob2026';
  }

  /* ═══════════════════════════════════════════════
     1. LOADING SCREEN
     ═══════════════════════════════════════════════ */
  function simulateLoading() {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          loaderBarFill.style.width = '100%';
          loaderPercent.textContent = '100%';
          setTimeout(resolve, 300);
        } else {
          loaderBarFill.style.width = Math.round(progress) + '%';
          loaderPercent.textContent = Math.round(progress) + '%';
        }
      }, 80);
    });
  }

  /* ═══════════════════════════════════════════════
     2. GSAP SCROLL ANIMATIONS
     ═══════════════════════════════════════════════ */
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 80%',
      onEnter: () => navbar.classList.add('visible'),
      onLeaveBack: () => navbar.classList.remove('visible'),
    });

    $$('[data-anim]').forEach((el) => {
      const type = el.dataset.anim;
      const delay = el.style.getPropertyValue('--delay');
      const delayVal = delay ? parseFloat(delay) * 0.15 : 0;

      const fromVars = { opacity: 0 };
      const toVars = { opacity: 1, duration: 1, ease: 'power3.out', delay: delayVal };

      if (type === 'up') { fromVars.y = 50; toVars.y = 0; }
      else if (type === 'left') { fromVars.x = -50; toVars.x = 0; }
      else if (type === 'right') { fromVars.x = 50; toVars.x = 0; }
      else if (type === 'hero') { fromVars.y = 30; toVars.y = 0; }

      toVars.scrollTrigger = {
        trigger: el,
        start: type === 'hero' ? 'top 90%' : 'top 85%',
        toggleActions: 'play none none none',
      };

      gsap.fromTo(el, fromVars, toVars);
    });

    const heroContent = $('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        y: -80, opacity: 0, scale: 0.95,
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '50% top', scrub: 0.5 },
      });
    }

    const heroVideo = $('.hero-video');
    if (heroVideo) {
      gsap.to(heroVideo, {
        scale: 1.1,
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  /* ═══════════════════════════════════════════════
     3. AUDIO
     ═══════════════════════════════════════════════ */
  function initAudio() {
    if (!bgAudio || !soundToggle) return;
    bgAudio.volume = 0.3;
    bgAudio.muted = true;

    function updateIcon() {
      if (isMuted) {
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';
        soundToggle.classList.remove('active');
      } else {
        soundIconOn.style.display = 'block';
        soundIconOff.style.display = 'none';
        soundToggle.classList.add('active');
      }
    }

    soundToggle.addEventListener('click', () => {
      isMuted = !isMuted;
      if (!isMuted) {
        bgAudio.muted = false;
        bgAudio.play().catch(() => { isMuted = true; bgAudio.muted = true; updateIcon(); });
      } else {
        bgAudio.muted = true;
        bgAudio.pause();
      }
      updateIcon();
    });

    updateIcon();
  }

  /* ═══════════════════════════════════════════════
     4. MOBILE NAV
     ═══════════════════════════════════════════════ */
  function initMobileNav() {
    if (!hamburger || !navLinks) return;

    function toggleNav() {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    }

    hamburger.addEventListener('click', toggleNav);

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) toggleNav();
      });
    });
  }

  /* ═══════════════════════════════════════════════
     5. SMOOTH SCROLL
     ═══════════════════════════════════════════════ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════
     6. NAVBAR SCROLL EFFECT
     ═══════════════════════════════════════════════ */
  function initNavbarEffect() {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      navbar.style.background = s > 100 ? 'rgba(6, 6, 12, 0.85)' : 'rgba(6, 6, 12, 0.6)';
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
     7. INTERACTIVE HOVER EFFECTS
     ═══════════════════════════════════════════════ */
  function initInteractions() {
    $$('.faction-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const inner = card.querySelector('.faction-card-inner');
        if (inner) inner.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.faction-card-inner');
        if (inner) inner.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════
     8. MODAL SYSTEM
     ═══════════════════════════════════════════════ */
  function initModals() {
    // Close buttons
    $$('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.close;
        if (id) closeModal(id);
      });
    });

    // Click outside modal
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
      });
    });
  }

  /* ═══════════════════════════════════════════════
     9. WALLET CONNECTION
     ═══════════════════════════════════════════════ */
  function initWallet() {
    // Detect Phantom
    const hasPhantom = window.solana && window.solana.isPhantom;
    const phantomStatus = $('#phantom-status');
    if (phantomStatus) {
      phantomStatus.textContent = hasPhantom ? 'Detected ✓' : 'Install';
      phantomStatus.style.color = hasPhantom ? 'var(--green)' : 'var(--text-dim)';
    }

    function openWalletModal() {
      if (isWalletConnected) {
        updateWalletInfoModal();
        openModal('wallet-info-modal');
      } else {
        openModal('wallet-modal');
      }
    }

    walletConnectBtn.addEventListener('click', openWalletModal);
    walletConnectBtnMobile.addEventListener('click', openWalletModal);
    stakingConnectBtn.addEventListener('click', () => {
      if (!isWalletConnected) openModal('wallet-modal');
    });

    // Wallet options
    $$('.wallet-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const wallet = opt.dataset.wallet;
        connectWallet(wallet);
      });
    });

    // Disconnect
    walletDisconnectBtn.addEventListener('click', disconnectWallet);
  }

  function connectWallet(walletType) {
    const hasPhantom = window.solana && window.solana.isPhantom;

    if (walletType === 'phantom' && hasPhantom) {
      // Try real Phantom connection
      window.solana.connect()
        .then((resp) => {
          walletAddress = resp.publicKey.toString();
          onWalletConnected(walletAddress);
        })
        .catch(() => {
          // User rejected — fallback to mock
          mockConnect(walletType);
        });
    } else {
      // Mock connection for demo
      mockConnect(walletType);
    }
  }

  function mockConnect(walletType) {
    // Generate a mock Solana-like address
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let addr = '';
    for (let i = 0; i < 44; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
    walletAddress = addr;
    onWalletConnected(walletAddress);
    showToast(`Connected via ${walletType} (Demo Mode)`);
  }

  function onWalletConnected(addr) {
    isWalletConnected = true;
    walletAddress = addr;

    // Generate mock balances
    mockSolBalance = +(Math.random() * 10 + 0.5).toFixed(4);
    mockBobBalance = Math.floor(Math.random() * 500000 + 10000);
    mockStaked = 0;
    mockRewards = Math.floor(Math.random() * 1000);

    // Update UI
    const short = formatAddress(addr);
    walletBtnText.textContent = short;
    walletBtnTextMobile.textContent = short;
    walletConnectBtn.classList.add('connected');
    walletConnectBtnMobile.classList.add('connected');

    // Show staking connected state
    stakingNotConnected.style.display = 'none';
    stakingConnected.style.display = 'block';
    updateStakingUI();

    closeModal('wallet-modal');
  }

  function disconnectWallet() {
    isWalletConnected = false;
    walletAddress = '';

    walletBtnText.textContent = 'Connect Wallet';
    walletBtnTextMobile.textContent = 'Connect';
    walletConnectBtn.classList.remove('connected');
    walletConnectBtnMobile.classList.remove('connected');

    stakingNotConnected.style.display = 'block';
    stakingConnected.style.display = 'none';

    closeModal('wallet-info-modal');
    showToast('Wallet disconnected');
  }

  function updateWalletInfoModal() {
    walletDisplayAddress.textContent = walletAddress;
    walletSolBalance.textContent = mockSolBalance + ' SOL';
    walletBobBalance.textContent = formatNumber(mockBobBalance) + ' BoB';
  }

  function updateStakingUI() {
    stakingAvailable.textContent = formatNumber(mockBobBalance) + ' BoB';
    stakingStaked.textContent = formatNumber(mockStaked) + ' BoB';
    stakingRewards.textContent = formatNumber(mockRewards) + ' BoB';
  }

  /* ═══════════════════════════════════════════════
     10. STAKING INTERACTIONS
     ═══════════════════════════════════════════════ */
  function initStaking() {
    // Faction choose
    $$('.staking-faction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.staking-faction-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFaction = btn.dataset.side;
      });
    });

    // Max button
    stakingMaxBtn.addEventListener('click', () => {
      stakingAmount.value = mockBobBalance;
    });

    // Quick amounts
    $$('.staking-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct);
        stakingAmount.value = Math.floor(mockBobBalance * pct / 100);
      });
    });

    // Stake
    stakeBtn.addEventListener('click', () => {
      const amt = parseFloat(stakingAmount.value);
      if (!amt || amt <= 0) {
        showToast('Enter a valid amount');
        return;
      }
      if (amt > mockBobBalance) {
        showToast('Insufficient balance');
        return;
      }

      mockBobBalance -= amt;
      mockStaked += amt;
      stakingAmount.value = '';
      updateStakingUI();
      showToast(`Staked ${formatNumber(amt)} BoB as ${selectedFaction.toUpperCase()}! ⚡`);
    });

    // Unstake
    unstakeBtn.addEventListener('click', () => {
      if (mockStaked <= 0) {
        showToast('Nothing to unstake');
        return;
      }
      const returned = mockStaked + mockRewards;
      mockBobBalance += returned;
      const msg = `Unstaked ${formatNumber(mockStaked)} BoB + ${formatNumber(mockRewards)} rewards`;
      mockStaked = 0;
      mockRewards = 0;
      updateStakingUI();
      showToast(msg);
    });

    // Timer countdown (mock)
    initStakingTimer();
  }

  function initStakingTimer() {
    let totalSeconds = 5 * 3600 + 32 * 60 + 18; // 05:32:18
    setInterval(() => {
      totalSeconds--;
      if (totalSeconds <= 0) totalSeconds = 6 * 3600; // reset
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      stakingTimer.textContent = 
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
    }, 1000);
  }

  /* ═══════════════════════════════════════════════
     11. ADMIN PANEL
     ═══════════════════════════════════════════════ */
  function initAdmin() {
    // Admin trigger
    adminTrigger.addEventListener('click', () => {
      if (isAdminLoggedIn) {
        loadAdminSettings();
        openModal('admin-panel-modal');
      } else {
        openModal('admin-login-modal');
      }
    });

    // Login
    adminLoginBtn.addEventListener('click', attemptAdminLogin);
    adminPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptAdminLogin();
    });

    // Toggle buttons
    adminCaToggle.addEventListener('click', () => toggleAdminFeature('ca'));
    adminPromoToggle.addEventListener('click', () => toggleAdminFeature('promo'));
    adminGameToggle.addEventListener('click', () => toggleAdminFeature('game'));

    // Tagline save
    adminTaglineSave.addEventListener('click', () => {
      const val = adminTaglineInput.value.trim();
      if (val) {
        heroTagline.textContent = val;
        saveAdminSettings();
        showToast('Tagline updated');
      }
    });

    // Save all
    adminSaveBtn.addEventListener('click', () => {
      saveAdminSettings();
      applyAdminSettings();
      showToast('Settings saved! 💾');
    });

    // Logout
    adminLogoutBtn.addEventListener('click', () => {
      isAdminLoggedIn = false;
      localStorage.removeItem('bob_admin_session');
      closeModal('admin-panel-modal');
      showToast('Admin logged out');
    });

    // Promo banner close
    promoBannerClose.addEventListener('click', () => {
      promoBanner.style.display = 'none';
    });

    // CA copy
    caCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(caBannerAddress.textContent)
        .then(() => showToast('CA copied! 📋'))
        .catch(() => showToast('Failed to copy'));
    });

    // Check if admin session exists
    if (localStorage.getItem('bob_admin_session') === 'active') {
      isAdminLoggedIn = true;
    }

    // Apply saved settings on load
    applyAdminSettings();
  }

  function attemptAdminLogin() {
    const pass = adminPassword.value;
    if (checkPassword(pass)) {
      isAdminLoggedIn = true;
      localStorage.setItem('bob_admin_session', 'active');
      adminPassword.value = '';
      adminLoginError.style.display = 'none';
      closeModal('admin-login-modal');
      loadAdminSettings();
      openModal('admin-panel-modal');
      showToast('Admin access granted ✅');
    } else {
      adminLoginError.style.display = 'block';
      adminPassword.value = '';
      adminPassword.focus();
    }
  }

  function toggleAdminFeature(feature) {
    const settings = getAdminSettings();
    
    if (feature === 'ca') {
      settings.caVisible = !settings.caVisible;
      adminCaToggle.textContent = settings.caVisible ? 'Hide' : 'Show';
      adminCaToggle.classList.toggle('active', settings.caVisible);
    } else if (feature === 'promo') {
      settings.promoVisible = !settings.promoVisible;
      adminPromoToggle.textContent = settings.promoVisible ? 'Hide' : 'Show';
      adminPromoToggle.classList.toggle('active', settings.promoVisible);
    } else if (feature === 'game') {
      settings.gameVisible = !settings.gameVisible;
      adminGameToggle.textContent = settings.gameVisible ? 'Hide' : 'Show';
      adminGameToggle.classList.toggle('active', settings.gameVisible);
    }

    // Save + apply immediately
    settings.ca = adminCaInput.value.trim();
    settings.promo = adminPromoInput.value.trim();
    settings.gameUrl = adminGameUrl.value.trim();
    settings.tagline = adminTaglineInput.value.trim();
    localStorage.setItem('bob_admin_settings', JSON.stringify(settings));
    applyAdminSettings();
  }

  function getAdminSettings() {
    try {
      return JSON.parse(localStorage.getItem('bob_admin_settings')) || {};
    } catch {
      return {};
    }
  }

  function saveAdminSettings() {
    const settings = {
      ca: adminCaInput.value.trim(),
      caVisible: adminCaToggle.classList.contains('active'),
      promo: adminPromoInput.value.trim(),
      promoVisible: adminPromoToggle.classList.contains('active'),
      gameUrl: adminGameUrl.value.trim(),
      gameVisible: adminGameToggle.classList.contains('active'),
      tagline: adminTaglineInput.value.trim(),
    };
    localStorage.setItem('bob_admin_settings', JSON.stringify(settings));
  }

  function loadAdminSettings() {
    const settings = getAdminSettings();
    
    adminCaInput.value = settings.ca || '';
    adminCaToggle.textContent = settings.caVisible ? 'Hide' : 'Show';
    adminCaToggle.classList.toggle('active', !!settings.caVisible);

    adminPromoInput.value = settings.promo || '';
    adminPromoToggle.textContent = settings.promoVisible ? 'Hide' : 'Show';
    adminPromoToggle.classList.toggle('active', !!settings.promoVisible);

    adminGameUrl.value = settings.gameUrl || '';
    adminGameToggle.textContent = settings.gameVisible ? 'Hide' : 'Show';
    adminGameToggle.classList.toggle('active', !!settings.gameVisible);

    adminTaglineInput.value = settings.tagline || heroTagline.textContent;
  }

  function applyAdminSettings() {
    const settings = getAdminSettings();

    // CA Banner
    if (settings.caVisible && settings.ca) {
      caBannerAddress.textContent = settings.ca;
      caBanner.style.display = 'block';
      // Adjust sound toggle position when CA banner shown
      soundToggle.style.bottom = '4rem';
    } else {
      caBanner.style.display = 'none';
      soundToggle.style.bottom = '';
    }

    // Promo Banner
    if (settings.promoVisible && settings.promo) {
      promoBannerText.textContent = settings.promo;
      promoBanner.style.display = 'block';
    } else {
      promoBanner.style.display = 'none';
    }

    // Game Button
    if (settings.gameVisible && settings.gameUrl) {
      gameEntryBtn.href = settings.gameUrl;
      gameEntryBtn.style.display = 'inline-flex';
    } else {
      gameEntryBtn.style.display = 'none';
    }

    // Tagline
    if (settings.tagline) {
      heroTagline.textContent = settings.tagline;
    }
  }

  /* ═══════════════════════════════════════════════
     12. INITIALIZE
     ═══════════════════════════════════════════════ */
  async function init() {
    await simulateLoading();
    loader.classList.add('hidden');

    initScrollAnimations();
    initAudio();
    initMobileNav();
    initSmoothScroll();
    initNavbarEffect();
    initInteractions();
    initModals();
    initWallet();
    initStaking();
    initAdmin();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
