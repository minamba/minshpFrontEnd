import axios from "axios";

export const uploadFile = async ({File, Type, IdProduct, Description}) => {
    try{
    const formData = new FormData();
    formData.append("File", File);
    formData.append("Type", Type);
    formData.append("IdProduct", IdProduct);
    formData.append("Description", Description);
    const response = await axios.post("/upload", formData);
    return response.data;
    }catch(error){
        console.log(error);
    }
}
