import React, { useContext, useEffect, useState } from "react";
import Container from "../../../components/Container";
import axios from "axios";
import { Button } from "../../../components/ui/button";
import { AppContext } from "../../../context/AppContext";
import { CiCirclePlus } from "react-icons/ci";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CategoryContext } from "@/context/CategoryContext";
import { ReloadIcon } from "@radix-ui/react-icons";

const NewProduct = () => {
  const { toast } = useToast();
  const {
    createCategory,
    newCategory,
    setNewCategory,
    setProductCategories,
    productCategories,
    getProductCategories,
  } = useContext(CategoryContext);
  const [product, setProduct] = useState({});
  const [mainImage, setMainImage] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e, field) => {
    setProduct({
      ...product,
      [field]: e.target.value,
    });
    setIsDisabled(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage([file]);

      const reader = new FileReader();
      reader.readAsDataURL(file);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("category", product.category);
      formData.append("description", product.description);
      formData.append("mainImage", mainImage[0]);
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("stock", product.stock);

      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast({
        title: "success",
        description: data.data.message,
      });
      setLoading(false);
      setIsDisabled(true);
    } catch (err) {
      console.log(err);
      toast({
        varinat: "destructive",
        title: "error",
        description: err.response.data.message,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductCategories();
  }, [setProductCategories]);

  useEffect(() => {
    if (mainImage.length > 0) {
      const imageUrl = URL.createObjectURL(mainImage[0]);
      setPreviewImage(imageUrl);
      console.log(imageUrl);
    }
  }, [mainImage, setPreviewImage]);

  return (
    <Container className="flex justify-center items-center h-screen">
      <Card>
        <form onSubmit={(e) => createProduct(e)}>
          <CardHeader>
            <CardTitle className="text-2xl mb-3 text-center">
              Create Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="my-2">
              <Label htmlFor="name">Product name:</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => handleInputChange(e, "name")}
                placeholder="Enter your Product Name"
                required
              />
            </div>
            <div className="my-2">
              <Label htmlFor="description">Product description:</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange(e, "description")}
                placeholder="Enter product description"
              />
            </div>
            <div className="my-2">
              <Label htmlFor="price">Product price:</Label>
              <Input
                id="price"
                type="number"
                value={product.price}
                onChange={(e) => handleInputChange(e, "price")}
                placeholder="Enter product price"
                required
              />
            </div>
            <div className="my-2">
              <Label htmlFor="category">Product Category:</Label>
              <div className="flex space-x-3 my-3 rounded">
                <Select
                  id="category"
                  defaultValue={product.category}
                  onValueChange={(value) =>
                    setProduct({ ...product, category: value })
                  }
                  value={product.category}
                  required
                  className="w-full"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>none</SelectLabel>
                      {productCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" type="button" className="text-2xl">
                      <CiCirclePlus />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl">
                        Create Category
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createCategory}>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="name">Category name</Label>
                        <Input
                          id="name"
                          value={newCategory}
                          className="col-span-3"
                          onChange={(e) => setNewCategory(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">create</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="my-2">
              <Label htmlFor="stock">Product stock:</Label>
              <Input
                id="stock"
                type="number"
                value={product.stock}
                onChange={(e) => handleInputChange(e, "stock")}
                placeholder="Enter product stock"
              />
            </div>
            <div className="my-2">
              <Label htmlFor="mainImage">Main Image:</Label>
              <Input
                id="mainImage"
                type="file"
                onChange={(e) => {
                  handleFileChange(e);
                  setIsDisabled(false);
                }}
              />
            </div>
            <div className="my-2">
              <Label htmlFor="preview">Preview:</Label>
              <img
                id="preview"
                src={previewImage}
                alt={"selected Image"}
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />{" "}
            </div>
            <Button
              disabled={isDisabled}
              type="submit"
              className="mt-3 w-full"
              onClick={createProduct}
            >
              {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </CardContent>
        </form>
      </Card>
    </Container>
  );
};

export default NewProduct;
