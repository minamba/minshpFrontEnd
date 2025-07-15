import React, { useState } from 'react';
import '../App.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import {Link, NavLink} from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';



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
          <a href="/">MonSite</a>
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



export const ProductTable = () => {
  const productsFromStore = useSelector((state) => state.products.products) || [];
  const [products, setProducts] = useState(productsFromStore);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: 0,
    promotion: 'Non',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '', price: '', category: '', image: '', stock: 0, promotion: 'Non' });
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      promotion: product.promotion,
    });
    setShowModal(true);
  };


  const handleDeleteClick = (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      // Modifier le produit
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentId ? { ...p, ...formData } : p
        )
      );
      console.log('Produit modifié:', formData);
    } else {
      // Ajouter un produit
      const newProduct = {
        ...formData,
        id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      };
      setProducts((prev) => [...prev, newProduct]);
      console.log('Produit ajouté:', newProduct);
    }
    setShowModal(false);
  };

  return (
     <div>
      <div className="d-flex justify-content-end mb-3">
        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter un produit
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Produit</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Prix (€)</th>
              <th>Catégorie</th>
              <th>Stock</th>
              <th>Promotion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td><img src={prod.image} alt={prod.name} className="img-thumbnail" width={60} /></td>
                <td>{prod.name}</td>
                <td>{prod.description}</td>
                <td>{prod.price}</td>
                <td>{prod.category}</td>
                <td>{prod.stock}</td>
                <td>{prod.promotion}</td>
                <td>
                  <button className='btn btn-sm btn-warning me-2' onClick={() => handleEditClick(prod)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className='btn btn-sm btn-danger' onClick={() => handleDeleteClick(prod.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <label>Description</label>
                <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Prix (€)</label>
                <input type="number" name="price" className="form-control" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label>Catégorie</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Projecteurs">Projecteurs</option>
                  <option value="Accessoires">Accessoires</option>
                </select>
              </div>
              <div className="mb-3">
                <label>Image du produit</label>
                <div className="d-flex align-items-center gap-2">
                  {formData.image && <img src={formData.image} alt="Aperçu" width={60} />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
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


export const Footer = () => {
    const year = new Date().getFullYear();
  
    return (
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-logo">
            <a href="/">MonSite</a>
          </div>
  
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
            &copy; {year} MonSite. Tous droits réservés.
          </div>
        </div>
      </footer>
    );
  };

