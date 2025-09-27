import axios from "axios";

export const getProducts = () => {
    return axios.get("/productsWithoutPagination");
}

export const addProduct = (product) => {
    return axios.post("/product", product);
}

export const updateProduct = (product) => {
    return axios.put("/product", product);
}

export const deleteProduct = (id) => {
    return axios.delete(`/product/${id}`);
}


//pagination 
export const getProductsPaged = (params = {}) => {
    const usp = new URLSearchParams();
  
    if (params.page) usp.set("Page", String(params.page));
    if (params.pageSize) usp.set("PageSize", String(params.pageSize));
    if (params.search) usp.set("Search", params.search);
    if (params.sort) usp.set("Sort", params.sort);
  
    if (params.filter) {
      Object.entries(params.filter).forEach(([k, v]) => {
        if (v !== "" && v !== undefined && v !== null) {
          usp.set(`Filter.${k}`, String(v));
        }
      });
    }
  
    return axios.get(`/products?${usp.toString()}`);
  };
