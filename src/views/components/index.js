import { Fragment } from "react";
import {Home} from './Home';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";
import {Navbar, Footer} from '../../components/index';
import {ProductAdmin} from './ProductAdmin';
import {CategoryAdmin} from './CategoryAdmin';
import { useDispatch } from "react-redux";
import { getProductUserRequest } from "../../lib/actions/ProductActions";

export const BaseApp = () => {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getProductUserRequest());
    }, []);

    useEffect(() => {
        AOS.init({ duration: 1000 });
      }, []);

    return (
        <Fragment>
            <Router>
                <Navbar/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>} />
                        <Route path="/admin/products" element={<ProductAdmin/>} />
                        <Route path="/admin/categories" element={<CategoryAdmin/>} />
                    </Routes>
                </main>
                <Footer/>
            </Router>
        </Fragment>
    );
};