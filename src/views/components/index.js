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
import {SubCategory} from './SubCategory';
import {BillingAddressAdmin} from './BillingAddressAdmin';
import {DeliveryAddressAdmin} from './DeliveryAddressAdmin';
import {ApplicationAdmin} from './ApplicationAdmin';
import {DeliveryPayment} from './DeliveryPayment';
import {PackageProfilAdmin} from './PackageProfilAdmin';
import {SubCategoryAdmin} from './SubCategoryAdmin';
import {InvoiceAdmin} from './InvoiceAdmin';
import {CustomerPromotionAdmin} from './CustomerPromotionAdmin';
import GeneralConditionsOfSale from './GeneralConditionsOfSale';
import {LegalNotices} from './LegalNotices';
import {PrivacyPolicy} from './LegalNotices';
import CookieConsent from './CookieConsent';
import Success from './Succes';
import {Cancel} from './Cancel';
import {Error} from './Error';
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
import { getCustomerRequest } from "../../lib/actions/CustomerActions";
import { getBillingAddressRequest } from "../../lib/actions/BillingAddressActions";
import { getDeliveryAddressRequest } from "../../lib/actions/DeliveryAddressActions";
import {Product} from './Product';
import { getFeaturesCategoryByProductRequest } from "../../lib/actions/FeatureCategoryActions";
import { getRolesRequest } from "../../lib/actions/RoleActions";
import {PromotionCodeAdmin} from './PromotionCodeAdmin';
import {NewLetterAdmin} from './NewLetterAdmin';
import { getPromotionCodesRequest } from "../../lib/actions/PromotionCodeActions";
import { getApplicationRequest } from "../../lib/actions/ApplicationActions";
import LoginPage from './Authentication/LoginPage';
import RequireAuth from './Authentication/RequireAuth'; 
import {UserInformation} from './Account/UserInformation';  
import {Address} from './Account/Address';
import {Register} from './Account/Register';
import {getOrderCustomerProductRequest} from '../../lib/actions/OrderCustomerProductActions';
import {getOrderRequest} from '../../lib/actions/OrderActions';
import {getPackageProfilRequest} from '../../lib/actions/PackageProfilActions';
import {getSubCategoryRequest} from '../../lib/actions/SubCategoryActions';
import {getContentCategoryRequest} from '../../lib/actions/ShippingActions';
import {getInvoiceRequest} from '../../lib/actions/InvoiceActions';
import useCartPriceSync from "../../hooks/useCartPriceSync";
import useAuthSync from "../../hooks/useAuthSync";
import { getPromotionRequest } from "../../lib/actions/PromotionActions";
import  ResetPassword  from "./Account/ResetPassword";
import RequireRole from './Authentication/RequireRole';
import {Notfound} from './Maintenance/Notfound';
import {Maintenance} from './Maintenance/Maintenance';
import MaintenanceGate from './Authentication/MaintenanceGate';
import { getCustomerPromotionCodeRequest } from "../../lib/actions/CustomerPromotionCodeActions";
import { getNewsletterRequest } from "../../lib/actions/NewLetterActions";
import { hasConsent } from "./CookieConsent";
import { getProductsPagedUserRequest} from "../../lib/actions/ProductActions";


export const BaseApp = () => {

    // Example: load analytics only if allowed
useEffect(() => {
    if (hasConsent("analytics")) {
      // init analytics SDK…
    }
  }, []);


    useCartPriceSync();
    useAuthSync({ tokenKeys: ["access_token"] });

    

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getApplicationRequest());
        //dispatch(getProductUserRequest());
            dispatch(getProductsPagedUserRequest({
              page: 1,
              pageSize: 1000,
              sort: "CreationDate:desc",
              // si tu as un flag côté API pour ne renvoyer que les promos, tu peux ajouter:
              // filter: { HasPromotion: true }
            }));
        dispatch(getCategoryRequest());
        dispatch(getProductUserRequest());
        dispatch(getStockRequest());
        dispatch(getFeatureProductRequest());
        dispatch(getImageRequest());
        dispatch(getVideoRequest());
        dispatch(getFeatureCategoryRequest());
        dispatch(getPromotionRequest());
        dispatch(getPromotionCodesRequest());
        dispatch(getCustomerRequest());
        dispatch(getOrderCustomerProductRequest());
        dispatch(getOrderRequest());
        dispatch(getBillingAddressRequest());
        dispatch(getDeliveryAddressRequest());
        dispatch(getPackageProfilRequest());
        dispatch(getSubCategoryRequest());
        dispatch(getContentCategoryRequest());
        dispatch(getInvoiceRequest());
        dispatch(getCustomerPromotionCodeRequest());
        dispatch(getNewsletterRequest());
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
                        {/* Admin */}
                        <Route element={<RequireRole allowed={["Admin"]} />}>
                            <Route path="/admin/products" element={<ProductAdmin/>} />
                            <Route path="/admin/categories" element={<CategoryAdmin/>} />
                            <Route path="/admin/customers" element={<CustomerAdmin/>} />
                            <Route path="/admin/stocks" element={<StockAdmin/>} />
                            <Route path="/admin/promotions" element={<PromotionAdmin/>} />
                            <Route path="/admin/features" element={<FeatureAdmin/>} />
                            <Route path="/admin/featureProducts" element={<FeatureProductAdmin/>} />
                            <Route path="/admin/images" element={<ImageAdmin/>} />
                            <Route path="/admin/videos" element={<VideoAdmin/>} />
                            <Route path="/admin/featureCategories" element={<FeatureCategoryAdmin/>} />
                            <Route path="/admin/taxes" element={<TaxesAdmin/>}/>
                            <Route path="/admin/promotionCodes" element={<PromotionCodeAdmin/>}/>
                            <Route path="/admin/application" element={<ApplicationAdmin/>}/>
                            <Route path="/admin/billingAddress" element={<RequireAuth><BillingAddressAdmin/></RequireAuth>}/>
                            <Route path="/admin/deliveryAddress" element={<RequireAuth><DeliveryAddressAdmin/></RequireAuth>}/>
                            <Route path="/admin/orders" element={<RequireAuth><OrderAdmin/></RequireAuth>}/>
                            <Route path="/admin/invoices" element={<RequireAuth><InvoiceAdmin/></RequireAuth>}/>
                            <Route path="/admin/packageProfil" element={<RequireAuth><PackageProfilAdmin/></RequireAuth>}/>
                            <Route path="/admin/subCategory" element={<RequireAuth><SubCategoryAdmin/></RequireAuth>}/>
                            <Route path="/admin/customerPromotions" element={<RequireAuth><CustomerPromotionAdmin/></RequireAuth>}/>
                            <Route path="/admin/newsletter" element={<RequireAuth><NewLetterAdmin/></RequireAuth>}/>
                        </Route>

                        {/* Other page */}
                        {/* // toutes les pages qui sont en dehors de l'admin redirige vers la page de maintenance quand l'appli est en maintenance */}
                        <Route element={<MaintenanceGate />}>
                            <Route path="/" element={<Home/>} /> 
                            <Route path="/product/:id" element={<Product/>} />
                            <Route path="/cart" element={<Cart/>}/>
                            <Route path="/category/:id" element={<Category/>}/>
                            <Route path="/promotion" element={<Promotion/>}/>
                            <Route path="/news" element={<News/>}/>
                            <Route path="/deliveryPayment" element={<RequireAuth><DeliveryPayment/></RequireAuth>}/>
                            <Route path="/userInformation" element={<RequireAuth><UserInformation/></RequireAuth>}/>
                            <Route path="/address" element={<RequireAuth><Address/></RequireAuth>}/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/subCategory/:id" element={<SubCategory/>}/>
                            <Route path="/account" element={ <RequireAuth><Account /></RequireAuth> } /> fallback si pas d'id
                            <Route path="/success" element={<Success/>}/>
                            <Route path="/cancel" element={<Cancel/>}/>
                            <Route path="/error" element={<Error/>}/>
                            <Route path="/reset-password" element={<ResetPassword/>}/>
                            <Route path="*" element={<Notfound/>}/>
                            <Route path="/maintenance" element={<Maintenance/>}/>
                        </Route>
                            {/* je  laisse la page de connexion accessible quand meme pour les admins */}
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/generalConditionsOfSales" element={<GeneralConditionsOfSale/>}/>
                            <Route path="/legalNotices" element={<LegalNotices/>}/>
                            <Route path="/privacyPolicy" element={<PrivacyPolicy/>}/>
                             
                    </Routes>
                </main>
                {/* <CookieConsent/> */}
                <Footer/>
            </Router>
        </Fragment>
    );
};