import React, { useState } from 'react';
import '../../App.css';
import {ProductTable} from '../../components/index';

export const ProductAdmin = () => {
      
    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des produits</h1>
            <ProductTable/>
        </div>
    );
};
