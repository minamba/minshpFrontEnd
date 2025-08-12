import React, { useState } from 'react';
import '../App.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import {Link, NavLink, useParams} from 'react-router-dom';
import { useEffect } from 'react';
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



export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setAdminOpen(false); // ferme sous-menu si on ferme le burger
  };

  const toggleAdmin = () => {
    if (window.innerWidth <= 900) {
      // clic uniquement en mobile
      setAdminOpen(!adminOpen);
    }
  };

  // ferme le sous-menu au resize (si on passe desktop <-> mobile)
  useEffect(() => {
    const handleResize = () => setAdminOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo">
          <a href="/">
          <img className="logo-img" src="../images/logo3.png" alt="Logo"/></a>
        </div>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <a href="#products">Tous nos produits</a>
          <a href="#sales">Soldes & promos</a>

          <div
            className="navbar-dropdown"
            onMouseEnter={() => window.innerWidth > 900 && setAdminOpen(true)}
            onMouseLeave={() => window.innerWidth > 900 && setAdminOpen(false)}
          >
            <button className="navbar-dropdown-toggle" onClick={toggleAdmin}>
              Admin <span className={`arrow ${adminOpen ? 'up' : 'down'}`}>▾</span>
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
                <Link to="/admin/orders" onClick={() => setIsOpen(false)}>Commandes</Link>
                <Link to="/admin/images" onClick={() => setIsOpen(false)}>Images</Link>
                <Link to="/admin/videos" onClick={() => setIsOpen(false)}>Vidéos</Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
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
    const parse = d => (d ? Date.parse(d) : 0); // renvoie un nombre ou 0 si null/undefined
    return [...productsFromStore].sort((a, b) => {
      const diff = parse(b?.creationDate) - parse(a?.creationDate);
      // fallback stable si dates égales ou invalides
      return diff !== 0
        ? diff
        : (a?.name || "").localeCompare(b?.name || "");
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

      {/* Modal pour détails produit */}
      {selectedProduct && (
        <div className="modal-backdrop">
          <div className="modal-content-custom" style={{ maxWidth: '600px', wordWrap: 'break-word' }}>
            <h3 className="mb-3">{selectedProduct.name}</h3>
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

      {/* Modal ajout/modif produit */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h2 className="mb-3">{isEditing ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
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

