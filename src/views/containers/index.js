import { connect } from "react-redux";
import { BaseApp } from "../components/index";

export const Appcontainer = connect(
    function mapStateToProps(state){
        return {
            products : state.products,
            categories : state.categories,
            stocks : state.stocks,
            promotions : state.promotions,
            features : state.features,
            featureProducts : state.featureProducts,
            orders : state.orders,
            images : state.images,
            videos : state.videos,
        }
    })
    (BaseApp)