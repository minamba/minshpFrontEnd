import React, { useState, useEffect, useRef } from 'react';
import "../styles/components/navbar.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import {Link, NavLink, useParams} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateProductUserRequest } from '../lib/actions/ProductActions';
import { updateStockRequest } from '../lib/actions/StockActions';
import { getProductUserRequest } from '../lib/actions/ProductActions';
import { addProductUserRequest } from '../lib/actions/ProductActions';
import { postUploadRequest } from '../lib/actions/UploadActions';
import { deleteProductUserRequest } from '../lib/actions/ProductActions';
import { getFeaturesCategoryByProductRequest } from '../lib/actions/FeatureCategoryActions';
import { getPackageProfilRequest } from '../lib/actions/PackageProfilActions';
import { useDispatch } from 'react-redux'; 
import { useMemo } from "react";
import { Badge } from 'react-bootstrap';
import { getPromotionCodesRequest } from '../lib/actions/PromotionCodeActions';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/actions/AccountActions';
import { calculPrice } from '../lib/utils/Helpers';
import { getUserRoles } from '../lib/utils/jwt';
import { RequireRole } from '../views/components/Authentication/RequireRole';
import { toMediaUrl } from '../lib/utils/mediaUrl';
import { addNewsletterRequest } from '../lib/actions/NewLetterActions';





export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Auth / rôles
  const token = localStorage.getItem("access_token");
  const roles = getUserRoles?.(token) || [];
  const isAdmin = roles.map((r) => String(r).toLowerCase()).includes("admin");
  const { isAuth } = useSelector((s) => s.account) || { isAuth: false };

  // --- Données catalogue
  const categories    = useSelector((s) => s.categories?.categories) || [];
  const subCategories = useSelector((s) => s.subCategories?.subCategories) || [];

  // --- Panier
  const cartItems = useSelector((s) => s.items?.items) || [];
  const cartCount = cartItems.reduce((acc, it) => acc + Number(it.qty ?? it.quantity ?? 1), 0);

  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (cartCount > 0) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 300);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  // Map sous-cat par cat
  const subsByCat = useMemo(() => {
    const m = {};
    for (const sc of subCategories) {
      const cid =
        sc?.idCategory ??
        sc?.IdCategory ??
        sc?.categoryId ??
        sc?.CategoryId ??
        sc?.parentCategoryId ??
        null;
      if (cid == null) continue;
      const k = String(cid);
      if (!m[k]) m[k] = [];
      m[k].push(sc);
    }
    return m;
  }, [subCategories]);

  // --- UI states
  const [isOpen, setIsOpen]         = useState(false); // drawer mobile
  const [productsOpen, setPOpen]    = useState(false);
  const [accountOpen, setAOpen]     = useState(false);
  const [adminOpen, setAdOpen]      = useState(false);
  const [hoverCatId, setHoverCatId] = useState(null);

  const closeAllDropdowns = () => {
    setPOpen(false);
    setAOpen(false);
    setAdOpen(false);
    setHoverCatId(null);
  };

  const toggleMenu = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (!next) closeAllDropdowns();
  };

  // Ferme les dropdowns quand on passe d’un viewport à l’autre
  useEffect(() => {
    const onResize = () => closeAllDropdowns();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ====== Verrouillage du scroll (mobile) ======
  // Technique robuste: position:fixed + mémorisation du scrollY
  const scrollYRef = useRef(0);
  useEffect(() => {
    const b = document.body;
    const html = document.documentElement;

    if (isOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;

      b.style.position = "fixed";
      b.style.top = `-${scrollYRef.current}px`;
      b.style.left = "0";
      b.style.right = "0";
      b.style.width = "100%";
      b.style.overflow = "hidden";

      // Limite l’overscroll “élastique”
      html.style.overscrollBehavior = "contain";
    } else {
      const y = Math.abs(parseInt(b.style.top || "0", 10)) || scrollYRef.current;

      b.style.position = "";
      b.style.top = "";
      b.style.left = "";
      b.style.right = "";
      b.style.width = "";
      b.style.overflow = "";

      document.documentElement.style.overscrollBehavior = "";

      // Retour à la position initiale
      window.scrollTo(0, y);
    }

    return () => {
      // cleanup safe
      b.style.position = "";
      b.style.top = "";
      b.style.left = "";
      b.style.right = "";
      b.style.width = "";
      b.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  // Helpers mobile: toggles robustes (tap + touch)
  const touchToggle =
    (fn) =>
    (e) => {
      if (e?.type === "touchend") {
        e.preventDefault();
        e.stopPropagation();
      }
      fn((v) => !v);
    };

  const mobileToggleProducts = touchToggle(setPOpen);
  const mobileToggleAccount  = touchToggle(setAOpen);
  const mobileToggleAdmin    = touchToggle(setAdOpen);

  // Click handlers (ne togglent en mobile qu’en dessous de 901px)
  const onClickProducts = () => {
    if (window.innerWidth <= 900) {
      setPOpen((v) => !v);
      setAOpen(false);
      setAdOpen(false);
    }
  };
  const onClickAccount = () => {
    if (window.innerWidth <= 900) {
      setAOpen((v) => !v);
      setPOpen(false);
      setAdOpen(false);
    }
  };
  const onClickAdmin = () => {
    if (window.innerWidth <= 900) {
      setAdOpen((v) => !v);
      setPOpen(false);
      setAOpen(false);
    }
  };

  // Liens qui ferment tout
  const onNavLink = () => {
    setIsOpen(false);
    closeAllDropdowns();
  };

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="navbar-container" role="navigation" aria-label="Navigation principale">
        <div className="navbar-content">
          {/* --- Mobile row --- */}
          <div className="navbar-row navbar-row-mobile">
            <button
              className="navbar-toggle"
              type="button"
              aria-label="Ouvrir le menu"
              onClick={toggleMenu}
              onTouchEnd={toggleMenu}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>

            <div className="navbar-logo">
              <Link to="/" onClick={onNavLink} aria-label="Accueil">
                <img className="logo-img" src="/Images/logo_16.png" alt="Min's" />
              </Link>
            </div>

            <div className="navbar-right-icons">
              <Link className="nav-ico-btn" to="/account" aria-label="Mon compte" onClick={onNavLink}>
                <i className="bi bi-person-fill nav-icon nav-icon--blue" aria-hidden="true" />
              </Link>
              <Link className="nav-ico-btn nav-cart-btn" to="/cart" aria-label="Panier" onClick={onNavLink}>
                <i className="bi bi-cart-fill nav-icon" aria-hidden="true" />
                {cartCount > 0 && <span className={`nav-badge ${bump ? "bump" : ""}`}>{cartCount}</span>}
              </Link>
            </div>
          </div>

          {/* --- Desktop row --- */}
          <div className="navbar-row navbar-row-desktop">
            <div className="navbar-left">
              <div className="navbar-logo">
                <Link to="/" onClick={closeAllDropdowns} aria-label="Accueil">
                  <img className="logo-img" src="/Images/logo_16.png" alt="Min's" />
                </Link>
              </div>
            </div>

            <div className="navbar-links">
              {/* PRODUITS (desktop + tap) */}
              <div
                className="navbar-dropdown"
                onMouseEnter={() => window.innerWidth > 900 && setPOpen(true)}
                onMouseLeave={() => {
                  if (window.innerWidth > 900) {
                    setPOpen(false);
                    setHoverCatId(null);
                  }
                }}
                onTouchStart={() => setPOpen((v) => !v)} // iPad/écrans tactiles
              >
                <button
                  className="navbar-dropdown-toggle"
                  type="button"
                  onClick={onClickProducts}
                  aria-haspopup="true"
                  aria-expanded={productsOpen}
                >
                  Tous nos produits <span className={`arrow ${productsOpen ? "up" : ""}`}>▾</span>
                </button>

                {productsOpen && (
                  <div className="flyout-root">
                    <div className="flyout-bridge" />
                    <ul className="flyout-level1">
                      {categories.length === 0 && (
                        <li className="flyout-item">
                          <span className="flyout-link" aria-disabled>Chargement…</span>
                        </li>
                      )}
                      {categories.map((cat) => {
                        const list    = subsByCat[String(cat.id)] || [];
                        const hasSubs = list.length > 0;
                        const active  = String(hoverCatId) === String(cat.id);
                        return (
                          <li
                            key={cat.id}
                            className={`flyout-item ${active ? "is-active" : ""}`}
                            onMouseEnter={() => setHoverCatId(cat.id)}
                          >
                            <Link
                              to={`/category/${cat.id}`}
                              className="flyout-link"
                              onClick={onNavLink}
                            >
                              <span>{cat.name}</span>
                              {hasSubs && <span className="flyout-arrow">›</span>}
                            </Link>

                            {hasSubs && active && (
                              <div className="flyout-level2">
                                {list.map((sc) => (
                                  <Link
                                    key={sc.id}
                                    className="flyout-sublink"
                                    to={`/subcategory/${sc.id}`}
                                    onClick={onNavLink}
                                  >
                                    {sc.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <Link to="/news" onClick={closeAllDropdowns}>Nouveautés</Link>
              <Link to="/promotion" onClick={closeAllDropdowns}>Soldes & promos</Link>

              {/* COMPTE */}
              <div
                className="navbar-dropdown"
                onMouseEnter={() => window.innerWidth > 900 && setAOpen(true)}
                onMouseLeave={() => window.innerWidth > 900 && setAOpen(false)}
                onTouchStart={() => setAOpen((v) => !v)}
              >
                <button
                  className="navbar-dropdown-toggle"
                  type="button"
                  onClick={onClickAccount}
                  aria-haspopup="true"
                  aria-expanded={accountOpen}
                >
                  <i className="bi bi-person-fill nav-icon nav-icon--blue" aria-hidden="true" />
                  <span>Compte</span>
                  <span className={`arrow ${accountOpen ? "up" : ""}`}>▾</span>
                </button>

                {accountOpen && (
                  <div className="navbar-dropdown-menu" style={{ display: "flex" }}>
                    {!isAuth ? (
                      <Link to="/login" onClick={() => { setAOpen(false); }}>
                        <i className="bi bi-box-arrow-in-right" style={{ marginRight: 6 }} />
                        Se connecter
                      </Link>
                    ) : (
                      <>
                        <Link to="/account" onClick={() => { setAOpen(false); }}>
                          <i className="bi bi-person-circle" style={{ marginRight: 6 }} />
                          Mon compte
                        </Link>
                        <button
                          className="logout-btn"
                          onClick={() => {
                            dispatch(logout());
                            setAOpen(false);
                            navigate("/login");
                          }}
                        >
                          <i className="bi bi-power" style={{ marginRight: 6 }} />
                          Déconnexion
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PANIER */}
              <Link to="/cart" onClick={closeAllDropdowns} className="nav-cart-link">
                <span className="nav-cart-ico">
                  <i className="bi bi-cart-fill nav-icon" aria-hidden="true" />
                  {cartCount > 0 && <span className={`nav-badge ${bump ? "bump" : ""}`}>{cartCount}</span>}
                </span>
                <span>Panier</span>
              </Link>

              {/* ADMIN */}
              {isAdmin && (
                <div
                  className="navbar-dropdown"
                  onMouseEnter={() => window.innerWidth > 900 && setAdOpen(true)}
                  onMouseLeave={() => window.innerWidth > 900 && setAdOpen(false)}
                  onTouchStart={() => setAdOpen((v) => !v)}
                >
                  <button
                    className="navbar-dropdown-toggle"
                    type="button"
                    onClick={onClickAdmin}
                    aria-haspopup="true"
                    aria-expanded={adminOpen}
                  >
                    Admin <span className={`arrow ${adminOpen ? "up" : ""}`}>▾</span>
                  </button>

                  {adminOpen && (
                    <div
                      className="navbar-dropdown-menu admin-menu"
                      style={{ display: "flex" }}
                      role="menu"
                      aria-label="Menu admin"
                    >
                      <Link to="/admin/application" onClick={closeAllDropdowns}>Application</Link>
                      <Link to="/admin/billingAddress" onClick={closeAllDropdowns}>Adresses de facturation</Link>
                      <Link to="/admin/deliveryAddress" onClick={closeAllDropdowns}>Adresses de livraison</Link>
                      <Link to="/admin/categories" onClick={closeAllDropdowns}>Catégories</Link>
                      <Link to="/admin/subCategory" onClick={closeAllDropdowns}>Sous catégories</Link>
                      <Link to="/admin/features" onClick={closeAllDropdowns}>Caractéristiques</Link>
                      <Link to="/admin/featureProducts" onClick={closeAllDropdowns}>Caractéristiques produits</Link>
                      <Link to="/admin/featureCategories" onClick={closeAllDropdowns}>Catégories des caractéristiques</Link>
                      <Link to="/admin/customers" onClick={closeAllDropdowns}>Clients</Link>
                      <Link to="/admin/invoices" onClick={closeAllDropdowns}>Factures</Link>
                      <Link to="/admin/customerPromotions" onClick={closeAllDropdowns}>Codes promo clients</Link>
                      <Link to="/admin/promotionCodes" onClick={closeAllDropdowns}>Codes promo produits</Link>
                      <Link to="/admin/orders" onClick={closeAllDropdowns}>Commandes</Link>
                      <Link to="/admin/products" onClick={closeAllDropdowns}>Produits</Link>
                      <Link to="/admin/images" onClick={closeAllDropdowns}>Images</Link>
                      <Link to="/admin/videos" onClick={closeAllDropdowns}>Vidéos</Link>
                      <Link to="/admin/stocks" onClick={closeAllDropdowns}>Stocks</Link>
                      <Link to="/admin/promotions" onClick={closeAllDropdowns}>Promotions</Link>
                      <Link to="/admin/taxes" onClick={closeAllDropdowns}>Taxes</Link>
                      <Link to="/admin/packageProfil" onClick={closeAllDropdowns}>Profils de colis</Link>
                      <Link to="/admin/newsletter" onClick={closeAllDropdowns}>Newsletter</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Overlay + Drawer mobile (GAUCHE) ===== */}
      <div
        className={`mm-overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}  // bloque le scroll de fond
      />

      <aside
        className={`mm-panel ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onTouchMove={(e) => e.stopPropagation()} // le panneau peut scroller sans propager
      >
        <div className="mm-head" style={{ paddingTop: "calc(14px + env(safe-area-inset-top,0px))" }}>
          <div className="mm-title">Menu</div>
          <button
            className="btn-light"
            onClick={() => setIsOpen(false)}
            onTouchEnd={() => setIsOpen(false)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="mm-scroller">
          {/* PRODUITS */}
          <div className="mm-section">
            <button
              className="mm-sec-btn"
              onClick={onClickProducts}
              onTouchEnd={mobileToggleProducts}
              aria-expanded={productsOpen}
              aria-controls="mm-products"
            >
              <span>Tous nos produits</span>
              <span className="mm-chevron">▾</span>
            </button>

            <div id="mm-products" className={`mm-sub ${productsOpen ? "open" : ""}`}>
              {categories.length === 0 && (
                <div className="mm-item" aria-disabled>
                  Chargement…
                </div>
              )}

              {categories.map((cat) => {
                const list = subsByCat[String(cat.id)] || [];
                const hasSubs = list.length > 0;
                return (
                  <div key={cat.id} className="mm-sub-block">
                    <Link className="mm-item" to={`/category/${cat.id}`} onClick={onNavLink}>
                      <span>{cat.name}</span>
                      {!hasSubs ? <span>›</span> : null}
                    </Link>

                    {hasSubs && (
                      <div className="mm-sub" style={{ maxHeight: "none" }}>
                        {list.map((sc) => (
                          <Link
                            key={sc.id}
                            className="mm-item"
                            to={`/subcategory/${sc.id}`}
                            onClick={onNavLink}
                            style={{ paddingLeft: 22 }}
                          >
                            {sc.name} <span>›</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liens simples */}
          <div className="mm-section">
            <Link className="mm-link" to="/news" onClick={onNavLink}>Nouveautés</Link>
            <Link className="mm-link" to="/promotion" onClick={onNavLink}>Soldes & promos</Link>
          </div>

          {/* COMPTE */}
          <div className="mm-section">
            {!isAuth ? (
              <Link className="mm-item" to="/login" onClick={onNavLink}>
                Se connecter <span>›</span>
              </Link>
            ) : (
              <>
                <Link className="mm-item" to="/account" onClick={onNavLink}>
                  Mon compte <span>›</span>
                </Link>
                <button
                  className="mm-item"
                  onClick={() => {
                    dispatch(logout());
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  onTouchEnd={() => {
                    dispatch(logout());
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  style={{ width: "100%", background: "transparent", border: 0, textAlign: "left" }}
                >
                  Déconnexion <span>↩︎</span>
                </button>
              </>
            )}
          </div>

          {/* PANIER */}
          <div className="mm-section">
            <Link className="mm-item" to="/cart" onClick={onNavLink}>
              Panier
              {cartCount > 0 && <span className="mm-badge">{cartCount}</span>}
            </Link>
          </div>

          {/* ADMIN */}
          {isAdmin && (
            <div className="mm-section">
              <button
                className="mm-sec-btn"
                onClick={onClickAdmin}
                onTouchEnd={mobileToggleAdmin}
                aria-expanded={adminOpen}
                aria-controls="mm-admin"
              >
                <span>Admin</span>
                <span className="mm-chevron">▾</span>
              </button>
              <div id="mm-admin" className={`mm-sub ${adminOpen ? "open" : ""}`}>
                <Link className="mm-item" to="/admin/application" onClick={onNavLink}>Application <span>›</span></Link>
                <Link className="mm-item" to="/admin/billingAddress" onClick={onNavLink}>Adresses de facturation <span>›</span></Link>
                <Link className="mm-item" to="/admin/deliveryAddress" onClick={onNavLink}>Adresses de livraison <span>›</span></Link>
                <Link className="mm-item" to="/admin/categories" onClick={onNavLink}>Catégories <span>›</span></Link>
                <Link className="mm-item" to="/admin/subCategory" onClick={onNavLink}>Sous catégories <span>›</span></Link>
                <Link className="mm-item" to="/admin/features" onClick={onNavLink}>Caractéristiques <span>›</span></Link>
                <Link className="mm-item" to="/admin/featureProducts" onClick={onNavLink}>Caractéristiques produits <span>›</span></Link>
                <Link className="mm-item" to="/admin/featureCategories" onClick={onNavLink}>Catégories des caractéristiques <span>›</span></Link>
                <Link className="mm-item" to="/admin/customers" onClick={onNavLink}>Clients <span>›</span></Link>
                <Link className="mm-item" to="/admin/invoices" onClick={onNavLink}>Factures <span>›</span></Link>
                <Link className="mm-item" to="/admin/customerPromotions" onClick={onNavLink}>Codes promo clients <span>›</span></Link>
                <Link className="mm-item" to="/admin/promotionCodes" onClick={onNavLink}>Codes promo produits <span>›</span></Link>
                <Link className="mm-item" to="/admin/orders" onClick={onNavLink}>Commandes <span>›</span></Link>
                <Link className="mm-item" to="/admin/products" onClick={onNavLink}>Produits <span>›</span></Link>
                <Link className="mm-item" to="/admin/images" onClick={onNavLink}>Images <span>›</span></Link>
                <Link className="mm-item" to="/admin/videos" onClick={onNavLink}>Vidéos <span>›</span></Link>
                <Link className="mm-item" to="/admin/stocks" onClick={onNavLink}>Stocks <span>›</span></Link>
                <Link className="mm-item" to="/admin/promotions" onClick={onNavLink}>Promotions <span>›</span></Link>
                <Link className="mm-item" to="/admin/taxes" onClick={onNavLink}>Taxes <span>›</span></Link>
                <Link className="mm-item" to="/admin/packageProfil" onClick={onNavLink}>Profils de colis<span>›</span></Link>
                <Link className="mm-item" to="/admin/newsletter" onClick={onNavLink}>Newsletter <span>›</span></Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: 10 }} />
      </aside>
    </>
  );
};

// //////////////////////// Product Table ////////////////////////
export const ProductTable = () => {
  const productsFromStore   = useSelector((state) => state.products.products) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];

  // 🔹 sous-catégories (plusieurs structures possibles -> fallback)
  const subCategoriesFromStore =
    useSelector((s) =>
      s.subCategories?.subCategories ||
      s.subCategories?.items ||
      s.subcategories?.subcategories ||
      s.subcategories?.items ||
      s.subcategories ||
      s.subCategories ||
      []
    ) || [];

  const packageProfils      = useSelector((s) => s.packageProfils?.packageProfils) || [];
  const dispatch = useDispatch();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    id: undefined,
    name: '',
    brand: '',
    model: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: 0,
    promotion: 'Non',
    main: false,
    packageProfilId: '',
    // 🔹 nouveau
    subCategoryId: '', // id de la sous-catégorie (optionnel)
  });

  useEffect(() => { dispatch(getProductUserRequest()); }, [dispatch]);

  useEffect(() => {
    const anyOpen = showModal || !!selectedProduct;
    document.body.classList.toggle('no-scroll', anyOpen);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (selectedProduct) setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal, selectedProduct]);

  // ---------- Helpers ID souples ----------
  const getPkgIdFromProduct = (p) =>
    p?.idPackageProfil ?? p?.IdPackageProfil ?? p?.packageProfilId ?? p?.PackageProfilId ?? p?.idPackageProfile ?? null;

  const getPkgIdFromCategory = (c) =>
    c?.idPackageProfil ?? c?.IdPackageProfil ?? c?.packageProfilId ?? c?.PackageProfilId ?? c?.idPackageProfile ?? null;

  const getSubCatIdFromProduct = (p) =>
    p?.idSubCategory ?? p?.IdSubCategory ?? p?.subCategoryId ?? p?.SubCategoryId ?? null;

  const getCatIdFromSubCategory = (sc) =>
    sc?.idCategory ?? sc?.IdCategory ?? sc?.categoryId ?? sc?.CategoryId ?? null;

  const findCategoryForProduct = (p) => {
    const pidCat = p?.idCategory ?? p?.IdCategory ?? p?.categoryId ?? p?.CategoryId ?? null;
    if (pidCat != null) {
      const byId = categoriesFromStore.find(
        (c) => String(c?.id ?? c?.Id) === String(pidCat)
      );
      if (byId) return byId;
    }
    if (p?.category) {
      const byName = categoriesFromStore.find((c) => String(c?.name) === String(p.category));
      if (byName) return byName;
    }
    return null;
  };

  const packageProfilsById = useMemo(() => {
    const m = new Map();
    for (const pp of packageProfils) {
      const id = pp?.id ?? pp?.Id;
      if (id != null) m.set(String(id), pp);
    }
    return m;
  }, [packageProfils]);

  const subCategoriesById = useMemo(() => {
    const m = new Map();
    for (const sc of subCategoriesFromStore) {
      const id = sc?.id ?? sc?.Id;
      if (id != null) m.set(String(id), sc);
    }
    return m;
  }, [subCategoriesFromStore]);

  const getPackageProfilNameForProduct = (p) => {
    let pid = getPkgIdFromProduct(p);
    if (pid == null) {
      const cat = findCategoryForProduct(p);
      pid = getPkgIdFromCategory(cat);
    }
    if (pid == null) return '—';
    const pp = packageProfilsById.get(String(pid));
    return pp?.name ?? pp?.Name ?? `#${pid}`;
  };

  const getSubCategoryNameForProduct = (p) => {
    const sid = getSubCatIdFromProduct(p);
    if (sid == null) return '—';
    const sc = subCategoriesById.get(String(sid));
    return sc?.name ?? sc?.Name ?? `#${sid}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // si la catégorie change, on réinitialise la sous-catégorie
      if (name === 'category') next.subCategoryId = '';
      return next;
    });
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      id: undefined,
      name: '',
      brand: '',
      model: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: 0,
      promotion: 'Non',
      main: false,
      packageProfilId: '',
      subCategoryId: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      description: product.description,
      price: product.price,
      category: product.category,
      main: !!product.main,
      stock: product.stocks?.quantity,
      idStock: product.stocks?.id,
      packageProfilId: (() => {
        const pid = getPkgIdFromProduct(product);
        return pid != null ? String(pid) : '';
      })(),
      // 🔹 préselection sous-catégorie si le produit en a une
      subCategoryId: (() => {
        const sid = getSubCatIdFromProduct(product);
        return sid != null ? String(sid) : '';
      })(),
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      dispatch(deleteProductUserRequest(id));
    }
  };

  // id de la catégorie sélectionnée (dans le formulaire)
  const idCategory = categoriesFromStore.find((cat) => cat.name === formData.category)?.id;
  // sous-catégories filtrées par catégorie choisie
  const filteredSubCategoriesForForm = useMemo(() => {
    if (!idCategory) return [];
    return subCategoriesFromStore.filter(
      (sc) => String(getCatIdFromSubCategory(sc)) === String(idCategory)
    );
  }, [subCategoriesFromStore, idCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pkgId = formData.packageProfilId ? Number(formData.packageProfilId) : null;
    const subCatId = formData.subCategoryId ? Number(formData.subCategoryId) : null;

    if (isEditing) {
      await dispatch(updateProductUserRequest({
        Id: formData.id,
        Name: formData.name,
        Brand: formData.brand,
        Model: formData.model,
        Description: formData.description,
        Price: formData.price,
        IdCategory: idCategory,
        Main: formData.main,
        Stock: formData.stock,
        ...(pkgId != null ? { IdPackageProfil: pkgId, PackageProfilId: pkgId } : {}),
        // 🔹 envoi optionnel de la sous-catégorie
        ...(subCatId != null ? { IdSubCategory: subCatId, SubCategoryId: subCatId } : {}),
      }));
    } else {
      await dispatch(addProductUserRequest({
        Name: formData.name,
        Brand: formData.brand,
        Model: formData.model,
        Description: formData.description,
        Price: formData.price,
        Stock: formData.stock,
        IdCategory: idCategory,
        ...(pkgId != null ? { IdPackageProfil: pkgId, PackageProfilId: pkgId } : {}),
        ...(subCatId != null ? { IdSubCategory: subCatId, SubCategoryId: subCatId } : {}),
      }));
    }
    await dispatch(getProductUserRequest());
    setShowModal(false);
  };

  const sortedProducts = useMemo(() => {
    const parse = d => (d ? Date.parse(d) : 0);
    return [...productsFromStore].sort((a, b) => {
      const diff = parse(b?.creationDate) - parse(a?.creationDate);
      return diff !== 0 ? diff : (a?.name || "").localeCompare(b?.name || "");
    });
  }, [productsFromStore]);

  const filteredProducts = sortedProducts.filter((prod) => {
    const query = searchQuery.toLowerCase();
    const name = prod.name?.toLowerCase() || '';
    const description = prod.description?.toLowerCase() || '';
    const main = prod.main ? 'oui' : 'non';
    const category = prod.category || '';
    const brand = prod.brand?.toLowerCase() || '';
    const model = prod.model?.toLowerCase() || '';
    const matchesQuery =
      name.includes(query) || description.includes(query) || brand.includes(query) || model.includes(query) || main.includes(query);
    const matchesCategory = categoryFilter ? category === categoryFilter : true;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="admin-products">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Produits</h2>
        <button className='btn btn-success' onClick={handleAddClick}>Ajouter un produit</button>
      </div>

      <div className="d-flex gap-3 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, description ou vitrine (oui/non)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categoriesFromStore.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Description</th>
              <th>Prix (€)</th>
              <th>Prix TTC (€)</th>
              <th>Catégorie</th>
              {/* 🔹 nouvelle colonne */}
              <th>Sous-catégorie</th>
              <th>Profil de colis</th>
              <th>Stock</th>
              <th>Promotion</th>
              <th>Vitrine</th>
              <th>Date création</th>
              <th>Date modif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <Link to={`/product/${prod.id}`}>
                      <img src={ toMediaUrl(prod.images?.[0]?.url)} alt={prod.name} width={100} />
                    </Link>
                  </td>
                  <td>{prod.name}</td>
                  <td>{prod.brand}</td>
                  <td>{prod.model}</td>
                  <td className="text-truncate col-desc" style={{maxWidth: 360}}>{prod.description}</td>
                  <td>{prod.price}</td>
                  <td>{prod.priceTtc}</td>
                  <td>{prod.category}</td>
                  {/* 🔹 affichage sous-catégorie */}
                  <td>{getSubCategoryNameForProduct(prod)}</td>
                  <td>{getPackageProfilNameForProduct(prod)}</td>
                  <td className={prod.stocks?.quantity ? "fw-bold" : "fw-bold text-danger"}>{prod.stocks?.quantity ? prod.stocks.quantity : "Rupture"}</td>
                  <td className={prod.promotions?.length > 0 ? "fw-bold text-success" : "fw-bold"}>{prod.promotions?.length > 0 ? "Oui" : "Non"}</td>
                  <td className={prod.main ? "fw-bold text-success" : "fw-bold"}>{prod.main ? "Oui" : "Non"}</td>
                  <td>{prod.creationDate ? new Date(prod.creationDate).toLocaleDateString() : "—"}</td>
                  <td>{prod.modificationDate ? new Date(prod.modificationDate).toLocaleDateString() : "NM"}</td>

                  <td className="table-actions">
                    <button
                      className='btn btn-warning me-2'
                      title="Modifier"
                      onClick={() => handleEditClick(prod)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className='btn btn-danger me-2'
                      title="Supprimer"
                      onClick={() => handleDeleteClick(prod.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                    <button
                      className='btn btn-secondary me-2'
                      title="Caractéristiques"
                      onClick={() => setSelectedProduct(prod)}
                    >
                      <i className="bi bi-card-checklist"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16" className="text-center">Aucun produit trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Caractéristiques */}
      {selectedProduct && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
          <div className="admin-modal-panel" role="dialog" aria-modal="true" aria-labelledby="prod-detail-title" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', wordWrap: 'break-word' }}>
            <h3 id="prod-detail-title" className="mb-3">{selectedProduct.name}</h3>
            <hr />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedProduct.features?.length ? (
                <ul>
                  {selectedProduct.features.map((feat) => (
                    <li key={feat.id} style={{ marginBottom: '8px', textAlign: 'justify' }}>{feat.description}</li>
                  ))}
                </ul>
              ) : <p>Aucune caractéristique disponible.</p>}
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modif */}
      {showModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <div className="admin-modal-panel" role="dialog" aria-modal="true" aria-labelledby="prod-edit-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="prod-edit-title" className="mb-3">{isEditing ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nom</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Marque</label>
                <input type="text" name="brand" className="form-control" value={formData.brand} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Modèle</label>
                <input type="text" name="model" className="form-control" value={formData.model} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label>Description</label>
                <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Prix (€)</label>
                <input type="number" name="price" className="form-control" value={formData.price} onChange={handleInputChange} step="0.01" required />
              </div>

              <div className="mb-3">
                <label>Catégorie</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Sélectionnez une catégorie</option>
                  {categoriesFromStore.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 🔹 Sous-catégorie (optionnelle) */}
              <div className="mb-3">
                <label>Sous-catégorie <span className="text-muted">(optionnel)</span></label>
                <select
                  name="subCategoryId"
                  className="form-select"
                  value={formData.subCategoryId}
                  onChange={handleInputChange}
                  disabled={!idCategory}
                >
                  <option value="">— Aucune —</option>
                  {filteredSubCategoriesForForm.map((sc) => (
                    <option key={sc.id ?? sc.Id} value={String(sc.id ?? sc.Id)}>
                      {sc.name ?? sc.Name ?? `#${sc.id ?? sc.Id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profil de colis */}
              <div className="mb-3">
                <label>Profil de colis</label>
                <select
                  name="packageProfilId"
                  className="form-select"
                  value={formData.packageProfilId}
                  onChange={handleInputChange}
                >
                  <option value="">— Aucun —</option>
                  {packageProfils.map((pp) => (
                    <option key={pp.id ?? pp.Id} value={String(pp.id ?? pp.Id)}>
                      {pp.name ?? pp.Name ?? `#${pp.id ?? pp.Id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Stock</label>
                <input type="number" name="stock" className="form-control" value={formData.stock ? formData.stock : 0} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Vitrine</label>
                <input type="checkbox" name="main" className="form-check-input ms-2" checked={formData.main} onChange={handleInputChange} />
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-dark">{isEditing ? 'Modifier' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



//////////////////////// Caracteristiques ////////////////////////
export const ProductSpecs = (pid) => {
 
  const products = useSelector((s) => s.products.products) || [];
  const product = products.find((p) => p.id === pid);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!pid) return;
    dispatch(getFeaturesCategoryByProductRequest(pid));
  }, [dispatch, pid]);


  // adapte le chemin si besoin
  const featuresCategoryByProduct =
    useSelector((s) => s.featureCategories?.featuresCategoryByProduct) || [];

  const specs = useMemo(() => {
    if (!product) return {};

    // --- 1) bloc FIXE ---
    const base = {
      "Informations générales": [
        { label: "Désignation", value: product?.name || product?.title || "Produit" },
        { label: "Marque", value: product?.brand || "—" },
        { label: "Modèle", value: product?.model || "—" },
      ],
    };

    // --- 2) blocs DYNAMIQUES (depuis l’API) ---
    const dynamic = Object.fromEntries(
      (featuresCategoryByProduct || []).map((cat) => [
        cat.featureCategoryName ?? cat.name ?? "Caractéristiques",
        Object.entries(cat.specs || {}).map(([label, value]) => ({
          label,
          value:
            value === null || value === undefined || value === ""
              ? "—"
              : typeof value === "boolean"
              ? value
                ? "Oui"
                : "Non"
              : String(value),
        })),
      ])
    );

    // --- 3) fusion (l’ordre d’insertion garde la section fixe en premier) ---
    return { ...base, ...dynamic };
  }, [product, featuresCategoryByProduct]);

  return specs;
};

/////////////////////// Generique MODAL AFTER ADD PRODUCT TO THE CART ////////////////////////
export const GenericModal = ({
  open,
  onClose,
  title,
  message,
  icon,
  variant = "default",   // "success" | "danger" | "warning" | "info" | "default"
  actions = [],          // [{ label, onClick, variant: "primary"|"danger"|"light", autoFocus }]
  closeOnBackdrop = true,
  closeOnEsc = true,
}) => {
  const panelRef = useRef(null);
  const autoBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && closeOnEsc) onClose?.();
    };
    window.addEventListener("keydown", onKey);

    // focus par défaut (bouton autoFocus sinon le panneau)
    setTimeout(() => {
      if (autoBtnRef.current) autoBtnRef.current.focus();
      else panelRef.current?.focus();
    }, 0);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const defaultIcons = {
    success: (
      <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
        <path fill="#16a34a" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm-1.1 13.3-3.2-3.2 1.4-1.4 1.8 1.8 4.7-4.7 1.4 1.4-6.1 6.1z"/>
      </svg>
    ),
    danger: (
      <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
        <path fill="#dc2626" d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-8h-2v6h2V8z"/>
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
        <path fill="#f59e0b" d="M1 21h22L12 2 1 21zm11-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1-5h-2V9h2v4z"/>
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
        <path fill="#2563eb" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    ),
    default: null,
  };

  // classes buttons → utilise tes styles .gbtn
  const btnClass = (v) =>
    v === "primary" ? "gbtn gbtn--primary" :
    v === "danger"  ? "gbtn gbtn--danger"  :
                      "gbtn gbtn--light";

  return (
    <div
      className="gmodal-backdrop"
      role="presentation"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`gmodal-panel ${variant ? `is-${variant}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "gmodal-title" : undefined}
        aria-describedby={message ? "gmodal-desc" : undefined}
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        {icon !== false && (icon ?? defaultIcons[variant]) ? (
          <div className="gmodal-icon">{icon ?? defaultIcons[variant]}</div>
        ) : null}

        {title && <h3 id="gmodal-title" className="gmodal-title">{title}</h3>}

        {message && (
          <div id="gmodal-desc" className="gmodal-message">{message}</div>
        )}

        {actions?.length > 0 && (
          <div className="gmodal-actions">
            {actions.map((a, i) => (
              <button
                key={`${a.label}-${i}`}
                type="button"
                className={btnClass(a.variant)}
                onClick={a.onClick}
                ref={a.autoFocus ? autoBtnRef : undefined}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

//////////////////////// Footer ////////////////////////

export const Footer = () => {
  const year = new Date().getFullYear();
  const dispatch = useDispatch();

  // Sélecteurs : adapte le chemin selon ton store
  const error           = useSelector(s => s.newsletters.error);          // null | ...
  const successMessage  = useSelector(s => s.newsletters.successMessage); // null | string
  const errorMessage    = useSelector(s => s.newsletters.errorMessage);   // null | string

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalType, setModalType] = useState("success"); // "success" | "error"

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    dispatch(addNewsletterRequest({ Mail: email, Suscribe: true }));
  };


// Ouvre la popup quand un message arrive
useEffect(() => {
  if (!submitted) return;

  if (successMessage) {
    setModalMsg(successMessage);
    setModalType("success");
    setEmail("");
    setShowModal(true);
    setSubmitted(false);
  } else if (errorMessage || error) {
    setModalMsg(errorMessage || "Ajout échoué");
    setModalType("error");
    setShowModal(true);
    setSubmitted(false);
  }
}, [submitted, successMessage, errorMessage, error]);

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#conditions">Conditions</a>
          <a href="#privacy">Confidentialité</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-newsletter mt-5">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email pour recevoir les nouveautés"
            />
            <button type="submit">S'abonner</button>
          </form>
        </div>

        <div className="footer-socials mt-5">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        </div>

        <div className="footer-copy mt-5">
          &copy; {year} Min's. Tous droits réservés.
        </div>
      </div>

      {/* Popup */}
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className={`modal-card ${modalType}`}>
            <div className="modal-icon">
              {modalType === "success" ? (
                <FaCheckCircle className="icon success" />
              ) : (
                <FaTimesCircle className="icon error" />
              )}
            </div>
            <h3 className="text-muted mt-4">{modalMsg}</h3>
            <div className="modal-actions">
              <button className="mt-4" onClick={() => setShowModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles minimaux pour la popup */}
      <style jsx>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        }
        .modal-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          text-align: center;
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        }
        .modal-icon { font-size: 64px; }
        .icon.success { color: #16a34a; }
        .icon.error { color: #dc2626; }
        .modal-actions button {
          padding: 10px 20px; border: none; border-radius: 8px;
          background: #0d6efd; color: #fff; cursor: pointer;
        }
      `}</style>
    </footer>
    );
  };

