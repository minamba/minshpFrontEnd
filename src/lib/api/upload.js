import axios from "axios";

export const uploadFile = async ({Id,File, Type, IdProduct, Description, TypeUpload}) => {
    try{
    const formData = new FormData();
    if(Id){
        formData.append("Id", Id);
    }
    formData.append("File", File);
    formData.append("Type", Type);
    formData.append("IdProduct", IdProduct);
    formData.append("Description", Description);
    formData.append("TypeUpload", TypeUpload);
    const response = await axios.post("/upload", formData);
    return response.data;
    }catch(error){
        console.log(error);
    }
}
