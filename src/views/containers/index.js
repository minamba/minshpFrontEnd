import { connect } from "react-redux";
import { BaseApp } from "../components/index";

export const Appcontainer = connect(
    function mapStateToProps(state){
        return {
            products : state.products
        }
    })
    (BaseApp)