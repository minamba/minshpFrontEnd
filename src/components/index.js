import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import {Link, NavLink, useParams} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateProductUserRequest } from '../lib/actions/ProductActions';
import { updateStockRequest } from '../lib/actions/StockActions';
import { getProductUserRequest } from '../lib/actions/ProductActions';
import { addProductUserRequest } from '../lib/actions/ProductActions';
import { postUploadRequest } from '../lib/actions/UploadActions';
import { deleteProductUserRequest } from '../lib/actions/ProductActions';
import { getFeaturesCategoryByProductRequest } from '../lib/actions/FeatureCategoryActions';
import { useDispatch } from 'react-redux'; 
import { useMemo } from "react";
import { Badge } from 'react-bootstrap';

// ... ton code existant ...

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  // Catégories
  const categories = useSelector((s) => s.categories?.categories) || [];

  // 🛒 LIRE LE PANIER DEPUIS REDUX
  // Vu ton combineReducers, le reducer "cart" est sous la clé "items"
  const cartItems = useSelector((s) => s.items?.items) || [];

  // Total d'articles = somme des quantités
  const cartCount = cartItems.reduce(
    (acc, it) => acc + Number(it.qty ?? it.quantity ?? 1),
    0
  );

  // petite anim quand la valeur change
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (cartCount <= 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [cartCount]);

  const toggleMenu = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (!next) {
      setAdminOpen(false);
      setProductsOpen(false);
    }
  };

  const toggleAdmin = () => {
    if (window.innerWidth <= 900) {
      setAdminOpen((v) => !v);
      setProductsOpen(false);
    }
  };

  const toggleProducts = () => {
    if (window.innerWidth <= 900) {
      setProductsOpen((v) => !v);
      setAdminOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setAdminOpen(false);
      setProductsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/">
            <img className="logo-img" src="../images/logo_16.png" alt="Logo" />
          </a>
        </div>

        {/* Liens */}
        <div className={`navbar-links ${isOpen ? "active" : ""}`}>
          {/* Tous nos produits */}
          <div
            className="navbar-dropdown"
            onMouseEnter={() => window.innerWidth > 900 && setProductsOpen(true)}
            onMouseLeave={() => window.innerWidth > 900 && setProductsOpen(false)}
          >
            <button className="navbar-dropdown-toggle" onClick={toggleProducts}>
              Tous nos produits <span className={`arrow ${productsOpen ? "up" : "down"}`}>▾</span>
            </button>
            {productsOpen && (
              <div className="navbar-dropdown-menu">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      onClick={() => {
                        setIsOpen(false);
                        setProductsOpen(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <span style={{ padding: "0.5rem 1rem", opacity: 0.8 }}>
                    Aucune catégorie
                  </span>
                )}
              </div>
            )}
          </div>

          <a href="#sales">Soldes & promos</a>

          {/* Compte */}
          <Link to="/account" onClick={() => setIsOpen(false)}>
            <i className="bi bi-person-fill nav-icon nav-icon--blue" aria-hidden="true" />
            <span>Compte</span>
          </Link>

          {/* Panier + badge */}
          <Link to="/cart" onClick={() => setIsOpen(false)} className="nav-cart-link">
            <span className="nav-cart-ico">
              <i className="bi bi-cart-fill nav-icon" aria-hidden="true" />
              {/* Afficher le badge seulement si > 0 (ou laisse {cartCount} si tu préfères) */}
              {cartCount > 0 && (
                <span className={`nav-badge ${bump ? "bump" : ""}`}>{cartCount}</span>
              )}
            </span>
            <span>Panier</span>
          </Link>

          {/* Admin */}
          <div
            className="navbar-dropdown"
            onMouseEnter={() => window.innerWidth > 900 && setAdminOpen(true)}
            onMouseLeave={() => window.innerWidth > 900 && setAdminOpen(false)}
          >
            <button className="navbar-dropdown-toggle" onClick={toggleAdmin}>
              Admin <span className={`arrow ${adminOpen ? "up" : "down"}`}>▾</span>
            </button>
            {adminOpen && (
              <div className="navbar-dropdown-menu">
                <Link to="/admin/products" onClick={() => setIsOpen(false)}>Produits</Link>
                <Link to="/admin/categories" onClick={() => setIsOpen(false)}>Catégories</Link>
                <Link to="/admin/customers" onClick={() => setIsOpen(false)}>Clients</Link>
                <Link to="/admin/featureCategories" onClick={() => setIsOpen(false)}>Catégories des caractéristiques</Link>
                <Link to="/admin/stocks" onClick={() => setIsOpen(false)}>Stocks</Link>
                <Link to="/admin/promotions" onClick={() => setIsOpen(false)}>Promotions</Link>
                <Link to="/admin/features" onClick={() => setIsOpen(false)}>Caractéristiques</Link>
                <Link to="/admin/featureProducts" onClick={() => setIsOpen(false)}>Caractéristiques produits</Link>
                <Link to="/admin/images" onClick={() => setIsOpen(false)}>Images</Link>
                <Link to="/admin/videos" onClick={() => setIsOpen(false)}>Vidéos</Link>
              </div>
            )}
          </div>
        </div>

        {/* Burger */}
        <div className="navbar-toggle" onClick={toggleMenu} aria-label="Ouvrir le menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};


//////////////////////// Product Table ////////////////////////
export const ProductTable = () => {
  const productsFromStore = useSelector((state) => state.products.products) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const dispatch = useDispatch();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // Fermer modales avec ESC + bloquer le scroll quand l'une est ouverte
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', brand: '', model: '', description: '', price: '', category: '', image: '', stock: 0, promotion: 'Non', main: false });
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
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      dispatch(deleteProductUserRequest(id));
    }
  };

  const idCategory = categoriesFromStore.find((cat) => cat.name === formData.category)?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      name.includes(query) ||
      description.includes(query) ||
      brand.includes(query) ||
      model.includes(query) ||
      main.includes(query);

    const matchesCategory = categoryFilter ? category === categoryFilter : true;

    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Produits</h2>
        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter un produit
        </button>
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
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
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
              <th>Catégorie</th>
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
                  <td><img src={prod.images?.[0]?.url} alt={prod.name} width={100} /></td>
                  <td>{prod.name}</td>
                  <td>{prod.brand}</td>
                  <td>{prod.model}</td>
                  <td>{prod.description}</td>
                  <td>{prod.price}</td>
                  <td>{prod.category}</td>
                  <td>{prod.stocks?.quantity ? prod.stocks.quantity : "Rupture"}</td>
                  <td>{prod.promotions?.length > 0 ? "Oui" : "Non"}</td>
                  <td>{prod.main ? "Oui" : "Non"}</td>
                  <td>{new Date(prod.creationDate).toLocaleDateString()}</td>
                  <td>{prod.modificationDate? new Date(prod.modificationDate).toLocaleDateString() : "NM"}</td>
                  <td>
                    <button className='btn btn-sm btn-warning me-2' onClick={() => handleEditClick(prod)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className='btn btn-sm btn-danger me-2' onClick={() => handleDeleteClick(prod.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                    <button className='btn btn-sm btn-primary' onClick={() => setSelectedProduct(prod)}>
                      <i className="bi bi-card-checklist"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">Aucun produit trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal pour détails produit (classes admin-modal-*) */}
      {selectedProduct && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prod-detail-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', wordWrap: 'break-word' }}
          >
            <h3 id="prod-detail-title" className="mb-3">{selectedProduct.name}</h3>
            <hr />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedProduct.features && selectedProduct.features.length > 0 ? (
                <ul>
                  {selectedProduct.features.map((feat) => (
                    <li key={feat.id} style={{ marginBottom: '8px', textAlign: 'justify' }}>
                      {feat.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune caractéristique disponible.</p>
              )}
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/modif produit (classes admin-modal-*) */}
      {showModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prod-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
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
                <input type="text" name="model" className="form-control" value={formData.model} onChange={handleInputChange} required />
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
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categoriesFromStore.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
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
  actions = [],           // [{ label, onClick, variant: "primary"|"danger"|"light", autoFocus }]
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

  // classes buttons isolées
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
  
    return (
      <footer className="footer-container">
        <div className="footer-content">
          {/* <div className="footer-logo">
            <a href="/">MinShp</a>
          </div> */}
  
          <div className="footer-links">
            <a href="#conditions">Conditions</a>
            <a href="#privacy">Confidentialité</a>
            <a href="#contact">Contact</a>
          </div>
  
          <div className="footer-newsletter">
            <form>
              <input type="email" placeholder="Votre email" />
              <button type="submit">S'abonner</button>
            </form>
          </div>
  
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
  
          <div className="footer-copy">
            &copy; {year} MinShp. Tous droits réservés.
          </div>
        </div>
      </footer>
    );
  };

