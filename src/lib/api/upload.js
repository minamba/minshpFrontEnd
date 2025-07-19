import axios from "axios";

export const uploadFile = async ({file, Type}) => {
    try{
    const formData = new FormData();
    formData.append("file", file);
    formData.append("Type", Type);
    const response = await axios.post("/upload", formData);
    return response.data;
    }catch(error){
        console.log(error);
    }
}
