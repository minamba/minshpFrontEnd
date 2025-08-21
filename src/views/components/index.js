import { Fragment } from "react";
import {Home} from './Home';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";
import {Navbar, Footer} from '../../components/index';
import {ProductAdmin} from './ProductAdmin';
import {CategoryAdmin} from './CategoryAdmin';
import {CustomerAdmin} from './CustomerAdmin';
import {StockAdmin} from './StockAdmin';
import {PromotionAdmin} from './PromotionAdmin';
import {FeatureAdmin} from './FeatureAdmin';
import {FeatureProductAdmin} from './FeatureProductAdmin';
import {OrderAdmin} from './OrderAdmin';
import {ImageAdmin} from './ImageAdmin';
import {VideoAdmin} from './VideoAdmin';
import {TaxesAdmin} from './TaxesAdmin';
import {Promotion} from './Promotion';
import {Account} from './Account/Account';
import {Category} from './Category';
import {ApplicationAdmin} from './ApplicationAdmin';
import {DeliveryPayment} from './DeliveryPayment';
import {Cart} from './Cart';
import {News} from './News';
import {FeatureCategoryAdmin} from './FeatureCategoryAdmin';
import { useDispatch } from "react-redux";
import { getProductUserRequest } from "../../lib/actions/ProductActions";
import { getCategoryRequest } from "../../lib/actions/CategoryActions";
import { getStockRequest } from "../../lib/actions/StockActions";
import { getFeatureProductRequest } from "../../lib/actions/FeatureProductActions";
import { getImageRequest } from "../../lib/actions/ImageActions";
import { getVideoRequest } from "../../lib/actions/VideoActions";
import { getFeatureCategoryRequest } from "../../lib/actions/FeatureCategoryActions";
import {Product} from './Product';
import { getFeaturesCategoryByProductRequest } from "../../lib/actions/FeatureCategoryActions";
import {PromotionCodeAdmin} from './PromotionCodeAdmin';
import { getPromotionCodesRequest } from "../../lib/actions/PromotionCodeActions";
import { getApplicationRequest } from "../../lib/actions/ApplicationActions";
import LoginPage from './Authentication/LoginPage';
import RequireAuth from './Authentication/RequireAuth'; 
import {UserInformation} from './Account/UserInformation';  
import {Address} from './Account/Address';

export const BaseApp = () => {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getProductUserRequest());
        dispatch(getCategoryRequest());
        dispatch(getStockRequest());
        dispatch(getFeatureProductRequest());
        dispatch(getImageRequest());
        dispatch(getVideoRequest());
        dispatch(getFeatureCategoryRequest());
        dispatch(getPromotionCodesRequest());
        dispatch(getApplicationRequest());
        dispatch(getApplicationRequest());
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
                        <Route path="/admin/customers" element={<CustomerAdmin/>} />
                        <Route path="/admin/stocks" element={<StockAdmin/>} />
                        <Route path="/admin/promotions" element={<PromotionAdmin/>} />
                        <Route path="/admin/features" element={<FeatureAdmin/>} />
                        <Route path="/admin/featureProducts" element={<FeatureProductAdmin/>} />
                        <Route path="/admin/orders" element={<OrderAdmin/>} />
                        <Route path="/admin/images" element={<ImageAdmin/>} />
                        <Route path="/admin/videos" element={<VideoAdmin/>} />
                        <Route path="/product/:id" element={<Product/>} />
                        <Route path="/admin/featureCategories" element={<FeatureCategoryAdmin/>} />
                        <Route path="/cart" element={<Cart/>}/>
                        <Route path="/admin/taxes" element={<TaxesAdmin/>}/>
                        <Route path="/admin/promotionCodes" element={<PromotionCodeAdmin/>}/>
                        <Route path="/category/:id" element={<Category/>}/>
                        <Route path="/promotion" element={<Promotion/>}/>
                        <Route path="/news" element={<News/>}/>
                        <Route path="/admin/application" element={<ApplicationAdmin/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/account" element={<RequireAuth><Account/></RequireAuth>}/>
                        <Route path="/deliveryPayment" element={<RequireAuth><DeliveryPayment/></RequireAuth>}/>
                        <Route path="/userInformation" element={<RequireAuth><UserInformation/></RequireAuth>}/>
                        <Route path="/address" element={<RequireAuth><Address/></RequireAuth>}/>

                        
                    </Routes>
                </main>
                <Footer/>
            </Router>
        </Fragment>
    );
};